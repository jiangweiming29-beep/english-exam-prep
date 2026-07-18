import { create } from 'zustand';
import type { Course, ExamPaper, Question, FullReport, UploadedFile, KnowledgeRanking } from '@/types';
import { allMockCourses, generateId, sampleReport } from '@/data/mockData';

interface AppState {
  courses: Course[];
  currentCourseId: string | null;
  isLoading: boolean;
  
  initMockData: () => void;
  setCurrentCourse: (id: string | null) => void;
  getCurrentCourse: () => Course | undefined;
  
  createCourse: (name: string, unit: string) => Course;
  deleteCourse: (id: string) => void;
  
  addPaper: (courseId: string, paper: Omit<ExamPaper, 'id' | 'courseId' | 'uploadedAt'>) => void;
  addUploadedFile: (courseId: string, file: Omit<UploadedFile, 'id' | 'courseId' | 'uploadedAt'>) => void;
  removeUploadedFile: (courseId: string, fileId: string) => void;
  
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  
  generateReport: (courseId: string) => FullReport;
  setAnalysisStatus: (courseId: string, status: Course['analysisStatus']) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  courses: [],
  currentCourseId: null,
  isLoading: false,

  initMockData: () => {
    set({ courses: allMockCourses, currentCourseId: 'course1' });
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
    set(state => ({
      courses: [...state.courses, newCourse],
      currentCourseId: newCourse.id,
    }));
    return newCourse;
  },

  deleteCourse: (id) => {
    set(state => ({
      courses: state.courses.filter(c => c.id !== id),
      currentCourseId: state.currentCourseId === id ? null : state.currentCourseId,
    }));
  },

  addPaper: (courseId, paper) => {
    const newPaper: ExamPaper = {
      ...paper,
      id: generateId(),
      courseId,
      uploadedAt: new Date(),
    };
    set(state => ({
      courses: state.courses.map(c =>
        c.id === courseId
          ? { ...c, papers: [...c.papers, newPaper], updatedAt: new Date() }
          : c
      ),
    }));
  },

  addUploadedFile: (courseId, file) => {
    const newFile: UploadedFile = {
      ...file,
      id: generateId(),
      courseId,
      uploadedAt: new Date(),
    };
    set(state => ({
      courses: state.courses.map(c =>
        c.id === courseId
          ? { ...c, uploadedFiles: [...c.uploadedFiles, newFile], updatedAt: new Date() }
          : c
      ),
    }));
  },

  removeUploadedFile: (courseId, fileId) => {
    set(state => ({
      courses: state.courses.map(c =>
        c.id === courseId
          ? {
              ...c,
              uploadedFiles: c.uploadedFiles.filter(f => f.id !== fileId),
              updatedAt: new Date(),
            }
          : c
      ),
    }));
  },

  updateQuestion: (questionId, updates) => {
    set(state => ({
      courses: state.courses.map(c => ({
        ...c,
        papers: c.papers.map(p => ({
          ...p,
          questions: p.questions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        })),
        updatedAt: new Date(),
      })),
    }));
  },

  generateReport: (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    if (!course) return sampleReport;

    const report: FullReport = {
      ...sampleReport,
      courseId,
      generatedAt: new Date(),
    };

    set(state => ({
      courses: state.courses.map(c =>
        c.id === courseId
          ? { ...c, report, analysisStatus: 'completed' as const, updatedAt: new Date() }
          : c
      ),
    }));

    return report;
  },

  setAnalysisStatus: (courseId, status) => {
    set(state => ({
      courses: state.courses.map(c =>
        c.id === courseId
          ? { ...c, analysisStatus: status, updatedAt: new Date() }
          : c
      ),
    }));
  },
}));
