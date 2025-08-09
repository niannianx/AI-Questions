import axios from 'axios';

export interface Question {
  id?: number;
  type: 'single' | 'multiple' | 'programming';
  content: string;
  options?: string | string[]; // 可以是 JSON 字符串或字符串数组
  answer?: string;
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
};

export default questionService;
