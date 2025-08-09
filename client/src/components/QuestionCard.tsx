// src/components/QuestionCard.tsx
import React from 'react';
import { Card, Checkbox } from 'antd';
import { Question } from '../service/question';

interface QuestionCardProps {
  question: Question;
  index: number;
  checked?: boolean;
  onToggle?: () => void;
  selectable?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  checked = false,
  onToggle,
  selectable = false,
}) => {
  // 兼容 options 字段格式
  const options =
    typeof question.options === 'string'
      ? JSON.parse(question.options)
      : question.options;

  return (
    <Card
      className={`cursor-pointer transition-all ${
        checked ? 'border-blue-500 border-2' : ''
      }`}
    >
      <div className="flex items-start">
        {selectable && (
          <Checkbox
            checked={checked}
            onChange={onToggle}
            className="mt-1 mr-2"
          />
        )}
        <div className="flex-1">
          <div className="font-medium mb-2">
            {index + 1}. {question.content}
          </div>

          {options && Array.isArray(options) && (
            <div className="ml-6">
              {options.map((option: string, i: number) => (
                <div key={i} className="mb-1">
                  {String.fromCharCode(65 + i)}. {option}
                </div>
              ))}
            </div>
          )}

          {question.answer && (
            <div className="mt-2 text-green-600">
              参考答案：{question.answer}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default React.memo(QuestionCard);
