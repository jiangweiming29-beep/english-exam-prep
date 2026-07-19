import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  AlertCircle,
  FileText,
  Trash2,
  Clock,
  Filter,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getErrorLogs, clearErrorLogs, type ErrorLog } from '@/services/fileReader';

const errorTypeLabels: Record<ErrorLog['type'], string> = {
  file_read: '文件读取',
  pdf_parse: 'PDF解析',
  upload: '上传',
  analysis: '分析',
  other: '其他',
};

const errorTypeColors: Record<ErrorLog['type'], string> = {
  file_read: 'bg-orange-100 text-orange-700',
  pdf_parse: 'bg-red-100 text-red-700',
  upload: 'bg-blue-100 text-blue-700',
  analysis: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-700',
};

export default function ErrorLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ErrorLog[]>(() => getErrorLogs());
  const [filterType, setFilterType] = useState<ErrorLog['type'] | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = filterType === 'all'
    ? logs
    : logs.filter((log) => log.type === filterType);

  const handleClearLogs = () => {
    if (window.confirm('确定要清空所有错误日志吗？')) {
      clearErrorLogs();
      setLogs([]);
    }
  };

  const handleCopyLog = (log: ErrorLog) => {
    const logText = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(logText);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            返回首页
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">错误日志</h1>
              <p className="text-primary-200 text-sm">
                共 {logs.length} 条记录
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ErrorLog['type'] | 'all')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部类型</option>
              {Object.entries(errorTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            <Trash2 size={16} />
            清空日志
          </button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="card card-content text-center py-12">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">暂无错误日志</h3>
            <p className="text-sm text-slate-400">系统运行正常，没有记录到错误</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="card card-content border-l-4 border-red-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        errorTypeColors[log.type]
                      )}
                    >
                      {errorTypeLabels[log.type]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyLog(log)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  >
                    {copiedId === log.id ? (
                      <>
                        <Check size={12} />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        复制
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">
                    {log.errorMessage}
                  </p>

                  {log.fileName && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText size={12} />
                      <span>{log.fileName}</span>
                      {log.fileSize && (
                        <span className="text-slate-400">
                          ({(log.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                  )}

                  {log.fileType && (
                    <div className="text-xs text-slate-500">
                      文件类型: {log.fileType}
                    </div>
                  )}

                  {log.courseId && (
                    <div className="text-xs text-slate-500">
                      课程ID: {log.courseId.slice(0, 8)}...
                    </div>
                  )}

                  {log.details && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                      <strong className="text-slate-700">详情:</strong> {log.details}
                    </div>
                  )}

                  {log.errorStack && (
                    <div className="text-xs text-slate-500 bg-slate-900 text-slate-300 p-3 rounded font-mono max-h-32 overflow-auto">
                      {log.errorStack}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
