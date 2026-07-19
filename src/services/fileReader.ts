import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export interface FileReadResult {
  text: string;
  formatSupported: boolean;
  hint?: string;
}

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

export async function readFileAsText(file: File): Promise<FileReadResult> {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      readPdfFile(file)
        .then((result) => resolve(result))
        .catch((error) => {
          reject(new Error(`PDF解析失败: ${error.message}`));
        });
    } else if (fileName.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string || '';
        resolve({ text, formatSupported: true });
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    } else if (file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string || '';
        resolve({ text, formatSupported: true });
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    } else if (file.type.startsWith('image/')) {
      const hint = `当前版本暂不支持图片OCR文字识别。

建议操作：
1. 将图片中的文字内容复制出来
2. 粘贴到记事本中保存为 .txt 文件
3. 再上传 .txt 文件进行分析

常见的试卷内容格式：
- 选择题：1. ______ A. B. C. D.
- 填空题：1. ____________
- 阅读理解：Passage 1 / 阅读短文...
- 写作题：书面表达 / 写作`;
      resolve({ text: '', formatSupported: false, hint });
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      const hint = `当前版本暂不支持直接解析Word文件内容。

建议操作：
1. 打开Word文档，全选文字（Ctrl+A）
2. 复制文字内容（Ctrl+C）
3. 打开记事本，粘贴内容（Ctrl+V）
4. 保存为 .txt 文件
5. 再上传 .txt 文件进行分析

注意：
• 请确保保留题目编号和选项格式
• 阅读文章和写作题也要完整复制`;
      resolve({ text: '', formatSupported: false, hint });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        let text = '';
        if (typeof result === 'string') {
          text = result;
        } else if (result instanceof ArrayBuffer) {
          const decoder = new TextDecoder('utf-8');
          text = decoder.decode(result);
        }
        resolve({ text, formatSupported: true });
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    }
  });
}

async function readPdfFile(file: File): Promise<FileReadResult> {
  try {
    console.log(`[PDF解析] 开始解析文件: ${file.name}, 大小: ${file.size} bytes`);
    console.log(`[PDF解析] Worker路径: ${pdfWorker}`);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log(`[PDF解析] 文件读取完成，字节数: ${arrayBuffer.byteLength}`);
    
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      worker: new Worker(pdfWorker) as any,
    }).promise;
    
    console.log(`[PDF解析] PDF文档加载成功，页数: ${pdf.numPages}`);
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const textItems = (textContent.items as any[])
        .filter((item) => typeof item === 'object' && item !== null && 'str' in item);
      
      const pageText = textItems.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
      
      console.log(`[PDF解析] 第 ${pageNum} 页解析完成，字符数: ${pageText.length}`);
    }
    
    fullText = fullText.trim();
    console.log(`[PDF解析] 全部解析完成，总字符数: ${fullText.length}`);
    
    if (fullText.length === 0) {
      console.log(`[PDF解析] 警告: PDF内容为空，可能是扫描版PDF`);
      return {
        text: '',
        formatSupported: false,
        hint: 'PDF文件内容为空或无法提取文字。如果是扫描版PDF，请先用OCR软件识别文字后保存为.txt文件再上传。',
      };
    }
    
    return {
      text: fullText,
      formatSupported: true,
    };
  } catch (error) {
    let errorMessage = '未知错误';
    let errorName = 'UnknownError';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorName = error.name;
    }
    
    console.error(`[PDF解析] 失败 - ${errorName}: ${errorMessage}`, error);
    
    let hint = '';
    if (errorMessage.includes('Invalid PDF structure') || errorMessage.includes('Cannot read')) {
      hint = 'PDF文件格式无效或已损坏。请检查文件是否完整，或尝试重新下载。';
    } else if (errorMessage.includes('Password')) {
      hint = 'PDF文件受密码保护。请先移除密码保护，或将内容复制到.txt文件后上传。';
    } else if (errorMessage.includes('Failed to fetch')) {
      hint = 'PDF解析服务加载失败，请检查网络连接，或尝试将PDF内容复制到.txt文件后上传。';
    } else if (errorMessage.includes('Worker') || errorMessage.includes('worker')) {
      hint = 'PDF解析引擎初始化失败，请刷新页面重试，或尝试将PDF内容复制到.txt文件后上传。';
    } else if (errorName === 'TypeError') {
      hint = 'PDF解析过程中发生类型错误，请尝试使用其他PDF阅读器打开文件确认文件是否正常。';
    } else {
      hint = `PDF解析失败: ${errorMessage}

建议操作：
1. 尝试打开PDF文件确认文件是否正常
2. 如果文件正常，将内容复制到.txt文件后再上传
3. 如果是扫描版PDF，请先用OCR软件识别文字`;
    }
    
    logError({
      type: 'pdf_parse',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      errorMessage: `${errorName}: ${errorMessage}`,
      errorStack: error instanceof Error ? error.stack : undefined,
      details: hint,
    });
    
    return {
      text: '',
      formatSupported: false,
      hint,
    };
  }
}

export function cleanExtractedText(text: string): string {
  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  return cleaned;
}

export function estimateQuestionCount(text: string): number {
  const numberedPattern = /\d+\.\s/g;
  const matches = text.match(numberedPattern);
  return matches ? matches.length : 0;
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
