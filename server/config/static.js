



import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import koaStatic from 'koa-static';

// 获取项目根目录
const getRootDir = () => {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(__filename);
};

const rootDir = join(getRootDir(), '../');

export const staticMiddleware = [
  // 前端打包文件
  koaStatic(join(rootDir, 'client/dist')),
  
  // 图片资源
  koaStatic(join(rootDir, 'images'), {
    prefix: '/images'
  })
];