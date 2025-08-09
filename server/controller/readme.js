import fs from 'fs/promises';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const getReadmeContent = async (ctx) => {
    console.log('getReadmeContent 函数被调用');
  try {
    // 计算项目根目录，假设app.js在server根目录
    const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
    const rootDir = path.join(__dirname, '../..');
    const readmePath = path.join(rootDir, 'readme.md');
console.log('计算得到的readme文件路径:', readmePath);
    const content = await fs.readFile(readmePath, 'utf8');
    ctx.body = { content };
  } catch (error) {
    ctx.status = 500;

    ctx.body = { error: '读取Markdown文件失败' };
  }
};