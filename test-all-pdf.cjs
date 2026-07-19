const pdfjsLib = require('pdfjs-dist/build/pdf.js');
const fs = require('fs');
const path = require('path');

const testFiles = [
  'C:/Users/ASUS/Desktop/英语预习资料/预习系统--英语/预习系统--英语/Unit 1　Friendship/Unit_1_Friendship.pdf',
  'C:/Users/ASUS/Desktop/英语预习资料/预习系统--英语/预习系统--英语/重点汇总/新八年级（上）英语课文翻译Unit1（译林版）(1).pdf',
  'C:/Users/ASUS/Desktop/英语预习资料/预习系统--英语/预习系统--英语/单元知识清单Unit 1 教师版.pdf',
  'C:/Users/ASUS/Desktop/英语预习资料/预习系统--英语/预习系统--英语/2025秋英语八上讲义 Unit 1.pdf',
];

async function testPdf(filePath) {
  console.log('\n=========================================');
  console.log(`测试文件: ${path.basename(filePath)}`);
  console.log('=========================================');
  
  try {
    const stats = fs.statSync(filePath);
    console.log(`文件大小: ${stats.size} bytes (${(stats.size / (1024*1024)).toFixed(1)} MB)`);
    
    const buffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(buffer);
    
    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;
    
    console.log(`页数: ${pdf.numPages}`);
    
    let totalText = '';
    let hasText = false;
    
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const textItems = (textContent.items)
        .filter((item) => typeof item === 'object' && item !== null && 'str' in item);
      
      const pageText = textItems.map((item) => item.str).join('');
      totalText += pageText;
      
      if (pageText.length > 0) {
        hasText = true;
        console.log(`第 ${pageNum} 页: ${pageText.length} 字符`);
      } else {
        console.log(`第 ${pageNum} 页: 无文字内容（可能是图片）`);
      }
    }
    
    if (hasText) {
      console.log(`✅ 有可提取文字，前200字符: "${totalText.substring(0, 200)}"`);
      return { success: true, hasText: true };
    } else {
      console.log(`⚠️ 无可提取文字，可能是扫描版PDF`);
      return { success: true, hasText: false };
    }
    
  } catch (error) {
    console.error(`❌ 解析失败: ${error.name} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  for (const file of testFiles) {
    await testPdf(file);
  }
}

main().catch(console.error);
