import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  BookOpen,
  FileText,
  BarChart3,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { courses, initMockData, setCurrentCourse } = useAppStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseUnit, setCourseUnit] = useState('');

  useEffect(() => {
    if (courses.length === 0) {
      initMockData();
    }
  }, []);

  const handleCreateCourse = () => {
    if (!courseName.trim()) return;
    navigate('/upload');
    setShowNewModal(false);
  };

  const features = [
    {
      icon: Target,
      title: '试卷优先',
      desc: '以考试试卷为最高权重，反推真正考点',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: '交叉验证',
      desc: '多份试卷对比分析，找出高频核心考点',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Zap,
      title: '精准预习',
      desc: '30分钟高效方案，基础薄弱也能跟上',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <GraduationCap size={32} className="text-accent-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">初中英语考试反向预习系统</h1>
              <p className="text-primary-200">V2.0 · 试卷反推 · 精准预习</p>
            </div>
          </div>
          
          <p className="text-xl text-primary-100 max-w-2xl mb-8 leading-relaxed">
            不再盲目背课文，让考试卷告诉你
            <span className="text-accent-400 font-semibold"> "真正该学什么" </span>
            。
            <br />
            专为基础薄弱的初二学生设计。
          </p>

          <button
            onClick={() => setShowNewModal(true)}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-2xl shadow-lg shadow-accent-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-accent-500/40"
          >
            <Plus size={22} />
            开始新课程分析
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-3">
              <BookOpen size={28} className="text-primary-600" />
              我的课程
            </h2>
            <button
              onClick={() => setShowNewModal(true)}
              className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
            >
              <Plus size={18} />
              新建
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="card card-content text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-50 flex items-center justify-center">
                <FileText size={40} className="text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary-800 mb-2">还没有课程</h3>
              <p className="text-slate-500 mb-6">上传试卷，开始你的第一次反向预习分析</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="btn-primary"
              >
                立即开始
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="card card-content cursor-pointer group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    setCurrentCourse(course.id);
                    navigate(`/analysis/${course.id}/questions`);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <BookOpen size={22} className="text-white" />
                    </div>
                    <span className={cn(
                      'tag',
                      course.analysisStatus === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : course.analysisStatus === 'analyzing'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    )}>
                      {course.analysisStatus === 'completed' ? '分析完成' :
                       course.analysisStatus === 'analyzing' ? '分析中' : '待分析'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-primary-900 mb-1 group-hover:text-primary-700 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">{course.unit}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{course.papers.length} 份试卷</span>
                    </div>
                    {course.report && (
                      <div className="flex items-center gap-1">
                        <StarRating stars={5} size={12} />
                      </div>
                    )}
                  </div>

                  {course.report?.knowledgeRankings.slice(0, 2).map((rank, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-1">
                      <span className="text-accent-500 font-bold">{rank.stars}★</span>
                      <span className="text-slate-700">{rank.name}</span>
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-primary-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      查看分析
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary-900 mb-8 flex items-center gap-3">
            <Sparkles size={28} className="text-accent-500" />
            为什么要"反向预习"？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card card-content animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5',
                    feature.color
                  )}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <div className="card card-content bg-gradient-to-br from-primary-900 to-primary-800 text-white">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">📚 使用方法</h2>
              <ol className="space-y-3 text-primary-100">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>上传本课的教材、试卷（至少2份效果最好）、教案、笔记</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>系统逐题分析每道题的深层考查目标</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>交叉对比多份试卷，生成核心考点排行榜</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
                  <span>获得30分钟精准预习方案，知道"先学什么、为什么学"</span>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card card-content w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-primary-900 mb-6">新建课程分析</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">课程名称</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="如：Unit 1 Where did you go on vacation?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">单元</label>
                <input
                  type="text"
                  value={courseUnit}
                  onChange={(e) => setCourseUnit(e.target.value)}
                  placeholder="如：Unit 1 / 八年级上册"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex-1 btn-primary"
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
