import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, message, Divider } from 'antd';
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

const ExamGeneration: React.FC = () => {
  const [form] = Form.useForm<ExamGenerationForm>();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (values: ExamGenerationForm) => {
    try {
      setLoading(true);
      // 调用AI组卷API
      await questionService.generateExam(values);
      message.success('试卷生成成功！');
      // 跳转到答题页面
    
    } catch (error) {
      message.error('组卷失败，请重试');
    } finally {
      setLoading(false);
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
    </div>
  );
};

export default ExamGeneration;