import React from 'react';
import { Table, Button, Space, Tag, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Question } from '../service/question';

interface QuestionTableProps {
  questions: Question[];
  total: number;
  loading: boolean;
  queryParams: { page: number; pageSize: number };
  onPageChange: (page: number, pageSize: number) => void;
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedKeys: React.Key[]) => void;
  onEdit: (record: Question) => void;
  onDelete: (ids: number[]) => void;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  total,
  loading,
  queryParams,
  onPageChange,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
}) => {
  const confirmDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确定要删除这个题目吗？此操作不可撤销。',
      okText: '确认',
      okType: 'danger',
      onOk: () => onDelete([id]), // 确认后调用父组件的删除方法
    });
  };

  const columns: ColumnsType<Question> = [
    {
      title: '题目',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 'auto',
      minWidth: 70,
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      responsive: ['sm'],
      render: (type) => (
        <Tag
          color={
            type === 'programming'
              ? 'blue'
              : type === 'multiple'
                ? 'green'
                : 'orange'
          }
        >
          {type === 'programming'
            ? '编程题'
            : type === 'multiple'
              ? '多选题'
              : '单选题'}
        </Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      responsive: ['md'],
      render: (difficulty) => (
        <Tag
          color={
            difficulty === 'easy'
              ? 'success'
              : difficulty === 'medium'
                ? 'warning'
                : 'error'
          }
        >
          {difficulty === 'easy'
            ? '简单'
            : difficulty === 'medium'
              ? '中等'
              : '困难'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      responsive: ['lg'],
      render: (date) =>
        new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date(date)),
    },
    {
      title: '操作',
      key: 'action',
      className: 'sm:w-[150px]  w-[100px]  transition-all duration-300',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => onEdit(record)}
            className="sm:px-[15px]  px-0 transition-all duration-300"
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            onClick={() => confirmDelete(record.id!)}
            className="sm:px-[15px]  px-0 transition-all duration-300"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={questions}
      rowKey="id"
      loading={loading}
      pagination={{
        total,
        current: queryParams.page,
        pageSize: queryParams.pageSize,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPageChange,
      }}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      // scroll={{ y:410 }}
    />
  );
};

export default React.memo(QuestionTable);
