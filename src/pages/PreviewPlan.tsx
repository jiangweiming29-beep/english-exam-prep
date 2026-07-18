import { useMemo } from 'react';
import {
  Clock,
  Play,
  Target,
  CheckSquare,
  Lightbulb,
  Bell,
  Ear,
  BookOpen,
  Pencil,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { StarRating } from '@/components/StarRating';
import { useAppStore } from '@/store/useAppStore';
import type { PreviewSection } from '@/types';
import { cn } from '@/lib/utils';

interface PhaseConfig {
  color: string;
  bgColor: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  iconBg: string;
  progressWidth: string;
  stars: number;
  icon: typeof Play;
}

const phaseConfigs: PhaseConfig[] = [
  {
    color: 'primary',
    bgColor: 'bg-primary-600',
    lightBg: 'bg-primary-50',
    borderColor: 'border-primary-200',
    textColor: 'text-primary-700',
    iconBg: 'bg-primary-100',
    progressWidth: 'w-1/3',
    stars: 5,
    icon: Play,
  },
  {
    color: 'accent',
    bgColor: 'bg-accent-500',
    lightBg: 'bg-accent-50',
    borderColor: 'border-accent-200',
    textColor: 'text-accent-700',
    iconBg: 'bg-accent-100',
    progressWidth: 'w-2/3',
    stars: 4,
    icon: BookOpen,
  },
  {
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    progressWidth: 'w-full',
    stars: 0,
    icon: CheckSquare,
  },
];

const reminderIcons = [Lightbulb, Bell, Ear, Pencil, AlertCircle];

function TimelineCard({
  section,
  index,
  config,
}: {
  section: PreviewSection;
  index: number;
  config: PhaseConfig;
}) {
  const Icon = config.icon;

  return (
    <div className="relative animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
      <div className="flex gap-4 md:gap-6">
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className={cn(
              'w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg z-10',
              config.bgColor
            )}
          >
            <Icon size={22} className="text-white" />
          </div>
          {index < 2 && (
            <div className={cn('w-1 flex-1 mt-2 rounded-full', config.bgColor + '/30')} />
          )}
        </div>

        <div className="flex-1 pb-8 md:pb-10">
          <div
            className={cn(
              'card overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
              config.borderColor
            )}
          >
            <div className={cn('px-5 md:px-6 py-4 md:py-5', config.lightBg)}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full', config.iconBg)}>
                    <Clock size={14} className={config.textColor} />
                    <span className={cn('text-sm font-semibold', config.textColor)}>
                      {section.timeRange}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">{section.duration}</span>
                </div>
                {config.stars > 0 ? (
                  <StarRating stars={config.stars} size={16} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    <CheckSquare size={14} />
                    检测
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-primary-900">{section.title}</h3>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-xl flex-shrink-0', config.iconBg)}>
                  <Target size={18} className={config.textColor} />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-800 mb-1">学习目标</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{section.goal}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('p-2 rounded-xl', config.iconBg)}>
                    <Lightbulb size={18} className={config.textColor} />
                  </div>
                  <h4 className="font-semibold text-primary-800">重点内容</h4>
                </div>
                <ul className="space-y-2.5 pl-1">
                  {section.content.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors"
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5',
                          config.bgColor
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReminderItem({ text, index }: { text: string; index: number }) {
  const Icon = reminderIcons[index % reminderIcons.length];

  return (
    <div
      className="flex items-start gap-4 p-4 md:p-5 rounded-xl bg-white border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-slate-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export default function PreviewPlan() {
  const { getCurrentCourse } = useAppStore();
  const course = getCurrentCourse();
  const report = course?.report;
  const previewPlan = report?.previewPlan;

  const sections = useMemo(() => {
    if (!previewPlan) return [];
    return [previewPlan.section1, previewPlan.section2, previewPlan.section3];
  }, [previewPlan]);

  if (!course || !report || !previewPlan) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <Clock size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无预习方案数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  return (
    <AnalysisLayout>
      <div className="animate-fade-in max-w-5xl mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-900">30分钟预习方案</h1>
              <p className="text-slate-500 text-sm mt-0.5">科学规划，高效预习，带着问题进课堂</p>
            </div>
          </div>

          <div className="card card-content bg-gradient-to-r from-primary-50 via-white to-accent-50 mt-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900">预习总览</h3>
                  <p className="text-sm text-slate-500">建议时长 30 分钟，分三阶段进行</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="text-slate-600">语法突破 10分钟</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-500" />
                  <span className="text-slate-600">词汇短语 10分钟</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">检测巩固 10分钟</span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-emerald-500 animate-pulse-slow" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>0分钟</span>
                <span>10分钟</span>
                <span>20分钟</span>
                <span>30分钟</span>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary-500 to-accent-500" />
            <h2 className="text-xl md:text-2xl font-bold text-primary-900">三阶段预习计划</h2>
          </div>

          <div className="relative">
            {sections.map((section, index) => (
              <TimelineCard
                key={index}
                section={section}
                index={index}
                config={phaseConfigs[index]}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-accent-500 to-emerald-500" />
            <h2 className="text-xl md:text-2xl font-bold text-primary-900">课堂听课提醒</h2>
          </div>

          <div className="card card-content bg-gradient-to-br from-primary-50/50 to-white">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 rounded-xl bg-accent-100 flex-shrink-0">
                <Ear size={20} className="text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">明天上课重点听什么？</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  带着以下问题听课，效率翻倍。把不懂的地方标记出来，下课问老师
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {previewPlan.classReminders.map((reminder, index) => (
                <ReminderItem key={index} text={reminder} index={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </AnalysisLayout>
  );
}
