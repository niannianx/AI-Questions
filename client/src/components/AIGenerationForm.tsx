// src/components/AIGenerationForm.tsx
//表单组件
import React from 'react';
import { Form, Select, Button, InputNumber } from 'antd';

const { Option } = Select;

export interface AIFormValues {
  type: 'single' | 'multiple' | 'programming';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  language?: string[];
  model: string;
}

interface AIGenerationFormProps {
  loading: boolean;
  onGenerate: (values: AIFormValues) => void;
}

const AIGenerationForm: React.FC<AIGenerationFormProps> = ({
  loading,
  onGenerate,
}) => {
  const [form] = Form.useForm<AIFormValues>();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    console.log(values);
    onGenerate(values);
  };

  return (
    <Form
      form={form}
      layout="inline"
      initialValues={{
        type: 'single',
        count: 3,
        difficulty: 'easy',
        model: 'qwen-plus',
      }}
    >
      <Form.Item name="type" label="题型" rules={[{ required: true }]}>
        <Select style={{ width: 120 }}>
          <Option value="single">单选题</Option>
          <Option value="multiple">多选题</Option>
          <Option value="programming">编程题</Option>
        </Select>
      </Form.Item>

      <Form.Item name="count" label="题目数量" rules={[{ required: true }]}>
        <InputNumber min={1} max={10} />
      </Form.Item>

      <Form.Item
        name="difficulty"
        label="难度"
        rules={[{ required: true, message: '请选择难度' }]}
        className="mb-4"
      >
        <Select style={{ width: 120 }}>
          <Option value="easy">简单</Option>
          <Option value="medium">中等</Option>
          <Option value="hard">困难</Option>
        </Select>
      </Form.Item>

      <Form.Item name="language" label="语言">
        <Select
          style={{ width: 200 }}
          mode="multiple"
          allowClear
          placeholder="请选择编程语言"
        >
          <Option value="javascript">JavaScript</Option>
          <Option value="python">Python</Option>
          <Option value="java">Java</Option>
          <Option value="go">Go</Option>
          <Option value="c++">C++</Option>
          <Option value="c#">C#</Option>
        </Select>
      </Form.Item>

      <Form.Item name="model" label="模型" rules={[{ required: true }]}>
        <Select style={{ width: 150 }}>
          <Option value="qwen-plus">通义千问 Plus</Option>
          <Option value="qwen-turbo">通义千问 Turbo</Option>
          <Option value="qwen-max">通义千问 Max</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleSubmit} loading={loading}>
          生成并预览题库
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AIGenerationForm;
