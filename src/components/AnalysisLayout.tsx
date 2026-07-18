import { useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  FileText,
  BarChart3,
  Map,
  BookMarked,
  Clock,
  FileBarChart,
  ChevronLeft,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: 'questions', label: '逐题分析', icon: FileText, color: 'text-blue-500' },
  { path: 'cross', label: '交叉分析', icon: BarChart3, color: 'text-purple-500' },
  { path: 'map', label: '预习地图', icon: Map, color: 'text-emerald-500' },
  { path: 'textbook', label: '教材映射', icon: BookMarked, color: 'text-amber-500' },
  { path: 'plan', label: '预习方案', icon: Clock, color: 'text-rose-500' },
  { path: 'report', label: '完整报告', icon: FileBarChart, color: 'text-indigo-500' },
];

interface AnalysisLayoutProps {
  children: React.ReactNode;
}

export function AnalysisLayout({ children }: AnalysisLayoutProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { getCurrentCourse } = useAppStore();
  
  const course = getCurrentCourse();

  const currentPath = location.pathname.split('/').pop() || '';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-primary-700 transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">返回首页</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-900">{course?.name || '课程分析'}</h1>
                <p className="text-xs text-slate-500">{course?.unit || ''}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 pt-20 lg:pt-0 transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
          )}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={`/analysis/${id}/${item.path}`}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon size={20} className={isActive ? item.color : ''} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="p-4 mt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-primary-600" />
                  <span className="text-sm font-semibold text-primary-800">分析状态</span>
                </div>
                <p className="text-xs text-primary-600">
                  {course?.analysisStatus === 'completed'
                    ? '✅ 分析已完成'
                    : course?.analysisStatus === 'analyzing'
                    ? '⏳ 分析中...'
                    : '📝 待分析'}
                </p>
              </div>
            </div>
          )}
        </aside>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
