export interface FileReadResult {
  text: string;
  formatSupported: boolean;
  hint?: string;
}

export async function readFileAsText(file: File): Promise<FileReadResult> {
  return new Promise((resolve, reject) => {
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

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt')) {
      reader.readAsText(file, 'UTF-8');
    } else if (file.type.startsWith('text/')) {
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
    } else if (fileName.endsWith('.pdf')) {
      const hint = `当前版本暂不支持直接解析PDF文件内容。

建议操作：
1. 打开PDF文件，全选文字（Ctrl+A）
2. 复制文字内容（Ctrl+C）
3. 打开记事本，粘贴内容（Ctrl+V）
4. 保存为 .txt 文件
5. 再上传 .txt 文件进行分析

小技巧：
• 确保试卷内容完整，包括题目、选项、阅读文章等
• 如果是扫描版PDF，请先用OCR软件识别文字
• 建议上传2份以上试卷，分析结果更准确`;
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
      reader.readAsText(file, 'UTF-8');
    }
  });
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
