import React, { useState } from 'react';
import { Form, Select, InputNumber, Button, Card, message, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface ExamFormValues {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  questionCounts: {
    single: number;
    multiple: number;
    programming: number;
  };
  topics: string[];
  model: string;
}

const ExamGenerationForm: React.FC = () => {
  const [form] = Form.useForm<ExamFormValues>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (values: ExamFormValues) => {
    try {
      setLoading(true);
      
      // 调用智能组卷API
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      const result = await response.json();
      
      if (result.code === 0) {
        message.success('试卷生成成功！');
        // 跳转到答题页面
        navigate('/online-exam', { state: { exam: result.data } });
      } else {
        message.error(result.message || '组卷失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="智能组卷配置" className="mb-6">
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
          model: 'qwen-max',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item name="subject" label="科目" rules={[{ required: true }]}>
            <Select>
              <Option value="programming">编程基础</Option>
              <Option value="algorithm">算法设计</Option>
              <Option value="database">数据库</Option>
              <Option value="web">Web开发</Option>
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
            <InputNumber min={30} max={300} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="model" label="AI模型" rules={[{ required: true }]}>
            <Select>
              <Option value="qwen-max">通义千问 Max (推荐)</Option>
              <Option value="qwen-plus">通义千问 Plus</Option>
              <Option value="qwen-turbo">通义千问 Turbo</Option>
            </Select>
          </Form.Item>
        </div>

        <Divider>题目数量配置</Divider>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name={['questionCounts', 'single']} label="单选题数量">
            <InputNumber min={0} max={50} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name={['questionCounts', 'multiple']} label="多选题数量">
            <InputNumber min={0} max={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name={['questionCounts', 'programming']} label="编程题数量">
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item name="topics" label="知识点">
          <Select mode="multiple" placeholder="选择相关知识点">
            <Option value="javascript">JavaScript</Option>
            <Option value="python">Python</Option>
            <Option value="java">Java</Option>
            <Option value="algorithm">算法</Option>
            <Option value="data-structure">数据结构</Option>
            <Option value="database">数据库</Option>
            <Option value="web">Web开发</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large" block>
            🚀 AI智能组卷
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ExamGenerationForm;