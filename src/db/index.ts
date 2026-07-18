import Dexie, { Table } from 'dexie';
import type { Course, ExamPaper, Question, UploadedFile } from '@/types';

class AppDatabase extends Dexie {
  courses!: Table<Course, string>;
  papers!: Table<ExamPaper, string>;
  questions!: Table<Question, string>;
  files!: Table<UploadedFile, string>;

  constructor() {
    super('EnglishPreviewDB');
    this.version(1).stores({
      courses: 'id, name, unit, createdAt, updatedAt, analysisStatus',
      papers: 'id, courseId, name, totalScore, uploadedAt',
      questions: 'id, paperId, number, type, score',
      files: 'id, courseId, type, name, uploadedAt',
    });
  }
}

export const db = new AppDatabase();

export default db;
