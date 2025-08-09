import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, Radio, Checkbox } from 'antd';
import { Question } from '../service/question';

const { Option } = Select;
const { TextArea } = Input;

interface QuestionEditorModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: Partial<Question>) => void;
  initialValues?: Question | null;
}

const optionLabels = ['A', 'B', 'C', 'D'];

const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  visible,
  onCancel,
  onSave,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [type, setType] = useState('single');

  // 自定义取消回调，重置表单后再关闭模态框
  const handleCancel = () => {
    form.resetFields(); // 重置表单
    onCancel(); // 通知父组件关闭模态框
  };

  useEffect(() => {
    if (visible) {
      const opts = initialValues?.options
        ? typeof initialValues.options === 'string'
          ? JSON.parse(initialValues.options)
          : initialValues.options
        : ['', '', '', ''];

      const parsedAnswer =
        initialValues?.type === 'multiple'
          ? JSON.parse(initialValues?.answer || '[]')
          : initialValues?.type === 'single'
            ? initialValues?.answer
            : initialValues?.answer || '';

      form.setFieldsValue({
        type: initialValues?.type || 'single',
        difficulty: initialValues?.difficulty || 'medium',
        content: initialValues?.content || '',
        language: initialValues?.language || undefined,
        options:
          Array.isArray(opts) && opts.length === 4 ? opts : ['', '', '', ''],
        answer: parsedAnswer,
      });

      setType(initialValues?.type || 'single');
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        options: values.options ? JSON.stringify(values.options) : null,
        answer:
          type === 'multiple' ? JSON.stringify(values.answer) : values.answer,
      };
      onSave(formattedValues);
    } catch {
      // 表单校验失败，什么都不做
    }
  };

  // 监听题型变化
  const handleTypeChange = (val: string) => {
    setType(val);
    // 重置选项和答案
    form.setFieldsValue({
      options: ['', '', '', ''],
      answer: type === 'multiple' ? [] : undefined,
    });
  };

  return (
    <Modal
      title={initialValues ? '编辑题目' : '添加题目'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="保存"
      cancelText="取消"
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'single',
          difficulty: 'medium',
          options: ['', '', '', ''],
        }}
      >
        <Form.Item name="type" label="题目类型" rules={[{ required: true }]}>
          <Select onChange={handleTypeChange}>
            <Option value="single">单选题</Option>
            <Option value="multiple">多选题</Option>
            <Option value="programming">编程题</Option>
          </Select>
        </Form.Item>

        <Form.Item name="content" label="题目内容" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>

        {/* 只在非编程题时显示选项和答案 */}
        {type !== 'programming' && (
          <>
            {/* 固定4个选项，不允许增删 */}
            {optionLabels.map((label, idx) => (
              <Form.Item
                key={label}
                label={`选项${label}`}
                name={['options', idx]}
                rules={[{ required: true, message: `请输入选项${label}内容` }]}
              >
                <Input placeholder={`请输入选项${label}内容`} />
              </Form.Item>
            ))}
            {/* 答案区域 */}
            <Form.Item
              name="answer"
              label="答案"
              rules={[{ required: true, message: '请选择答案' }]}
            >
              {type === 'single' ? (
                <Radio.Group>
                  {optionLabels.map((label) => (
                    <Radio key={label} value={label}>
                      {label}
                    </Radio>
                  ))}
                </Radio.Group>
              ) : (
                <Checkbox.Group
                  options={optionLabels.map((label) => ({
                    label,
                    value: label,
                  }))}
                />
              )}
            </Form.Item>
          </>
        )}

        <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
          <Select>
            <Option value="easy">简单</Option>
            <Option value="medium">中等</Option>
            <Option value="hard">困难</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="language"
          label="编程语言"
          rules={[{ required: false }]}
        >
          <Select allowClear>
            <Option value="javascript">JavaScript</Option>
            <Option value="python">Python</Option>
            <Option value="java">Java</Option>
            <Option value="go">Go</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuestionEditorModal;
