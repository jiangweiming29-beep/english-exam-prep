import { useState, useMemo } from 'react';
import {
  FileText,
  Target,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  ListOrdered,
} from 'lucide-react';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { StarRating } from '@/components/StarRating';
import { useAppStore } from '@/store/useAppStore';
import { questionTypeLabels, knowledgeLevel1Labels } from '@/types';
import type { Question, QuestionType, ExamPaper } from '@/types';
import { cn } from '@/lib/utils';

type FilterType = 'all' | QuestionType;

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部题型' },
  { value: 'choice', label: questionTypeLabels.choice },
  { value: 'fill', label: questionTypeLabels.fill },
  { value: 'cloze', label: questionTypeLabels.cloze },
  { value: 'reading', label: questionTypeLabels.reading },
  { value: 'translation', label: questionTypeLabels.translation },
  { value: 'writing', label: questionTypeLabels.writing },
];

function calculateStars(question: Question): number {
  const score = question.score;
  const kpCount = question.knowledgePoints.length;
  let stars = 2;
  if (score >= 10) stars += 2;
  else if (score >= 5) stars += 1;
  if (kpCount >= 3) stars += 1;
  else if (kpCount >= 2) stars += 0;
  return Math.min(5, Math.max(1, stars));
}

function CollapsibleCard({
  icon: Icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
  accentColor = 'primary',
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: 'primary' | 'accent' | 'emerald' | 'rose';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      iconBg: 'bg-primary-100',
      border: 'border-primary-100',
    },
    accent: {
      bg: 'bg-accent-50',
      text: 'text-accent-700',
      iconBg: 'bg-accent-100',
      border: 'border-accent-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      iconBg: 'bg-rose-100',
      border: 'border-rose-100',
    },
  }[accentColor];

  return (
    <div className={cn(
      'card overflow-hidden transition-all duration-300',
      isOpen ? 'shadow-card-hover' : ''
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-4 p-5 text-left transition-colors',
          colorClasses.bg,
          'hover:brightness-95'
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          colorClasses.iconBg
        )}>
          <Icon size={20} className={colorClasses.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold', colorClasses.text)}>{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
          colorClasses.iconBg
        )}>
          {isOpen ? (
            <ChevronUp size={18} className={colorClasses.text} />
          ) : (
            <ChevronDown size={18} className={colorClasses.text} />
          )}
        </div>
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-500 ease-in-out',
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-5 border-t border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}

function QuestionDetail({ question, paper }: { question: Question; paper: ExamPaper }) {
  const stars = calculateStars(question);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card card-content bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent-400 text-sm font-medium">{paper.name}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">第 {question.number} 题</h2>
              <p className="text-primary-200 text-sm">{questionTypeLabels[question.type]}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent-400">{question.score}</div>
              <div className="text-primary-300 text-sm">分</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-primary-200 text-sm">重要度</span>
            <StarRating stars={stars} size={18} />
          </div>
        </div>
      </div>

      <CollapsibleCard
        icon={FileText}
        title="基础信息"
        subtitle="试卷名称、题号、题型、分值"
        accentColor="primary"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">试卷名称</div>
            <div className="font-semibold text-primary-900">{paper.name}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">题号</div>
            <div className="font-semibold text-primary-900">第 {question.number} 题</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">题型</div>
            <div className="font-semibold text-primary-900">{questionTypeLabels[question.type]}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">分值</div>
            <div className="font-semibold text-accent-600">{question.score} 分</div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        icon={Lightbulb}
        title="表面考查内容"
        subtitle="题目直接呈现的考查点"
        accentColor="accent"
        defaultOpen={true}
      >
        <div className="p-4 bg-accent-50/50 rounded-xl border border-accent-100">
          <p className="text-slate-700 leading-relaxed">{question.surfaceContent}</p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        icon={Target}
        title="深层考查目标 + 判断依据"
        subtitle="题目真正要考查的核心能力"
        accentColor="emerald"
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
              <Target size={16} />
              深层考查目标
            </div>
            <p className="text-slate-700 leading-relaxed">{question.deepGoal}</p>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              判断依据
            </div>
            <p className="text-slate-700 leading-relaxed">{question.judgmentBasis}</p>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        icon={BookOpen}
        title="对应知识点"
        subtitle="一级 / 二级 / 三级知识点"
        accentColor="primary"
        defaultOpen={true}
      >
        <div className="space-y-3">
          {question.knowledgePoints.map((kp, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary-100 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="tag bg-primary-100 text-primary-700">
                      {knowledgeLevel1Labels[kp.level1]}
                    </span>
                    <span className="text-slate-400">›</span>
                    <span className="text-sm font-medium text-slate-700">{kp.level2}</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-sm font-semibold text-primary-700">{kp.level3}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">一级</span>
                    <span className="text-slate-300">→</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded">二级</span>
                    <span className="text-slate-300">→</span>
                    <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded font-medium">三级</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        icon={AlertTriangle}
        title="错误风险分析"
        subtitle="学生容易出错的地方"
        accentColor="rose"
        defaultOpen={true}
      >
        <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed">{question.errorRisk}</p>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}

export default function QuestionsAnalysis() {
  const { getCurrentCourse } = useAppStore();
  const course = getCurrentCourse();
  
  const [selectedPaperId, setSelectedPaperId] = useState<string>(course?.papers[0]?.id || '');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    course?.papers[0]?.questions[0]?.id || ''
  );
  const [filterType, setFilterType] = useState<FilterType>('all');

  const currentPaper = useMemo(() => {
    return course?.papers.find(p => p.id === selectedPaperId) || course?.papers[0];
  }, [course, selectedPaperId]);

  const filteredQuestions = useMemo(() => {
    if (!currentPaper) return [];
    if (filterType === 'all') return currentPaper.questions;
    return currentPaper.questions.filter(q => q.type === filterType);
  }, [currentPaper, filterType]);

  const selectedQuestion = useMemo(() => {
    if (!currentPaper) return null;
    return currentPaper.questions.find(q => q.id === selectedQuestionId) || currentPaper.questions[0];
  }, [currentPaper, selectedQuestionId]);

  const handlePaperChange = (paperId: string) => {
    setSelectedPaperId(paperId);
    const paper = course?.papers.find(p => p.id === paperId);
    if (paper && paper.questions.length > 0) {
      setSelectedQuestionId(paper.questions[0].id);
    }
  };

  if (!course || !currentPaper || !selectedQuestion) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无试卷数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  return (
    <AnalysisLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 mb-2 flex items-center gap-3">
            <ListOrdered size={28} className="text-primary-600" />
            逐题分析
          </h1>
          <p className="text-slate-500">深入分析每道题目的考查目标和对应知识点</p>
        </div>

        <div className="card card-content mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">选择试卷</label>
              <div className="flex flex-wrap gap-2">
                {course.papers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => handlePaperChange(paper.id)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      selectedPaperId === paper.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {paper.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Filter size={16} />
                题型筛选
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                      filterType === option.value
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary-500" />
              <span>共 <span className="font-semibold text-primary-700">{currentPaper.questions.length}</span> 道题</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-accent-500" />
              <span>当前筛选 <span className="font-semibold text-accent-600">{filteredQuestions.length}</span> 道</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-500" />
              <span>总分 <span className="font-semibold text-emerald-600">{currentPaper.totalScore}</span> 分</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card h-[600px] lg:h-[calc(100vh-280px)] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white">
                <h3 className="font-semibold text-primary-900 flex items-center gap-2">
                  <ListOrdered size={18} />
                  题目列表
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无该题型题目</p>
                  </div>
                ) : (
                  filteredQuestions.map((question, index) => {
                    const stars = calculateStars(question);
                    const isSelected = selectedQuestion.id === question.id;
                    return (
                      <button
                        key={question.id}
                        onClick={() => setSelectedQuestionId(question.id)}
                        className={cn(
                          'w-full text-left p-3 rounded-xl transition-all duration-200 animate-slide-up',
                          isSelected
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold',
                            isSelected ? 'bg-white/20' : 'bg-white shadow-sm'
                          )}>
                            {question.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded',
                                isSelected ? 'bg-white/20' : 'bg-primary-100 text-primary-700'
                              )}>
                                {questionTypeLabels[question.type]}
                              </span>
                              <span className={cn(
                                'text-xs font-semibold',
                                isSelected ? 'text-accent-300' : 'text-accent-600'
                              )}>
                                {question.score}分
                              </span>
                            </div>
                            <div className={cn(
                              'text-xs truncate',
                              isSelected ? 'text-primary-100' : 'text-slate-500'
                            )}>
                              {question.surfaceContent}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <StarRating
                              stars={stars}
                              size={12}
                              className={isSelected ? 'text-accent-300' : ''}
                              animated={false}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="h-[600px] lg:h-[calc(100vh-280px)] overflow-y-auto pr-2">
              <QuestionDetail question={selectedQuestion} paper={currentPaper} />
            </div>
          </div>
        </div>
      </div>
    </AnalysisLayout>
  );
}
