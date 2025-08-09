import React from 'react';
import { Input, Button, Space, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface QuestionFilterBarProps {
  onSearch: (value: string) => void;
  onTypeFilter: (value: string | undefined) => void;
  onAddQuestion: (type: 'ai' | 'manual') => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  currentType?: string;
}

const QuestionFilterBar: React.FC<QuestionFilterBarProps> = ({
  onSearch,
  onTypeFilter,
  onAddQuestion,
  selectedCount,
  onDeleteSelected,
  currentType,
}) => {
  const addQuestionMenu = {
    items: [
      {
        key: 'ai',
        label: 'AI 出题',
        onClick: () => onAddQuestion('ai'),
      },
      {
        key: 'manual',
        label: '自主出题',
        onClick: () => onAddQuestion('manual'),
      },
    ],
  };

  const getButtonType = (type: string | undefined) => {
    return currentType === type ? 'primary' : 'default';
  };

  return (
    <div className="mb-4 flex justify-between md:items-center  md:flex-row  flex-col items-start transition-all duration-300 ease-smooth will-change-transform">
      <Space className="mb-4 md:flex-row   items-start   flex-col transition-all duration-300 ease-smooth will-change-transform ">
        <Input.Search
          placeholder="请输入试题名称"
          onSearch={onSearch}
          className="min-w-[60px]"
        />
        <Space.Compact>
          <Button
            type={getButtonType(undefined)}
            onClick={() => onTypeFilter(undefined)}
          >
            全部
          </Button>
          <Button
            type={getButtonType('single')}
            onClick={() => onTypeFilter('single')}
          >
            单选题
          </Button>
          <Button
            type={getButtonType('multiple')}
            onClick={() => onTypeFilter('multiple')}
          >
            多选题
          </Button>
          <Button
            type={getButtonType('programming')}
            onClick={() => onTypeFilter('programming')}
          >
            编程题
          </Button>
        </Space.Compact>
      </Space>
      <Space className="mb-4">
        <Dropdown menu={addQuestionMenu}>
          <Button type="primary">
            出题 <DownOutlined />
          </Button>
        </Dropdown>

        <Button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className={`${selectedCount > 0 ? 'border-red-700 text-red-700' : '  border-gray-500 text-gray-500 cursor-not-allowed'}`}
        >
          批量删除
        </Button>
      </Space>
    </div>
  );
};

export default QuestionFilterBar;
