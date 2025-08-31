import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, message, Divider, Space, Col, Modal, Row, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, SaveOutlined } from '@ant-design/icons';
import questionService from '../service/question';

const { Option } = Select;

interface ExamGenerationForm {
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    questionCounts: {
        single: number;
        multiple: number;
        programming: number;
    };
    topics: string[];
}
interface ExamQuestion {
    type: string;
    question_id: string;
    content: string;
    options?: string[];
    answer?: string;
    answers?: string[];
    language?: string;
    example_input?: string;
    example_output?: string;
    hints?: string[];
}

interface ExamData {
    subject: string;
    difficulty: string;
    duration_minutes: number;
    questions: ExamQuestion[];
}

// 添加缺失的辅助函数
const getQuestionTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
        'single_choice': '单选题',
        'multiple_choice': '多选题',
        'coding': '编程题'
    };
    return typeMap[type] || type;
};


const ExamGeneration: React.FC = () => {
    const [form] = Form.useForm<ExamGenerationForm>();
    const [loading, setLoading] = useState(false);
    const [generatedExam, setGeneratedExam] = useState<ExamData | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleGenerate = async (values: ExamGenerationForm) => {
        try {
            setLoading(true);
            // 调用AI组卷API
            const response = await questionService.generateExam(values);
            if (response.code === 0) {
                console.log('试卷数据:', response.data);
                setGeneratedExam(response.data);
                message.success('试卷生成成功！');
            } else {
                message.error(response.message || '组卷失败');
            }


        } catch (error) {
            message.error('组卷失败，请重试');
        } finally {
            setLoading(false);
        }
    };
    const handlePreview = () => {
        setPreviewVisible(true);
    };

    const handleSave = async () => {
        if (!generatedExam) return;

        try {
            setSaving(true);
            // 这里可以调用保存试卷的API
            // await questionService.saveExam(generatedExam);
            message.success('试卷保存成功！');
            // 可以选择跳转到试卷管理页面
            // navigate('/exam-management');
        } catch (error) {
            message.error('保存失败，请重试');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <Card title="智能组卷" className="mb-6">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleGenerate}
                    initialValues={{
                        subject: 'programming',
                        difficulty: 'medium',
                        duration: 120,
                        questionCounts: {
                            single: 10,
                            multiple: 5,
                            programming: 3,
                        },
                        topics: ['javascript', 'python'],
                    }}
                >
                    <Form.Item name="subject" label="科目" rules={[{ required: true }]}>
                        <Select>
                            <Option value="programming">编程基础</Option>
                            <Option value="algorithm">算法设计</Option>
                            <Option value="database">数据库</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="difficulty" label="整体难度" rules={[{ required: true }]}>
                        <Select>
                            <Option value="easy">简单</Option>
                            <Option value="medium">中等</Option>
                            <Option value="hard">困难</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="duration" label="考试时长(分钟)" rules={[{ required: true }]}>
                        <InputNumber min={30} max={300} />
                    </Form.Item>

                    <Divider>题目数量配置</Divider>

                    <Form.Item name={['questionCounts', 'single']} label="单选题数量">
                        <InputNumber min={0} max={50} />
                    </Form.Item>

                    <Form.Item name={['questionCounts', 'multiple']} label="多选题数量">
                        <InputNumber min={0} max={30} />
                    </Form.Item>

                    <Form.Item name={['questionCounts', 'programming']} label="编程题数量">
                        <InputNumber min={0} max={10} />
                    </Form.Item>

                    <Form.Item name="topics" label="知识点">
                        <Select mode="multiple" placeholder="选择相关知识点">
                            <Option value="javascript">JavaScript</Option>
                            <Option value="python">Python</Option>
                            <Option value="java">Java</Option>
                            <Option value="algorithm">算法</Option>
                            <Option value="data-structure">数据结构</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            AI智能组卷
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* 生成的试卷操作区域 */}
            {generatedExam && (
                <Card title="试卷操作" className="mb-6">
                    <Space size="large">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={handlePreview}
                            size="large"
                        >
                            预览试卷
                        </Button>
                        <Button
                            type="default"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={saving}
                            size="large"
                        >
                            保存试卷
                        </Button>
                    </Space>
                </Card>
            )}

            {/* 试卷预览模态框 */}
            <Modal
                title="试卷预览"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        关闭
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave} loading={saving}>
                        保存试卷
                    </Button>
                ]}
                width={800}
                style={{ top: 20 }}
            >
                {generatedExam && (
                    <div className="exam-preview">
                        <div className="text-center mb-6">
                            <Typography.Title level={2}>{generatedExam.subject || '编程考试试卷'}</Typography.Title>
                            <Row gutter={16} className="mb-4">
                                <Col span={6}>
                                    <Typography.Text>科目：{generatedExam.subject}</Typography.Text>
                                </Col>
                                <Col span={6}>
                                    <Typography.Text>难度：{generatedExam.difficulty}</Typography.Text>
                                </Col>
                                <Col span={6}>
                                    <Typography.Text>时长：{generatedExam.duration_minutes}分钟</Typography.Text>
                                </Col>
                                <Col span={6}>
                                    <Typography.Text>总题数：{generatedExam.questions.length}</Typography.Text>
                                </Col>
                            </Row>
                        </div>

                        <Divider />
                        <div className="questions-list">
                            {generatedExam.questions && generatedExam.questions.map((question, index) => (
                                <div key={question.question_id} className="question-group mb-6">
                                    <div className="question-header mb-3">
                                        <Space>
                                            <Typography.Text strong>{index + 1}.</Typography.Text>
                                            <Tag color="blue">{getQuestionTypeText(question.type)}</Tag>
                                            {question.language && (
                                                <Tag color="green">{question.language}</Tag>
                                            )}
                                        </Space>
                                    </div>
                                    <div className="question-content mb-3">
                                        <Typography.Text>{question.content}</Typography.Text>
                                    </div>

                                    {question.options && question.options.length > 0 && (
                                        <div className="question-options mb-3">
                                            {question.options.map((option, optIndex) => (
                                                <div key={optIndex} className="option-item ml-6 mb-1">
                                                    <Typography.Text>{option}</Typography.Text>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {question.answer && (
                                        <div className="question-answer mb-3">
                                            <Typography.Text type="secondary">答案：{question.answer}</Typography.Text>
                                        </div>
                                    )}

                                    {question.answers && question.answers.length > 0 && (
                                        <div className="question-answers mb-3">
                                            <Typography.Text type="secondary">答案：{question.answers.join(', ')}</Typography.Text>
                                        </div>
                                    )}

                                    {question.example_input && question.example_input.length > 0 && (
                                        <div className="question-example mb-3">
                                            <Typography.Text type="secondary">示例输入：{question.example_input}</Typography.Text>
                                        </div>
                                    )}

                                    {question.example_output && question.example_output.length > 0 && (
                                        <div className="question-example mb-3">
                                            <Typography.Text type="secondary">示例输出：{question.example_output}</Typography.Text>
                                        </div>
                                    )}
                                    {question.hints && question.hints.length > 0 && (
                                        <div className="question-hints mb-3">
                                            <Typography.Text type="secondary">提示：{question.hints.join(', ')}</Typography.Text>
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

export default ExamGeneration;