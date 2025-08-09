// src/components/QuestionPreviewList.tsx
// 题目预览列表组件
import React from 'react';
// import { Card, Checkbox } from 'antd';
import { Question } from '../service/question';
import QuestionCard from './QuestionCard';

interface QuestionPreviewListProps {
  questions: Question[]; // 要展示的题目数组
  selected: number[]; // 当前选中的题目索引列表
  onToggleSelect: (index: number) => void; // 切换选中状态的函数
}

const QuestionPreviewList: React.FC<QuestionPreviewListProps> = ({
  questions,
  selected,
  onToggleSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold mb-2">生成的题目</div>
      {questions.map((question, index) => {
        return (
          <QuestionCard
            key={index}
            question={question}
            index={index}
            checked={selected.includes(index)}
            onToggle={() => onToggleSelect(index)}
            selectable
          />
        );
      })}
    </div>
  );
};

export default React.memo(QuestionPreviewList);
