export type KnowledgeLevel1 = 'grammar' | 'vocabulary' | 'reading' | 'writing';

export type QuestionType = 'choice' | 'fill' | 'reading' | 'writing' | 'translation' | 'cloze';

export type FileType = 'textbook' | 'exam_paper' | 'teaching_plan' | 'class_notes';

export interface KnowledgePoint {
  level1: KnowledgeLevel1;
  level2: string;
  level3: string;
}

export interface Question {
  id: string;
  paperId: string;
  number: number;
  type: QuestionType;
  score: number;
  surfaceContent: string;
  deepGoal: string;
  judgmentBasis: string;
  errorRisk: string;
  knowledgePoints: KnowledgePoint[];
}

export interface ExamPaper {
  id: string;
  courseId: string;
  name: string;
  fileName?: string;
  totalScore: number;
  questionCount: number;
  questions: Question[];
  uploadedAt: Date;
}

export interface Textbook {
  id: string;
  courseId: string;
  name: string;
  fileName?: string;
  unit: string;
  section: string;
  uploadedAt: Date;
}

export interface UploadedFile {
  id: string;
  courseId: string;
  type: FileType;
  name: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
}

export interface KnowledgeRanking {
  id: string;
  courseId: string;
  rank: number;
  stars: 3 | 4 | 5;
  name: string;
  appearCount: number;
  questionTypes: QuestionType[];
  totalScore: number;
  reason: string;
  evidence: Array<{
    paperName: string;
    paperId: string;
    questionNumber: number;
    questionId: string;
  }>;
}

export interface PreviewSection {
  title: string;
  duration: string;
  timeRange: string;
  goal: string;
  focus: string;
  content: string[];
}

export interface TextbookMapping {
  knowledge: string;
  textbookPosition: string;
  previewContent: string[];
}

export interface AIJudgment {
  confirmed: string[];
  inferred: string[];
  pending: string[];
}

export interface FullReport {
  courseId: string;
  overallAnalysis: {
    examScope: string;
    questionTypes: string[];
    difficulty: string;
    mainDirection: string;
  };
  knowledgeRankings: KnowledgeRanking[];
  evidenceChain: string;
  textbookMappings: TextbookMapping[];
  previewPlan: {
    section1: PreviewSection;
    section2: PreviewSection;
    section3: PreviewSection;
    classReminders: string[];
  };
  riskWarnings: string[];
  aiJudgment: AIJudgment;
  generatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  unit: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  papers: ExamPaper[];
  textbook?: Textbook;
  uploadedFiles: UploadedFile[];
  report?: FullReport;
  analysisStatus: 'pending' | 'analyzing' | 'completed';
}

export const questionTypeLabels: Record<QuestionType, string> = {
  choice: '选择题',
  fill: '填空题',
  reading: '阅读理解',
  writing: '写作',
  translation: '翻译题',
  cloze: '完形填空',
};

export const knowledgeLevel1Labels: Record<KnowledgeLevel1, string> = {
  grammar: '语法',
  vocabulary: '词汇',
  reading: '阅读',
  writing: '写作',
};

export const fileTypeLabels: Record<FileType, string> = {
  textbook: '英语教材',
  exam_paper: '考试试卷',
  teaching_plan: '老师教案',
  class_notes: '课堂笔记',
};
