const pdfjsLib = require('pdfjs-dist/build/pdf.js');
const fs = require('fs');
const path = require('path');

const testFile = 'C:/Users/ASUS/Desktop/英语预习资料/预习系统--英语/预习系统--英语/Unit 1　Friendship/Unit_1_Friendship.pdf';

async function testPdf(filePath) {
  console.log('\n=========================================');
  console.log(`测试文件: ${path.basename(filePath)}`);
  console.log('=========================================');
  
  try {
    const stats = fs.statSync(filePath);
    console.log(`文件大小: ${stats.size} bytes (${(stats.size / (1024*1024)).toFixed(1)} MB)`);
    
    const buffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(buffer);
    console.log(`读取字节数: ${uint8Array.length}`);
    
    // 检查PDF文件头
    const header = Buffer.from(uint8Array.slice(0, 15)).toString('ascii');
    console.log(`文件头: ${JSON.stringify(header)}`);
    
    console.log('开始调用 getDocument...');
    const startTime = Date.now();
    
    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ PDF加载成功，页数: ${pdf.numPages}，耗时: ${loadTime}ms`);
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
      console.log(`解析第 ${pageNum} 页...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const textItems = (textContent.items)
        .filter((item) => typeof item === 'object' && item !== null && 'str' in item);
      
      const pageText = textItems.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
      console.log(`第 ${pageNum} 页: ${pageText.length} 字符`);
    }
    
    fullText = fullText.trim();
    console.log(`\n✅ 前5页总字符数: ${fullText.length}`);
    console.log(`\n前500字符预览:\n${fullText.substring(0, 500)}`);
    
    return { success: true, textLength: fullText.length };
  } catch (error) {
    console.error(`\n❌ 解析失败:`);
    console.error(`错误名称: ${error.name}`);
    console.error(`错误消息: ${error.message}`);
    console.error(`错误堆栈:\n${error.stack}`);
    return { success: false, error: error.message, name: error.name };
  }
}

testPdf(testFile).catch(console.error);
