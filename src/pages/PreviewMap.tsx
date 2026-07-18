import { useMemo } from 'react';
import {
  Map,
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  Target,
  AlertCircle,
  Star,
} from 'lucide-react';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { StarRating } from '@/components/StarRating';
import { useAppStore } from '@/store/useAppStore';
import { questionTypeLabels } from '@/types';
import type { KnowledgeRanking } from '@/types';
import { cn } from '@/lib/utils';

interface KnowledgeDetail {
  needToMaster: string[];
  noNeedToDeep: string[];
}

function generateKnowledgeDetail(ranking: KnowledgeRanking): KnowledgeDetail {
  const name = ranking.name;

  if (name.includes('一般过去时')) {
    return {
      needToMaster: [
        '认识一般过去时的定义：表示过去发生的动作或存在的状态',
        '记住常见时间标志词：yesterday, last week, ago, just now',
        'be动词过去式：was/were 的基本用法（单数用was，复数用were）',
        '规则动词过去式：直接加 ed 的基本规则',
        '肯定句、否定句、疑问句的基本结构',
      ],
      noNeedToDeep: [
        '过去进行时（本单元不涉及）',
        '现在完成时与一般过去时的区别（以后再学）',
        '复杂的时态语态结合',
        '虚拟语气中的过去时用法',
      ],
    };
  }

  if (name.includes('不规则动词')) {
    return {
      needToMaster: [
        '本单元高频不规则动词：go-went, do-did, see-saw, buy-bought, eat-ate',
        '每个动词配一个过去时例句，加深记忆',
        '学会根据上下文判断是否用过去式',
        '写作中正确使用不规则动词的过去式',
      ],
      noNeedToDeep: [
        '所有不规则动词一次性背完（先记本单元的）',
        '不规则动词的过去分词（完成时再学）',
        '古英语中的动词变化规则',
      ],
    };
  }

  if (name.includes('阅读') || name.includes('阅读理解')) {
    return {
      needToMaster: [
        '快速定位文章中的时间标志词',
        '学会根据时态判断文章讲述的是过去还是现在',
        '细节题的定位方法：找关键词',
        '推理题的基本思路：基于原文，不主观臆断',
      ],
      noNeedToDeep: [
        '复杂的长难句分析（以后逐步积累）',
        '文学性阅读的深度赏析',
        '速读技巧（先保证正确率）',
      ],
    };
  }

  return {
    needToMaster: [
      `掌握${name}的基本概念和规则`,
      '通过例句理解用法',
      '做基础练习题巩固',
      '注意常见错误点',
    ],
    noNeedToDeep: [
      '高阶用法和特殊情况',
      '与其他复杂语法点的结合',
      '学术性的深入研究',
    ],
  };
}

function KnowledgeCard({ ranking, index }: { ranking: KnowledgeRanking; index: number }) {
  const detail = useMemo(() => generateKnowledgeDetail(ranking), [ranking]);

  const isFiveStar = ranking.stars === 5;
  const isFourStar = ranking.stars === 4;

  const cardClasses = cn(
    'card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover animate-slide-up',
    {
      'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white border-0': isFiveStar,
      'bg-white border-2 border-primary-200': isFourStar,
      'bg-white border border-slate-200': ranking.stars === 3,
    }
  );

  const headerClasses = cn('p-6', {
    'bg-gradient-to-r from-primary-900/50 to-transparent': isFiveStar,
    'bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100': isFourStar,
    'bg-slate-50/50 border-b border-slate-100': ranking.stars === 3,
  });

  const titleTextClass = isFiveStar ? 'text-white' : 'text-primary-900';
  const subtitleTextClass = isFiveStar ? 'text-primary-200' : 'text-slate-500';

  return (
    <div
      className={cardClasses}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={headerClasses}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                isFiveStar ? 'bg-accent-500/20' : isFourStar ? 'bg-primary-100' : 'bg-slate-100'
              )}>
                <Star
                  size={24}
                  className={isFiveStar ? 'text-accent-400' : isFourStar ? 'text-primary-600' : 'text-slate-500'}
                  fill="currentColor"
                />
              </div>
              <div>
                <h3 className={cn('font-bold', titleTextClass, isFiveStar ? 'text-xl' : 'text-lg')}>
                  {ranking.name}
                </h3>
                <div className="mt-1">
                  <StarRating
                    stars={ranking.stars}
                    size={isFiveStar ? 18 : 16}
                    className={isFiveStar ? '' : ''}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={cn(
            'text-right flex-shrink-0',
            isFiveStar ? 'text-accent-400' : 'text-primary-600'
          )}>
            <div className={cn('font-bold', isFiveStar ? 'text-3xl' : 'text-2xl')}>
              #{ranking.rank}
            </div>
            <div className={cn('text-xs', subtitleTextClass)}>优先级</div>
          </div>
        </div>
      </div>

      <div className={cn('p-6 space-y-5', isFiveStar ? 'text-white' : '')}>
        <div>
          <div className={cn(
            'flex items-center gap-2 mb-3 font-semibold',
            isFiveStar ? 'text-accent-400' : 'text-primary-700'
          )}>
            <Lightbulb size={18} />
            <span>为什么需要提前学</span>
          </div>
          <div className={cn(
            'p-4 rounded-xl',
            isFiveStar ? 'bg-white/10' : 'bg-accent-50/50 border border-accent-100'
          )}>
            <p className={cn('text-sm leading-relaxed', isFiveStar ? 'text-primary-100' : 'text-slate-700')}>
              {ranking.reason}
            </p>
            <div className={cn('flex flex-wrap gap-2 mt-3', isFiveStar ? '' : '')}>
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium',
                isFiveStar ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
              )}>
                出现 {ranking.appearCount} 次
              </span>
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium',
                isFiveStar ? 'bg-white/20 text-white' : 'bg-accent-100 text-accent-700'
              )}>
                共 {ranking.totalScore} 分
              </span>
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium',
                isFiveStar ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              )}>
                {ranking.questionTypes.length} 种题型
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className={cn(
            'flex items-center gap-2 mb-3 font-semibold',
            isFiveStar ? 'text-emerald-400' : 'text-emerald-700'
          )}>
            <CheckCircle size={18} />
            <span>学生需要掌握</span>
          </div>
          <ul className="space-y-2">
            {detail.needToMaster.map((item, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl transition-colors',
                  isFiveStar ? 'hover:bg-white/5' : 'hover:bg-emerald-50/50'
                )}
              >
                <CheckCircle
                  size={18}
                  className={cn('flex-shrink-0 mt-0.5', isFiveStar ? 'text-emerald-400' : 'text-emerald-500')}
                />
                <span className={cn('text-sm leading-relaxed', isFiveStar ? 'text-primary-100' : 'text-slate-700')}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className={cn(
            'flex items-center gap-2 mb-3 font-semibold',
            isFiveStar ? 'text-slate-400' : 'text-slate-500'
          )}>
            <XCircle size={18} />
            <span>不需要提前深入</span>
          </div>
          <ul className="space-y-2">
            {detail.noNeedToDeep.map((item, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl',
                  isFiveStar ? 'opacity-60' : 'opacity-70'
                )}
              >
                <XCircle
                  size={18}
                  className={cn('flex-shrink-0 mt-0.5', isFiveStar ? 'text-slate-500' : 'text-slate-400')}
                />
                <span className={cn('text-sm line-through', isFiveStar ? 'text-slate-400' : 'text-slate-500')}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className={cn(
            'flex items-center gap-2 mb-3 font-semibold',
            isFiveStar ? 'text-primary-300' : 'text-slate-600'
          )}>
            <Target size={18} />
            <span>涉及题型</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ranking.questionTypes.map((type) => (
              <span
                key={type}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium',
                  isFiveStar
                    ? 'bg-white/10 text-primary-200 border border-white/20'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {questionTypeLabels[type]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewMap() {
  const { getCurrentCourse } = useAppStore();
  const course = getCurrentCourse();
  const report = course?.report;

  const sortedRankings = useMemo(() => {
    if (!report?.knowledgeRankings) return [];
    return [...report.knowledgeRankings].sort((a, b) => b.stars - a.stars);
  }, [report]);

  if (!course || !report) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <Map size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无分析数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  return (
    <AnalysisLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <Map size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-900">反向预习知识地图</h1>
              <p className="text-slate-500 text-sm mt-0.5">从考试反推学习内容，精准定位预习重点</p>
            </div>
          </div>
          <div className="card card-content bg-gradient-to-r from-primary-50 via-white to-accent-50 mt-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={20} className="text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900">为什么叫"反向预习"？</h3>
                  <p className="text-sm text-slate-500">传统预习是从教材到考试，我们从考试反推教材</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-primary-500" />
                  <span className="text-slate-600">
                    共 <span className="font-bold text-primary-700">{sortedRankings.length}</span> 个核心考点
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-accent-500" />
                  <span className="text-slate-600">
                    <span className="font-bold text-accent-600">
                      {sortedRankings.filter(r => r.stars === 5).length}
                    </span> 个五星级必学
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-emerald-500" />
                  <span className="text-slate-600">
                    总分值 <span className="font-bold text-emerald-600">
                      {sortedRankings.reduce((sum, r) => sum + r.totalScore, 0)}
                    </span> 分
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sortedRankings.length > 0 && sortedRankings[0].stars === 5 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-accent-500" fill="currentColor" />
                <h2 className="text-lg font-bold text-primary-900">五星级 · 必须重点预习</h2>
                <span className="tag bg-accent-100 text-accent-700">最高优先级</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {sortedRankings
                  .filter(r => r.stars === 5)
                  .map((ranking, i) => (
                    <KnowledgeCard key={ranking.id} ranking={ranking} index={i} />
                  ))}
              </div>
            </div>
          )}

          {sortedRankings.some(r => r.stars === 4) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-primary-500" fill="currentColor" />
                <h2 className="text-lg font-bold text-primary-900">四星级 · 建议认真预习</h2>
                <span className="tag bg-primary-100 text-primary-700">次高优先级</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedRankings
                  .filter(r => r.stars === 4)
                  .map((ranking, i) => (
                    <KnowledgeCard
                      key={ranking.id}
                      ranking={ranking}
                      index={sortedRankings.filter(r => r.stars === 5).length + i}
                    />
                  ))}
              </div>
            </div>
          )}

          {sortedRankings.some(r => r.stars === 3) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-slate-400" fill="currentColor" />
                <h2 className="text-lg font-bold text-primary-900">三星级 · 了解即可</h2>
                <span className="tag bg-slate-100 text-slate-600">基础优先级</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedRankings
                  .filter(r => r.stars === 3)
                  .map((ranking, i) => (
                    <KnowledgeCard
                      key={ranking.id}
                      ranking={ranking}
                      index={
                        sortedRankings.filter(r => r.stars === 5).length +
                        sortedRankings.filter(r => r.stars === 4).length + i
                      }
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnalysisLayout>
  );
}
