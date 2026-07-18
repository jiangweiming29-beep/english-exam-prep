import { useState, useEffect, useRef } from 'react';
import {
  FileBarChart,
  BarChart3,
  List,
  Trophy,
  Link,
  BookOpen,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Download,
  ChevronRight,
} from 'lucide-react';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { StarRating } from '@/components/StarRating';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { questionTypeLabels } from '@/types';
import type { KnowledgeRanking } from '@/types';

const sections = [
  { id: 'overall', title: '试卷整体分析', icon: FileBarChart, num: '01' },
  { id: 'ranking', title: '核心知识点排行榜', icon: Trophy, num: '02' },
  { id: 'evidence', title: '知识点证据链', icon: Link, num: '03' },
  { id: 'textbook', title: '教材对应预习内容', icon: BookOpen, num: '04' },
  { id: 'plan', title: '基础薄弱学生30分钟计划', icon: Clock, num: '05' },
  { id: 'risk', title: '本课学习风险提醒', icon: AlertTriangle, num: '06' },
  { id: 'ai-judgment', title: 'AI判断说明', icon: Info, num: '07' },
];

function SectionHeader({ num, title, icon: Icon }: { num: string; title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg">
        {num}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
          <Icon size={22} className="text-primary-600" />
          {title}
        </h2>
        <div className="h-0.5 bg-gradient-to-r from-primary-200 to-transparent mt-1" />
      </div>
    </div>
  );
}

function KnowledgeRankCard({ ranking, index }: { ranking: KnowledgeRanking; index: number }) {
  const starLevel = ranking.stars === 5 ? '五星' : ranking.stars === 4 ? '四星' : '三星';
  const levelStyles = {
    5: {
      badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      border: 'border-amber-200',
      bg: 'bg-gradient-to-r from-amber-50/50 to-orange-50/50',
    },
    4: {
      badge: 'bg-gradient-to-r from-primary-500 to-blue-500 text-white',
      border: 'border-primary-200',
      bg: 'bg-gradient-to-r from-primary-50/50 to-blue-50/50',
    },
    3: {
      badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
      border: 'border-emerald-200',
      bg: 'bg-gradient-to-r from-emerald-50/50 to-teal-50/50',
    },
  }[ranking.stars as 5 | 4 | 3];

  return (
    <div
      className={cn(
        'card overflow-hidden border-2 transition-all duration-300 hover:shadow-card-hover animate-slide-up',
        levelStyles.border
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={cn('p-5', levelStyles.bg)}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm', levelStyles.badge)}>
              {ranking.rank}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{ranking.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating stars={ranking.stars} size={14} animated={false} />
                <span className="text-xs text-slate-500">{starLevel}考点</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-700">{ranking.totalScore}</div>
            <div className="text-xs text-slate-500">总分值</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="tag bg-white/80 text-slate-600">
            出现 {ranking.appearCount} 次
          </span>
          {ranking.questionTypes.map((type) => (
            <span
              key={type}
              className="text-xs px-2 py-0.5 rounded-md bg-white/70 text-slate-600"
            >
              {questionTypeLabels[type]}
            </span>
          ))}
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{ranking.reason}</p>
      </div>
    </div>
  );
}

function TimelineSection({
  section,
  index,
}: {
  section: {
    title: string;
    duration: string;
    timeRange: string;
    goal: string;
    focus: string;
    content: string[];
  };
  index: number;
}) {
  const colors = [
    { line: 'from-primary-400 to-primary-600', dot: 'bg-primary-500', badge: 'bg-primary-100 text-primary-700' },
    { line: 'from-accent-400 to-accent-600', dot: 'bg-accent-500', badge: 'bg-accent-100 text-accent-700' },
    { line: 'from-emerald-400 to-emerald-600', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  ];
  const color = colors[index];

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      <div
        className={cn(
          'absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b',
          index === 2 ? 'transparent' : color.line
        )}
      />
      <div className={cn('absolute left-1.5 top-1 w-4 h-4 rounded-full ring-4 ring-white shadow-md', color.dot)} />

      <div className="card card-content">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="font-bold text-slate-800 text-lg">{section.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', color.badge)}>
                {section.timeRange}
              </span>
              <span className="text-xs text-slate-500">{section.duration}</span>
            </div>
          </div>
          <span className="tag bg-slate-100 text-slate-600 text-xs">{section.focus}</span>
        </div>

        <p className="text-sm text-primary-700 font-medium mb-3">🎯 {section.goal}</p>

        <ul className="space-y-2">
          {section.content.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white', color.dot)}>
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FullReport() {
  const { getCurrentCourse } = useAppStore();
  const course = getCurrentCourse();
  const report = course?.report;
  const [activeSection, setActiveSection] = useState('overall');
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-80px 0px -60% 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleExport = () => {
    alert('报告导出功能开发中...');
  };

  if (!course || !report) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <FileBarChart size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无报告数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  const rankings = report.knowledgeRankings || [];
  const fiveStar = rankings.filter((r) => r.stars === 5);
  const fourStar = rankings.filter((r) => r.stars === 4);
  const threeStar = rankings.filter((r) => r.stars === 3);

  return (
    <AnalysisLayout>
      <div className="animate-fade-in">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-900 mb-2 flex items-center gap-3">
              <FileBarChart size={28} className="text-primary-600" />
              完整分析报告
            </h1>
            <p className="text-slate-500">
              生成时间：{new Date(report.generatedAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="btn-accent flex items-center gap-2 justify-center"
          >
            <Download size={18} />
            导出报告
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="card card-content p-4">
                <div className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2">
                  <List size={16} />
                  报告目录
                </div>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleNavClick(section.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs font-bold w-6 text-center',
                            isActive ? 'text-primary-600' : 'text-slate-400'
                          )}
                        >
                          {section.num}
                        </span>
                        <Icon size={16} className={isActive ? 'text-primary-500' : 'text-slate-400'} />
                        <span className="text-sm flex-1">{section.title}</span>
                        <ChevronRight
                          size={14}
                          className={cn(
                            'transition-transform',
                            isActive ? 'text-primary-500 translate-x-0' : 'text-slate-300 -translate-x-1'
                          )}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="card card-content p-4 mt-4 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-primary-600" />
                  <span className="text-sm font-semibold text-primary-800">报告概览</span>
                </div>
                <div className="space-y-2 text-xs text-primary-600">
                  <div className="flex justify-between">
                    <span>核心考点</span>
                    <span className="font-bold">{rankings.length} 个</span>
                  </div>
                  <div className="flex justify-between">
                    <span>五星考点</span>
                    <span className="font-bold text-accent-600">{fiveStar.length} 个</span>
                  </div>
                  <div className="flex justify-between">
                    <span>风险提醒</span>
                    <span className="font-bold text-red-500">{report.riskWarnings?.length || 0} 条</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div ref={contentRef} className="flex-1 min-w-0 space-y-10">
            <section
              id="overall"
              ref={(el) => { sectionRefs.current['overall'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="01" title="试卷整体分析" icon={FileBarChart} />
              <div className="card card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">考试范围</div>
                      <div className="text-lg font-semibold text-slate-800">
                        {report.overallAnalysis.examScope}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">难度等级</div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-700">
                          {report.overallAnalysis.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-2">题型分布</div>
                      <div className="flex flex-wrap gap-2">
                        {report.overallAnalysis.questionTypes.map((type, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="text-sm text-slate-500 mb-2">主要考查方向</div>
                  <p className="text-slate-700 leading-relaxed">
                    {report.overallAnalysis.mainDirection}
                  </p>
                </div>
              </div>
            </section>

            <section
              id="ranking"
              ref={(el) => { sectionRefs.current['ranking'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="02" title="考试核心知识点排行榜" icon={Trophy} />

              {fiveStar.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating stars={5} size={16} animated={false} />
                    <span className="font-semibold text-amber-700">★★★★★ 五星核心考点</span>
                    <span className="text-sm text-slate-400">必须完全掌握</span>
                  </div>
                  <div className="space-y-4">
                    {fiveStar.map((ranking, index) => (
                      <KnowledgeRankCard key={ranking.id} ranking={ranking} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {fourStar.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating stars={4} size={16} animated={false} />
                    <span className="font-semibold text-primary-700">★★★★ 四星重要考点</span>
                    <span className="text-sm text-slate-400">重点理解掌握</span>
                  </div>
                  <div className="space-y-4">
                    {fourStar.map((ranking, index) => (
                      <KnowledgeRankCard key={ranking.id} ranking={ranking} index={index + fiveStar.length} />
                    ))}
                  </div>
                </div>
              )}

              {threeStar.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating stars={3} size={16} animated={false} />
                    <span className="font-semibold text-emerald-700">★★★ 三星一般考点</span>
                    <span className="text-sm text-slate-400">了解熟悉即可</span>
                  </div>
                  <div className="space-y-4">
                    {threeStar.map((ranking, index) => (
                      <KnowledgeRankCard
                        key={ranking.id}
                        ranking={ranking}
                        index={index + fiveStar.length + fourStar.length}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section
              id="evidence"
              ref={(el) => { sectionRefs.current['evidence'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="03" title="知识点证据链" icon={Link} />
              <div className="card card-content">
                <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100 mb-6">
                  <p className="text-slate-700 leading-relaxed">{report.evidenceChain}</p>
                </div>

                <div className="space-y-6">
                  {rankings.slice(0, 3).map((ranking, rankIndex) => (
                    <div key={ranking.id} className="border-l-4 border-primary-200 pl-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold">
                          {rankIndex + 1}
                        </div>
                        <h4 className="font-bold text-slate-800">{ranking.name}</h4>
                        <StarRating stars={ranking.stars} size={12} animated={false} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ranking.evidence.slice(0, 6).map((ev, evIndex) => (
                          <div
                            key={evIndex}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-full bg-white text-primary-600 flex items-center justify-center text-xs font-bold shadow-sm">
                              {evIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-700 truncate">
                                {ev.paperName}
                              </div>
                              <div className="text-xs text-slate-500">第 {ev.questionNumber} 题</div>
                            </div>
                          </div>
                        ))}
                        {ranking.evidence.length > 6 && (
                          <div className="text-sm text-slate-400 flex items-center justify-center p-3">
                            ...还有 {ranking.evidence.length - 6} 处证据
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="textbook"
              ref={(el) => { sectionRefs.current['textbook'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="04" title="教材对应预习内容" icon={BookOpen} />
              <div className="space-y-4">
                {report.textbookMappings?.map((mapping, index) => (
                  <div
                    key={index}
                    className="card card-content animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-slate-800 mb-1">{mapping.knowledge}</h4>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-accent-100 text-accent-700 mb-3">
                          <span>📖</span>
                          <span>{mapping.textbookPosition}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-slate-600">预习内容：</div>
                          <ul className="space-y-1.5">
                            {mapping.previewContent.map((content, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>{content}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="plan"
              ref={(el) => { sectionRefs.current['plan'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="05" title="基础薄弱学生30分钟计划" icon={Clock} />
              <div className="card card-content">
                <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-primary-600" />
                    <span className="font-semibold text-primary-800">30分钟高效预习</span>
                  </div>
                  <p className="text-sm text-primary-600">
                    三阶段循序渐进，专为基础薄弱学生设计，用最短时间掌握最核心内容
                  </p>
                </div>

                <div className="relative">
                  {report.previewPlan?.section1 && (
                    <TimelineSection section={report.previewPlan.section1} index={0} />
                  )}
                  {report.previewPlan?.section2 && (
                    <TimelineSection section={report.previewPlan.section2} index={1} />
                  )}
                  {report.previewPlan?.section3 && (
                    <TimelineSection section={report.previewPlan.section3} index={2} />
                  )}
                </div>
              </div>
            </section>

            <section
              id="risk"
              ref={(el) => { sectionRefs.current['risk'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="06" title="本课学习风险提醒" icon={AlertTriangle} />
              <div className="card card-content">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" />
                    <span className="font-semibold text-red-700">学习风险预警</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    以下是学生在学习本单元时最容易出现的问题，请重点关注
                  </p>
                </div>

                <ul className="space-y-3">
                  {report.riskWarnings?.map((warning, index) => {
                    const isWarning = warning.includes('⚠️');
                    return (
                      <li
                        key={index}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-xl transition-colors',
                          isWarning
                            ? 'bg-amber-50 border border-amber-100 hover:bg-amber-100/50'
                            : 'bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            isWarning ? 'bg-amber-100' : 'bg-emerald-100'
                          )}
                        >
                          {isWarning ? (
                            <AlertTriangle size={16} className="text-amber-600" />
                          ) : (
                            <CheckCircle size={16} className="text-emerald-600" />
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-sm leading-relaxed pt-0.5',
                            isWarning ? 'text-amber-800' : 'text-emerald-800'
                          )}
                        >
                          {warning.replace(/^[⚠️💡]\s*/, '')}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <section
              id="ai-judgment"
              ref={(el) => { sectionRefs.current['ai-judgment'] = el; }}
              className="scroll-mt-24"
            >
              <SectionHeader num="07" title="AI判断说明" icon={Info} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card card-content border-2 border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <CheckCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-800">确认事实</h4>
                      <p className="text-xs text-emerald-600">来自试卷的直接证据</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {report.aiJudgment?.confirmed?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card card-content border-2 border-primary-200 bg-gradient-to-b from-primary-50/30 to-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <BarChart3 size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-800">合理推断</h4>
                      <p className="text-xs text-primary-600">根据题型分析得出</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {report.aiJudgment?.inferred?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <BarChart3 size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card card-content border-2 border-amber-200 bg-gradient-to-b from-amber-50/30 to-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <HelpCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800">待确认</h4>
                      <p className="text-xs text-amber-600">资料不足需补充</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {report.aiJudgment?.pending?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <HelpCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  本报告由 AI 智能分析生成，仅供教学参考。实际教学请结合学生情况和教材要求灵活调整。
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AnalysisLayout>
  );
}
