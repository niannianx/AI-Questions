import { useState, useCallback } from 'react';
import { message } from 'antd';
import questionService, { Question, QueryParams } from '../service/question';

export const useQuestionList = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
  });

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await questionService.list(queryParams);
      setQuestions(res.data.list);
      setTotal(res.data.total);
    } catch {
      message.error('获取题目失败');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const handleSearch = useCallback((value: string) => {
    setQueryParams((prev) => ({ ...prev, search: value, page: 1 }));
  }, []);

  const handleTypeFilter = useCallback((value: string | undefined) => {
    setQueryParams((prev) => ({ ...prev, type: value, page: 1 }));
  }, []);

  // const handlePageChange = useCallback((page: number, pageSize: number) => {
  //   setQueryParams(prev => ({ ...prev, page, pageSize }));
  // }, []);
  //   const handlePageChange = useCallback((page: number, pageSize: number) => {
  //   setQueryParams(prev => {
  //     const isPageSizeChanged = pageSize !== prev.pageSize;
  //     return {
  //       ...prev,
  //       page: isPageSizeChanged ? 1 : page, // ✅ pageSize 变了就重置 page 为 1
  //       pageSize,
  //     };
  //   });
  // }, []);
  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      setQuestions([]);
      setQueryParams((prev) => {
        const isPageSizeChanged = pageSize !== prev.pageSize;
        const newPage = isPageSizeChanged ? 1 : page;

        // 如果改变 pageSize 后页码超出范围，提前调整
        const maxPage = Math.ceil(total / pageSize) || 1;
        const adjustedPage = Math.min(newPage, maxPage);

        return {
          ...prev,
          page: adjustedPage,
          pageSize,
        };
      });
    },
    [total]
  );

  return {
    questions,
    total,
    loading,
    queryParams,
    fetchQuestions,
    handleSearch,
    handleTypeFilter,
    handlePageChange,
  };
};
