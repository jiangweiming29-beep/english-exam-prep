import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  FileSpreadsheet,
  NotebookPen,
  Upload as UploadIcon,
  X,
  ChevronLeft,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { FileType, UploadedFile } from '@/types';
import { fileTypeLabels } from '@/types';

interface UploadZoneProps {
  type: FileType;
  icon: LucideIcon;
  title: string;
  description: string;
  files: UploadedFile[];
  onFileSelect: (file: File) => void;
  onFileRemove: (fileId: string) => void;
  highlighted?: boolean;
  delay?: number;
}

function UploadZone({
  type,
  icon: Icon,
  title,
  description,
  files,
  onFileSelect,
  onFileRemove,
  highlighted = false,
  delay = 0,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file) => onFileSelect(file));
    },
    [onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach((file) => onFileSelect(file));
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      className={cn(
        'card card-content animate-slide-up relative overflow-hidden',
        highlighted && 'ring-2 ring-accent-400 ring-offset-2'
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {highlighted && (
        <div className="absolute top-0 right-0 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
          最高权重
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            highlighted
              ? 'bg-gradient-to-br from-accent-400 to-accent-600'
              : 'bg-gradient-to-br from-primary-500 to-primary-700'
          )}
        >
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
            {title}
            {highlighted && <Sparkles size={16} className="text-accent-500" />}
          </h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300',
          isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.02]'
            : highlighted
            ? 'border-accent-300 bg-accent-50/50 hover:border-accent-400 hover:bg-accent-50'
            : 'border-slate-300 bg-slate-50/50 hover:border-primary-400 hover:bg-primary-50/50'
        )}
      >
        <UploadIcon
          size={32}
          className={cn(
            'mx-auto mb-3 transition-colors',
            isDragging
              ? 'text-primary-600'
              : highlighted
              ? 'text-accent-500'
              : 'text-slate-400'
          )}
        />
        <p
          className={cn(
            'font-medium mb-1',
            highlighted ? 'text-accent-700' : 'text-slate-700'
          )}
        >
          点击或拖拽文件到此处上传
        </p>
        <p className="text-xs text-slate-400">支持 PDF、Word、图片等格式</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group animate-slide-in-right"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    highlighted ? 'bg-accent-100' : 'bg-primary-100'
                  )}
                >
                  <FileText
                    size={14}
                    className={highlighted ? 'text-accent-600' : 'text-primary-600'}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(file.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3 text-xs text-slate-400 text-right">
          已上传 {files.length} 个文件
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  const navigate = useNavigate();
  const { getCurrentCourse, addUploadedFile, removeUploadedFile } = useAppStore();
  const course = getCurrentCourse();

  const uploadConfigs = [
    {
      type: 'textbook' as FileType,
      icon: BookOpen,
      title: fileTypeLabels.textbook,
      description: '上传本课教材内容，用于考点定位映射',
      highlighted: false,
      delay: 0.1,
    },
    {
      type: 'exam_paper' as FileType,
      icon: FileSpreadsheet,
      title: fileTypeLabels.exam_paper,
      description: '上传考试试卷（至少1份），作为分析核心依据',
      highlighted: true,
      delay: 0,
    },
    {
      type: 'teaching_plan' as FileType,
      icon: FileText,
      title: fileTypeLabels.teaching_plan,
      description: '上传老师教案，辅助理解教学重点',
      highlighted: false,
      delay: 0.2,
    },
    {
      type: 'class_notes' as FileType,
      icon: NotebookPen,
      title: fileTypeLabels.class_notes,
      description: '上传课堂笔记，补充学习细节',
      highlighted: false,
      delay: 0.3,
    },
  ];

  const getFilesByType = (type: FileType): UploadedFile[] => {
    return course?.uploadedFiles.filter((f) => f.type === type) || [];
  };

  const handleFileSelect = (type: FileType, file: File) => {
    if (!course) return;
    addUploadedFile(course.id, {
      type,
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      size: file.size,
    });
  };

  const handleFileRemove = (type: FileType, fileId: string) => {
    if (!course) return;
    removeUploadedFile(course.id, fileId);
  };

  const examPaperCount = getFilesByType('exam_paper').length;
  const canStartAnalysis = examPaperCount >= 1;

  const handleStartAnalysis = () => {
    if (!canStartAnalysis) return;
    navigate('/analysis');
  };

  const totalFiles = course?.uploadedFiles.length || 0;

  return (
    <div className="min-h-screen pb-32">
      <header className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            返回首页
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <UploadIcon size={24} className="text-accent-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">资料上传</h1>
              <p className="text-primary-200 text-sm">
                {course ? course.name : '新建课程'}
              </p>
            </div>
          </div>
          <p className="text-primary-100 max-w-2xl">
            上传相关学习资料，系统将以试卷为核心，反推真正的考点和预习重点。
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uploadConfigs.map((config) => (
            <UploadZone
              key={config.type}
              type={config.type}
              icon={config.icon}
              title={config.title}
              description={config.description}
              highlighted={config.highlighted}
              delay={config.delay}
              files={getFilesByType(config.type)}
              onFileSelect={(file) => handleFileSelect(config.type, file)}
              onFileRemove={(fileId) => handleFileRemove(config.type, fileId)}
            />
          ))}
        </div>

        <div className="card card-content mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-accent-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-900 mb-1">分析说明</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• 试卷为最高权重分析依据，建议上传2份以上效果更佳</li>
                <li>• 教材用于将考点映射到具体章节和内容</li>
                <li>• 教案和笔记作为辅助参考，帮助优化预习方案</li>
                <li>• 所有文件仅在本地处理，不会上传到服务器</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 py-4 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-500">已上传文件：</span>
              <span className="font-bold text-primary-700">{totalFiles}</span>
              <span className="text-slate-400 ml-1">份</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">试卷：</span>
              <span className={cn('font-bold', examPaperCount > 0 ? 'text-accent-600' : 'text-slate-400')}>
                {examPaperCount}
              </span>
              <span className="text-slate-400 ml-1">份</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="btn-secondary">
              取消
            </button>
            <button
              onClick={handleStartAnalysis}
              disabled={!canStartAnalysis}
              className={cn(
                'btn-accent flex items-center gap-2',
                !canStartAnalysis && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-md'
              )}
            >
              <Sparkles size={18} />
              开始分析
            </button>
          </div>
        </div>
      </div>

      {!canStartAnalysis && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-pulse-slow">
            请至少上传 1 份试卷后开始分析
          </div>
        </div>
      )}
    </div>
  );
}
