import axios from 'axios';

export interface Question {
  id?: number;
  type: 'single' | 'multiple' | 'programming';
  content: string;
  options?: string | string[]; // 可以是 JSON 字符串或字符串数组
  answer?: string;
  codeAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QueryParams {
  page: number;
  pageSize: number;
  type?: string;
  difficulty?: string;
  search?: string;
}

export interface GenerateParams {
  type: 'single' | 'multiple' | 'programming';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  language?: string;
}

const questionService = {
  list: async (params: QueryParams) => {
    const response = await axios.get('/api/questions', { params });
    return response.data;
  },

  create: async (data: Question) => {
    const response = await axios.post('/api/questions', data);
    return response.data;
  },

  update: async (id: number, data: Question) => {
    const response = await axios.put(`/api/questions/${id}`, data);
    return response.data;
  },

  delete: async (ids: number[]) => {
    const response = await axios.post('/api/questions/delete', { ids });
    return response.data;
  },

  generate: async (params: GenerateParams) => {
    const response = await axios.post('/api/questions/generate', params);
    return response.data;
  },

  generateExam:async (params: any) => {
    const response = await axios.post('/api/exam/generate', params);
    return response.data;
  },

  saveExam :async (examData: any) => {
    try {
      const response = await fetch('/api/exam/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving exam:', error);
      throw error;
    }
  },

  getExamList :async (params: { page: number; pageSize: number }) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
      });
      
      const response = await fetch(`/api/exam/list?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting exam list:', error);
      throw error;
    }
  },

  getExamDetail :async (examId: number) => {
    try {
      const response = await fetch(`/api/exam/${examId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting exam detail:', error);
      throw error;
    }
  },

  deleteExam :async (examId: number) => {
    try {
      const response = await fetch(`/api/exam/${examId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },
};

export default questionService;
