// src/contexts/QuestionContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import questionService, { Question, QueryParams } from '../service/question';

// 定义上下文类型
interface QuestionContextType {
  questions: Question[];
  total: number;
  loading: boolean;
  queryParams: QueryParams;
  fetchQuestions: (params?: QueryParams) => Promise<void>;
  setQueryParams: (params: QueryParams) => void;
}

// 创建上下文
const QuestionContext = createContext<QuestionContextType>({
  questions: [],
  total: 0,
  loading: false,
  queryParams: { page: 1, pageSize: 10 },
  fetchQuestions: async () => {},
  setQueryParams: () => {},
});

// 创建提供者组件
export const QuestionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
  });

  // 获取题库数据
  const fetchQuestions = async (params?: QueryParams) => {
    setLoading(true);
    try {
      const response = await questionService.list(params || queryParams);
      setQuestions(response.data.list);
      setTotal(response.data.total);
    } catch (error) {
      message.error('获取题库失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchQuestions();
  }, [queryParams]);

  return (
    <QuestionContext.Provider
      value={{
        questions,
        total,
        loading,
        queryParams,
        fetchQuestions,
        setQueryParams,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

// 创建自定义钩子，方便在组件中使用上下文
export const useQuestionContext = () => useContext(QuestionContext);
