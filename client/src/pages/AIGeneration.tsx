import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import questionService, { Question } from '../service/question';
import AIGenerationForm, { AIFormValues } from '../components/AIGenerationForm';
import QuestionPreviewList from '../components/QuestionPreviewList';
import useSelectableList from '../hooks/useSelectableList';
import { useQuestionContext } from '../contexts/QuestionContext';
interface AIGenerateModalProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const AIGeneration: React.FC<AIGenerateModalProps> = () => {
  const { fetchQuestions } = useQuestionContext();

  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const {
    selected: selectedQuestions,
    toggle: toggleQuestionSelection,
    clear: clearSelection,
  } = useSelectableList<number>();

  const navigate = useNavigate();

  // 生成题目回调，由 AIGenerationForm 调用
  const handleGenerate = async (values: AIFormValues) => {
    try {
      setLoading(true);

      const { language, ...rest } = values;
      const fixedValues = {
        ...rest,
        language: Array.isArray(language) ? language.join(',') : language,
      };
      const res = await questionService.generate(fixedValues);
      setGeneratedQuestions(res.data);
      clearSelection();
    } catch {
      message.error('生成题目失败');
    } finally {
      setLoading(false);
    }
  };
  // 保存选中题目
  const handleSave = async () => {
    if (selectedQuestions.length === 0) {
      message.warning('请至少选择一道题目');
      return;
    }

    try {
      await Promise.all(
        generatedQuestions
          .filter((_, idx) => selectedQuestions.includes(idx))
          .map((q) => questionService.create(q))
      );
      message.success('题目添加成功');
      await fetchQuestions(); // 确保在导航前获取最新数据
      navigate('/questions');
    } catch {
      message.error('保存题目失败');
    }
  };
  return (
    <div className="p-6">
      <Card title="AI 生成试题" className="mb-6">
        <AIGenerationForm loading={loading} onGenerate={handleGenerate} />
      </Card>

      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">生成的题目</h2>
            <Button
              type="primary"
              onClick={handleSave}
              disabled={selectedQuestions.length === 0}
            >
              添加到题库
            </Button>
          </div>
          <QuestionPreviewList
            questions={generatedQuestions}
            selected={selectedQuestions}
            onToggleSelect={toggleQuestionSelection}
          />
        </div>
      )}
    </div>
  );
};

export default AIGeneration;
