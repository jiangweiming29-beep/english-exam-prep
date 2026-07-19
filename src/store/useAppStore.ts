import { create } from 'zustand';
import type { Course, ExamPaper, Question, FullReport, UploadedFile, KnowledgeRanking } from '@/types';
import { allMockCourses, generateId, sampleReport } from '@/data/mockData';
import { analyzePaperText, generateFullReport } from '@/services/analysisEngine';
import { db } from '@/db';

interface AppState {
  courses: Course[];
  currentCourseId: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  hasInitedMock: boolean;
  
  initMockData: () => void;
  hydrateFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
  setCurrentCourse: (id: string | null) => void;
  getCurrentCourse: () => Course | undefined;
  
  createCourse: (name: string, unit: string) => Course;
  deleteCourse: (id: string) => Promise<void>;
  
  addPaper: (courseId: string, paper: Omit<ExamPaper, 'id' | 'courseId' | 'uploadedAt'>) => void;
  addUploadedFile: (courseId: string, file: Omit<UploadedFile, 'id' | 'courseId' | 'uploadedAt'>) => string;
  removeUploadedFile: (courseId: string, fileId: string) => void;
  updateUploadedFile: (courseId: string, fileId: string, updates: Partial<UploadedFile>) => void;
  
  analyzeUploadedPapers: (courseId: string) => Promise<void>;
  
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  
  generateReport: (courseId: string) => FullReport;
  setAnalysisStatus: (courseId: string, status: Course['analysisStatus']) => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(courses: Course[]) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await db.courses.clear();
      if (courses.length > 0) {
        await db.courses.bulkPut(courses as any[]);
      }
    } catch (e) {
      console.error('Failed to save to DB:', e);
    }
  }, 300);
}

export const useAppStore = create<AppState>((set, get) => ({
  courses: [],
  currentCourseId: null,
  isLoading: false,
  isHydrated: false,
  hasInitedMock: false,

  hydrateFromDB: async () => {
    try {
      const savedCourses = await db.courses.orderBy('updatedAt').reverse().toArray();
      const hasInitedMock = localStorage.getItem('hasInitedMock') === 'true';
      if (savedCourses.length > 0) {
        set({ courses: savedCourses as Course[], isHydrated: true, hasInitedMock });
      } else {
        set({ isHydrated: true, hasInitedMock });
      }
    } catch (e) {
      console.error('Failed to load from DB:', e);
      set({ isHydrated: true });
    }
  },

  saveToDB: async () => {
    const { courses } = get();
    try {
      await db.courses.clear();
      if (courses.length > 0) {
        await db.courses.bulkPut(courses as any[]);
      }
    } catch (e) {
      console.error('Failed to save to DB:', e);
    }
  },

  initMockData: () => {
    set({ courses: allMockCourses, currentCourseId: 'course1', hasInitedMock: true });
    localStorage.setItem('hasInitedMock', 'true');
    debouncedSave(allMockCourses);
  },

  setCurrentCourse: (id) => {
    set({ currentCourseId: id });
  },

  getCurrentCourse: () => {
    const { courses, currentCourseId } = get();
    return courses.find(c => c.id === currentCourseId);
  },

  createCourse: (name, unit) => {
    const newCourse: Course = {
      id: generateId(),
      name,
      unit,
      createdAt: new Date(),
      updatedAt: new Date(),
      papers: [],
      uploadedFiles: [],
      analysisStatus: 'pending',
    };
    const newCourses = [...get().courses, newCourse];
    set({ courses: newCourses, currentCourseId: newCourse.id });
    debouncedSave(newCourses);
    return newCourse;
  },

  deleteCourse: async (id) => {
    const newCourses = get().courses.filter(c => c.id !== id);
    set({
      courses: newCourses,
      currentCourseId: get().currentCourseId === id ? null : get().currentCourseId,
    });
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    try {
      await db.courses.delete(id);
    } catch (e) {
      console.error('Failed to delete course from DB:', e);
    }
  },

  addPaper: (courseId, paper) => {
    const newPaper: ExamPaper = {
      ...paper,
      id: generateId(),
      courseId,
      uploadedAt: new Date(),
    };
    const newCourses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, papers: [...c.papers, newPaper], updatedAt: new Date() }
        : c
    );
    set({ courses: newCourses });
    debouncedSave(newCourses);
  },

  addUploadedFile: (courseId, file) => {
    const newFile: UploadedFile = {
      ...file,
      id: generateId(),
      courseId,
      uploadedAt: new Date(),
    };
    const newCourses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, uploadedFiles: [...c.uploadedFiles, newFile], updatedAt: new Date() }
        : c
    );
    set({ courses: newCourses });
    debouncedSave(newCourses);
    return newFile.id;
  },

  removeUploadedFile: (courseId, fileId) => {
    const newCourses = get().courses.map(c =>
      c.id === courseId
        ? {
            ...c,
            uploadedFiles: c.uploadedFiles.filter(f => f.id !== fileId),
            updatedAt: new Date(),
          }
        : c
    );
    set({ courses: newCourses });
    debouncedSave(newCourses);
  },

  updateUploadedFile: (courseId, fileId, updates) => {
    const newCourses = get().courses.map(c =>
      c.id === courseId
        ? {
            ...c,
            uploadedFiles: c.uploadedFiles.map(f =>
              f.id === fileId ? { ...f, ...updates } : f
            ),
            updatedAt: new Date(),
          }
        : c
    );
    set({ courses: newCourses });
    debouncedSave(newCourses);
  },

  analyzeUploadedPapers: async (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    if (!course) return;

    const analyzingCourses = get().courses.map(c =>
      c.id === courseId ? { ...c, analysisStatus: 'analyzing' as const, updatedAt: new Date() } : c
    );
    set({ courses: analyzingCourses });
    debouncedSave(analyzingCourses);

    await new Promise(resolve => setTimeout(resolve, 500));

    const paperFiles = course.uploadedFiles.filter(f => f.type === 'exam_paper' && f.extractedText);
    const newPapers: ExamPaper[] = [];

    for (const file of paperFiles) {
      if (file.extractedText) {
        const paper = analyzePaperText(file.name, courseId, file.extractedText);
        newPapers.push(paper);
      }
    }

    const report = generateFullReport(courseId, course.name, course.unit, newPapers);

    const finalCourses = get().courses.map(c =>
      c.id === courseId
        ? {
            ...c,
            papers: [...c.papers, ...newPapers],
            report,
            analysisStatus: 'completed' as const,
            updatedAt: new Date(),
          }
        : c
    );
    set({ courses: finalCourses });
    debouncedSave(finalCourses);
  },

  updateQuestion: (questionId, updates) => {
    const newCourses = get().courses.map(c => ({
      ...c,
      papers: c.papers.map(p => ({
        ...p,
        questions: p.questions.map(q =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      })),
      updatedAt: new Date(),
    }));
    set({ courses: newCourses });
    debouncedSave(newCourses);
  },

  generateReport: (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    if (!course) return sampleReport;

    const report: FullReport = {
      ...sampleReport,
      courseId,
      generatedAt: new Date(),
    };

    const newCourses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, report, analysisStatus: 'completed' as const, updatedAt: new Date() }
        : c
    );
    set({ courses: newCourses });
    debouncedSave(newCourses);

    return report;
  },

  setAnalysisStatus: (courseId, status) => {
    const newCourses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, analysisStatus: status, updatedAt: new Date() }
        : c
    );
    set({ courses: newCourses });
    debouncedSave(newCourses);
  },
}));
