// PDF解析服务 - 使用CDN动态加载pdfjs-dist
import { logError } from './errorLogger';
import type { ErrorLog } from './errorLogger';

// 重新导出错误日志相关功能，保持向后兼容
export { logError, getErrorLogs, clearErrorLogs } from './errorLogger';
export type { ErrorLog };

export interface FileReadResult {
  text: string;
  formatSupported: boolean;
  hint?: string;
}

// PDF.js CDN配置 - 使用稳定版本3.11.174
const PDFJS_CDN_VERSION = '3.11.174';
const PDFJS_CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}`;
const PDFJS_MAIN_URL = `${PDFJS_CDN_BASE}/pdf.min.js`;
const PDFJS_WORKER_URL = `${PDFJS_CDN_BASE}/pdf.worker.min.js`;

let pdfjsLibLoaded: any = null;

// 动态加载pdfjs-dist主库
async function loadPdfjsLib(): Promise<any> {
  if (pdfjsLibLoaded) {
    return pdfjsLibLoaded;
  }

  console.log(`[PDF解析] 正在从CDN加载pdfjs-dist: ${PDFJS_MAIN_URL}`);

  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if ((window as any).pdfjsLib) {
      pdfjsLibLoaded = (window as any).pdfjsLib;
      // 设置worker
      pdfjsLibLoaded.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      console.log('[PDF解析] pdfjs-dist已加载（缓存）');
      resolve(pdfjsLibLoaded);
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_MAIN_URL;
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (!lib) {
        reject(new Error('pdfjs-dist加载失败：全局对象未找到'));
        return;
      }
      // 设置worker路径
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      pdfjsLibLoaded = lib;
      console.log('[PDF解析] pdfjs-dist加载成功');
      resolve(lib);
    };
    script.onerror = () => {
      reject(new Error(`pdfjs-dist加载失败：无法加载 ${PDFJS_MAIN_URL}`));
    };
    document.head.appendChild(script);
  });
}

export async function readFileAsText(file: File): Promise<FileReadResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return readPdfFile(file);
  } else if (fileName.endsWith('.txt')) {
    const text = await readFileAsTextRaw(file);
    return { text, formatSupported: true };
  } else if (file.type.startsWith('text/')) {
    const text = await readFileAsTextRaw(file);
    return { text, formatSupported: true };
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
    return { text: '', formatSupported: false, hint };
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
    return { text: '', formatSupported: false, hint };
  } else {
    const text = await readFileAsTextRaw(file);
    return { text, formatSupported: true };
  }
}

async function readFileAsTextRaw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else if (result instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        resolve(decoder.decode(result));
      } else {
        resolve('');
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'UTF-8');
  });
}

async function readPdfFile(file: File): Promise<FileReadResult> {
  try {
    console.log(`[PDF解析] 开始解析文件: ${file.name}, 大小: ${file.size} bytes`);

    // 动态加载pdfjs-dist
    const pdfjsLib = await loadPdfjsLib();

    const arrayBuffer = await file.arrayBuffer();
    console.log(`[PDF解析] 文件读取完成，字节数: ${arrayBuffer.byteLength}`);

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
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
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('loadPdfjsLib')) {
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
