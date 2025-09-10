import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  message, 
  Tag, 
  Typography, 
  Row, 
  Col,
  Divider,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  EyeOutlined, 
  PlayCircleOutlined, 
  DeleteOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import questionService from '../service/question';

const { Title, Text } = Typography;

interface Exam {
  id: number;
  title: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalScore: number;
  status: string;
  createdAt: string;
  _count: {
    examQuestions: number;
  };
}

interface ExamDetail {
  id: number;
  title: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalScore: number;
  status: string;
  createdAt: string;
  examQuestions: Array<{
    id: number;
    type: string;
    content: string;
    options?: string;
    answer?: string;
    score: number;
    difficulty: string;
    language?: string;
    order: number;
  }>;
}

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const navigate = useNavigate();

  // 获取试卷列表
  const fetchExamList = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await questionService.getExamList({ page, pageSize });
      if (response.code === 0) {
        setExams(response.data.exams);
        setPagination({
          current: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total
        });
      } else {
        message.error(response.message || '获取试卷列表失败');
      }
    } catch (error) {
      message.error('获取试卷列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取试卷详情
  const fetchExamDetail = async (examId: number) => {
    try {
      const response = await questionService.getExamDetail(examId);
      if (response.code === 0) {
        setSelectedExam(response.data);
        setDetailVisible(true);
      } else {
        message.error(response.message || '获取试卷详情失败');
      }
    } catch (error) {
      message.error('获取试卷详情失败');
    }
  };

  // 删除试卷
  const handleDelete = async (examId: number) => {
    try {
      const response = await questionService.deleteExam(examId);
      if (response.code === 0) {
        message.success('删除成功');
        fetchExamList(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 开始答题（暂时不跳转）
  const handleStartExam = (exam: Exam|ExamDetail) => {
    message.info('答题功能开发中，敬请期待！');
  };

  // 查看试卷详情
  const handleViewDetail = (exam: Exam) => {
    fetchExamDetail(exam.id);
  };

  // 表格列定义
  const columns = [
    {
      title: '试卷标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => {
        const colorMap: Record<string, string> = {
          'easy': 'green',
          'medium': 'orange',
          'hard': 'red'
        };
        return <Tag color={colorMap[difficulty] || 'default'}>{difficulty}</Tag>;
      }
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}分钟`
    },
    // {
    //   title: '总分',
    //   dataIndex: 'totalScore',
    //   key: 'totalScore',
    //   render: (score: number) => `${score}分`
    // },
    {
      title: '题目数量',
      dataIndex: '_count',
      key: 'questionCount',
      render: (count: any) => count.examQuestions
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Exam) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="开始答题">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleStartExam(record)}
            />
          </Tooltip>
          <Tooltip title="删除试卷">
            <Popconfirm
              title="确定要删除这个试卷吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  useEffect(() => {
    fetchExamList();
  }, []);

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    fetchExamList(pagination.current, pagination.pageSize);
  };

  return (
    <div className="p-6">
      <Card 
        title={
          <Row justify="space-between" align="middle">
            <Title level={3} style={{ margin: 0 }}>试卷管理</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/exam-generation')}
            >
              智能组卷
            </Button>
          </Row>
        }
        className="mb-6"
      >
        <Table
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 试卷详情模态框 */}
      <Modal
        title="试卷详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="start" 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={() => {
              if (selectedExam) {
                handleStartExam(selectedExam);
                setDetailVisible(false);
              }
            }}
          >
            开始答题
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedExam && (
          <div className="exam-detail">
            <div className="text-center mb-6">
              <Title level={2}>{selectedExam.title}</Title>
              <Row gutter={16} className="mb-4">
                <Col span={6}>
                  <Text>科目：{selectedExam.subject}</Text>
                </Col>
                <Col span={6}>
                  <Text>难度：{selectedExam.difficulty}</Text>
                </Col>
                <Col span={6}>
                  <Text>时长：{selectedExam.duration}分钟</Text>
                </Col>
                <Col span={6}>
                  <Text>总分：{selectedExam.totalScore}分</Text>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="questions-list">
              {selectedExam.examQuestions.map((question, index) => (
                <div key={question.id} className="question-group mb-6">
                  <div className="question-header mb-3">
                    <Space>
                      <Text strong>{index + 1}.</Text>
                      <Tag color="blue">{question.type}</Tag>
                      {question.language && (
                        <Tag color="green">{question.language}</Tag>
                      )}
                      <Tag color="orange">{question.score}分</Tag>
                    </Space>
                  </div>
                  <div className="question-content mb-3">
                    <Text>{question.content}</Text>
                  </div>

                  {question.options && (
                    <div className="question-options mb-3">
                      {JSON.parse(question.options).map((option: string, optIndex: number) => (
                        <div key={optIndex} className="option-item ml-6 mb-1">
                          <Text>{option}</Text>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.answer && (
                    <div className="question-answer mb-3">
                      <Text type="secondary">答案：{question.answer}</Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamManagement;