// API服务 - 调用Next.js API Routes
import axios from 'axios';

// 使用相对路径，自动调用Vercel部署的API
const api = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取API列表
export const getApis = async (params = {}) => {
  try {
    const response = await api.get('/api/apis', { params });
    return response.data;
  } catch (error) {
    console.error('获取API列表失败:', error);
    throw error;
  }
};

// 搜索API
export const searchApis = async (query, params = {}) => {
  try {
    const response = await api.get('/api/apis', {
      params: { search: query, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('搜索API失败:', error);
    throw error;
  }
};

// 获取分类
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data.data || [];
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
};

// 获取统计信息
export const getStats = async () => {
  try {
    const response = await api.get('/api/stats');
    return response.data.data || {};
  } catch (error) {
    console.error('获取统计失败:', error);
    return {};
  }
};

// AI推荐
export const aiRecommend = async (need) => {
  try {
    const response = await api.post('/api/ai/recommend', { need });
    return response.data;
  } catch (error) {
    console.error('AI推荐失败:', error);
    throw error;
  }
};

// AI代码生成
export const aiGenerateCode = async (apiInfo, language = 'javascript') => {
  try {
    const response = await api.post('/api/ai/generate-code', { apiInfo, language });
    return response.data;
  } catch (error) {
    console.error('AI代码生成失败:', error);
    throw error;
  }
};

// AI错误诊断
export const aiDiagnose = async (errorMessage) => {
  try {
    const response = await api.post('/api/ai/diagnose', { errorMessage });
    return response.data;
  } catch (error) {
    console.error('AI诊断失败:', error);
    throw error;
  }
};

export default api;
