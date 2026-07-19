// 错误日志系统
export interface ErrorLog {
  id: string;
  timestamp: Date;
  type: 'file_read' | 'pdf_parse' | 'upload' | 'analysis' | 'other';
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  errorMessage: string;
  errorStack?: string;
  details?: string;
  courseId?: string;
}

export function logError(log: Omit<ErrorLog, 'id' | 'timestamp'>): void {
  const errorLog: ErrorLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  try {
    const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    logs.push(errorLog);
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    localStorage.setItem('errorLogs', JSON.stringify(logs));
  } catch {
    console.error('Failed to save error log');
  }

  console.error('Error Log:', errorLog);
}

export function getErrorLogs(): ErrorLog[] {
  try {
    return JSON.parse(localStorage.getItem('errorLogs') || '[]');
  } catch {
    return [];
  }
}

export function clearErrorLogs(): void {
  localStorage.removeItem('errorLogs');
}
