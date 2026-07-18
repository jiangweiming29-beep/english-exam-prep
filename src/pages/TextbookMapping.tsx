import { useMemo } from 'react';
import {
  BookMarked,
  MapPin,
  ListChecks,
  AlertCircle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { StarRating } from '@/components/StarRating';
import { useAppStore } from '@/store/useAppStore';
import type { TextbookMapping as TextbookMappingType } from '@/types';
import { cn } from '@/lib/utils';

function getStarsForKnowledge(knowledge: string, rankings: { name: string; stars: number }[]): number {
  const match = rankings.find(r => knowledge.includes(r.name) || r.name.includes(knowledge));
  return match?.stars || 3;
}

function isPending(textbookPosition: string): boolean {
  return textbookPosition.includes('待确认') || textbookPosition.includes('待定') || textbookPosition.includes('未确认');
}

function parsePositionTags(textbookPosition: string): { unit?: string; section?: string; page?: string; rest: string } {
  const result: { unit?: string; section?: string; page?: string; rest: string } = { rest: textbookPosition };
  
  const unitMatch = textbookPosition.match(/Unit\s*\d+/i);
  const sectionMatch = textbookPosition.match(/Section\s*[A-Z]/i);
  const pageMatch = textbookPosition.match(/(?:页码|page|p[.\s])\s*(\d+)/i);
  
  let rest = textbookPosition;
  if (unitMatch) {
    result.unit = unitMatch[0];
    rest = rest.replace(unitMatch[0], '').trim();
  }
  if (sectionMatch) {
    result.section = sectionMatch[0];
    rest = rest.replace(sectionMatch[0], '').trim();
  }
  if (pageMatch) {
    result.page = pageMatch[1];
    rest = rest.replace(pageMatch[0], '').trim();
  }
  
  rest = rest.replace(/^[\/\-\s]+|[\/\-\s]+$/g, '').trim();
  result.rest = rest;
  
  return result;
}

function MappingCard({ mapping, stars, index }: { mapping: TextbookMappingType; stars: number; index: number }) {
  const pending = isPending(mapping.textbookPosition);
  const tags = parsePositionTags(mapping.textbookPosition);
  
  return (
    <div 
      className="card card-content group animate-slide-up hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-md">
              <BookMarked size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary-900 text-lg mb-2 leading-tight">
                {mapping.knowledge}
              </h3>
              <StarRating stars={stars} size={16} />
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <StarRating stars={stars} size={12} animated={false} />
                <span className="ml-1">{stars} 星重点</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center px-2">
          <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
            <ChevronRight size={20} className="text-accent-500" />
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <ChevronRight size={18} className="text-accent-500" />
          <span className="text-sm font-medium text-accent-600">教材映射</span>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className={cn(pending ? 'text-amber-500' : 'text-primary-500')} />
              <span className="text-sm font-semibold text-slate-700">教材位置</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.unit && (
                <span className="tag bg-primary-100 text-primary-700">
                  {tags.unit}
                </span>
              )}
              {tags.section && (
                <span className="tag bg-blue-100 text-blue-700">
                  {tags.section}
                </span>
              )}
              {tags.page && (
                <span className="tag bg-emerald-100 text-emerald-700">
                  P.{tags.page}
                </span>
              )}
              {tags.rest && (
                <span className={cn(
                  'tag',
                  pending 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-slate-100 text-slate-600'
                )}>
                  {pending && <AlertCircle size={12} className="mr-1" />}
                  {tags.rest}
                </span>
              )}
            </div>
          </div>

          <div className={cn(
            'p-4 rounded-xl',
            pending 
              ? 'bg-amber-50/50 border border-amber-200' 
              : 'bg-slate-50'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={16} className={cn(pending ? 'text-amber-600' : 'text-emerald-500')} />
              <span className="text-sm font-semibold text-slate-700">预习内容</span>
            </div>
            <ol className="space-y-2">
              {mapping.previewContent.map((content, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                    pending ? 'bg-amber-200 text-amber-700' : 'bg-emerald-500 text-white'
                  )}>
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{content}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TextbookMapping() {
  const { getCurrentCourse } = useAppStore();
  const course = getCurrentCourse();
  const mappings = course?.report?.textbookMappings || [];
  const rankings = course?.report?.knowledgeRankings || [];

  const mappingsWithStars = useMemo(() => {
    return mappings.map(mapping => ({
      ...mapping,
      stars: getStarsForKnowledge(mapping.knowledge, rankings),
    }));
  }, [mappings, rankings]);

  const confirmedCount = mappings.filter(m => !isPending(m.textbookPosition)).length;
  const pendingCount = mappings.length - confirmedCount;

  if (!course) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <BookMarked size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无课程数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  if (mappings.length === 0) {
    return (
      <AnalysisLayout>
        <div className="text-center py-20">
          <BookMarked size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无教材映射数据</p>
        </div>
      </AnalysisLayout>
    );
  }

  return (
    <AnalysisLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 mb-2 flex items-center gap-3">
            <BookMarked size={28} className="text-amber-500" />
            教材映射
          </h1>
          <p className="text-slate-500">
            将考试重点对应到教材，让你知道预习时翻到哪一页
          </p>
        </div>

        <div className="card card-content mb-6 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-400 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
              <BookOpen size={30} className="text-accent-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-1">预习地图 · 教材定位</h2>
              <p className="text-primary-200 text-sm">
                知识点 → 教材位置 → 预习内容，三步定位预习目标
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-400">{mappings.length}</div>
                <div className="text-xs text-primary-300">映射总数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{confirmedCount}</div>
                <div className="text-xs text-primary-300">已确认</div>
              </div>
              {pendingCount > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">{pendingCount}</div>
                  <div className="text-xs text-primary-300">待确认</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mappingsWithStars.map((mapping, index) => (
            <MappingCard
              key={index}
              mapping={mapping}
              stars={mapping.stars}
              index={index}
            />
          ))}
        </div>

        {pendingCount > 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  有 {pendingCount} 个教材位置待确认
                </p>
                <p className="text-xs text-amber-600">
                  上传教材后可以自动匹配更精确的页码和章节位置。
                  当前位置为根据单元内容推断，仅供参考。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnalysisLayout>
  );
}
