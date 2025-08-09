// src/pages/StudyNotes.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
// import index from '../index.css'; // 引入全局样式
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight'; // 代码高亮插件

import 'highlight.js/styles/stackoverflow-light.css'; // 引入代码高亮样式

const StudyNotes: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    console.log('开始发送 /api/readme 请求');

    fetch('/api/readme')
      .then((res) => {
        console.log('请求 /api/readme 的响应状态:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('请求 /api/readme 的响应数据:', data);
        setMarkdown(data.content);
      })
      .catch((err) => {
        console.error('请求 /api/readme 出错:', err);
        setMarkdown('加载失败：' + err.message);
      });
  }, []);
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default StudyNotes;
