import { useState, useMemo } from 'react';
import {
  Trophy,
  BarChart3,
  FileText,
  Target,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  PieChart,
  Layers,
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { StarRating } from '@/components/StarRating';
import { useAppStore } from '@/store/useAppStore';
import { questionTypeLabels, knowledgeLevel1Labels } from '@/types';
import type { KnowledgeRanking, KnowledgeLevel1 } from '@/types';
import { cn } from '@/lib/utils';

const CHART_COLORS = {
  grammar: '#3b82f6',
  vocabulary: '#f59e0b',
  reading: '#10b981',
  writing: '#8b5cf6',
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        badgeBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
        text: 'text-amber-700',
        icon: Trophy,
      };
    case 2:
      return {
        bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
        border: 'border-slate-200',
        badgeBg: 'bg-gradient-to-br from-slate-400 to-gray-500',
        text: 'text-slate-700',
        icon: Award,
      };
    case 3:
      return {
        bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
        border: 'border-orange-200',
        badgeBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
        text: 'text-orange-700',
        icon: TrendingUp,
      };
    default:
      return {
        bg: 'bg-white',
        border: 'border-slate-200',
        badgeBg: 'bg-slate-400',
        text: 'text-slate-600',
        icon: Target,
      };
  }
};

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accentColor: 'primary' | 'accent' | 'emerald';
  delay?: number;
}) {
  const colorClasses = {
    primary: {
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-600',
      valueText: 'text-primary-700',
    },
    accent: {
      iconBg: 'bg-accent-100',
      iconText: 'text-accent-600',
      valueText: 'text-accent-700',
    },
    emerald: {
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      valueText: 'text-emerald-700',
    },
  }[accentColor];

  return (
    <div
      className="card card-content flex items-center gap-4 animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          colorClasses.iconBg
        )}
      >
        <Icon size={24} className={colorClasses.iconText} />
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className={cn('text-2xl font-bold', colorClasses.valueText)}>{value}</div>
      </div>
    </div>
  );
}

function KnowledgeCard({
  ranking,
  index,
}: {
  ranking: KnowledgeRanking;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const rankStyle = getRankStyle(ranking.rank);
  const RankIcon = rankStyle.icon;

  return (
    <div
      className={cn(
        'card overflow-hidden border-2 transition-all duration-300 animate-slide-up',
        rankStyle.border,
        expanded ? 'shadow-card-hover' : ''
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full p-5 text-left transition-all duration-200',
          rankStyle.bg,
          'hover:brightness-95'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-md',
              rankStyle.badgeBg
            )}
          >
            {ranking.rank <= 3 ? (
              <RankIcon size={24} />
            ) : (
              <span>{ranking.rank}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className={cn('text-lg font-bold', rankStyle.text)}>
                {ranking.name}
              </h3>
              <StarRating stars={ranking.stars} size={16} />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="tag bg-white/80 text-slate-600">
                出现 {ranking.appearCount} 次
              </span>
              <span className="tag bg-white/80 text-slate-600">
                总分 {ranking.totalScore} 分
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ranking.questionTypes.map((type) => (
                <span
                  key={type}
                  className="text-xs px-2 py-0.5 rounded-md bg-white/70 text-slate-600"
                >
                  {questionTypeLabels[type]}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 mt-1">
            {expanded ? (
              <ChevronUp size={20} className="text-slate-400" />
            ) : (
              <ChevronDown size={20} className="text-slate-400" />
            )}
          </div>
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-5 border-t border-slate-100 bg-white space-y-4">
          <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
            <div className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
              <Target size={16} />
              判断原因
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{ranking.reason}</p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Layers size={16} />
              证据链（共 {ranking.evidence.length} 处）
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {ranking.evidence.map((ev, evIndex) => (
                <div
                  key={evIndex}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {evIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">
                      {ev.paperName}
                    </div>
                    <div className="text-xs text-slate-500">第 {ev.questionNumber} 题</div>
                  </div>
                  <FileText size={16} className="text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrossAnalysis() {
  const { getCurrentCourse } = useAppStore();
  const course = getCurrentCourse();
  const rankings = course?.report?.knowledgeRankings || [];

  const stats = useMemo(() => {
    const paperCount = course?.papers.length || 0;
    const totalQuestions = course?.papers.reduce((sum, p) => sum + p.questionCount, 0) || 0;
    const totalScore = course?.papers.reduce((sum, p) => sum + p.totalScore, 0) || 0;
    return { paperCount, totalQuestions, totalScore };
  }, [course]);

  const chartData = useMemo(() => {
    const countMap: Record<KnowledgeLevel1, number> = {
      grammar: 0,
      vocabulary: 0,
      reading: 0,
      writing: 0,
    };

    rankings.forEach((r) => {
      r.questionTypes.forEach((t) => {
        if (t === 'choice' || t === 'fill' || t === 'cloze') {
          countMap.grammar += 1;
          countMap.vocabulary += 1;
        } else if (t === 'reading') {
          countMap.reading += 1;
        } else if (t === 'writing' || t === 'translation') {
          countMap.writing += 1;
        }
      });
    });

    return Object.entries(countMap)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: knowledgeLevel1Labels[key as KnowledgeLevel1],
        value,
        key,
      }));
  }, [rankings]);

  if (!course) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无课程数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  return (
    <AnalysisLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 mb-2 flex items-center gap-3">
            <BarChart3 size={28} className="text-primary-600" />
            交叉分析
          </h1>
          <p className="text-slate-500">多试卷交叉对比，精准定位核心考点</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={FileText}
            label="参与分析试卷"
            value={`${stats.paperCount} 份`}
            accentColor="primary"
            delay={0}
          />
          <StatCard
            icon={Target}
            label="总题数"
            value={stats.totalQuestions}
            accentColor="accent"
            delay={0.1}
          />
          <StatCard
            icon={Trophy}
            label="总分值"
            value={`${stats.totalScore} 分`}
            accentColor="emerald"
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-primary-900">考点排行榜</h2>
              <span className="text-sm text-slate-500">按星级从高到低</span>
            </div>
            <div className="space-y-4">
              {rankings.length === 0 ? (
                <div className="card card-content text-center py-12">
                  <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">暂无考点排名数据</p>
                </div>
              ) : (
                rankings.map((ranking, index) => (
                  <KnowledgeCard
                    key={ranking.id}
                    ranking={ranking}
                    index={index}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-primary-900">考点分布</h2>
              <span className="text-sm text-slate-500">按知识点分类</span>
            </div>
            <div className="card card-content animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[entry.key as KnowledgeLevel1]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px -4px rgba(30, 58, 138, 0.1)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm text-slate-600">{value}</span>
                        )}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    暂无数据
                  </div>
                )}
              </div>
            </div>

            <div className="card card-content animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <Layers size={18} />
                星级说明
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <StarRating stars={5} size={16} animated={false} />
                  <span className="text-sm text-slate-600">
                    核心考点（最多3个）
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating stars={4} size={16} animated={false} />
                  <span className="text-sm text-slate-600">重要考点</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating stars={3} size={16} animated={false} />
                  <span className="text-sm text-slate-600">一般考点</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnalysisLayout>
  );
}
