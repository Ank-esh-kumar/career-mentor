import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  googleAuth: (credential) => api.post('/api/auth/google', { credential }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  getMe: () => api.get('/api/auth/me'),
};


export const profileAPI = {
  get: () => api.get('/api/profile'),
  update: (data) => api.put('/api/profile', data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};


export const resumeAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },
  get: () => api.get('/api/resume'),
  delete: () => api.delete('/api/resume'),
  analyze: () => api.post('/api/resume/analyze'),
  getAnalysis: () => api.get('/api/resume/analysis'),


  generateDraft: (preferences) => api.post('/api/resume/generate-draft', preferences),
  generateSummary: (data) => api.post('/api/resume/generate-summary', data),
  saveDraft: (draft) => api.post('/api/resume/save-draft', draft),
  getDraft: () => api.get('/api/resume/draft'),


  atsEvaluate: (data) => api.post('/api/resume/ats-evaluate', data),
  autoFix: (data) => api.post('/api/resume/auto-fix', data),
};


export const careerAPI = {
  recommend: (data = {}) => api.post('/api/career/recommend', data),
  getRecommendations: () => api.get('/api/career/recommendations'),
  save: (data) => api.post('/api/career/save', data),
  getSaved: () => api.get('/api/career/saved'),
  deleteSaved: (id) => api.delete(`/api/career/saved/${id}`),
  getLearningResources: (data) => api.post('/api/career/learning-resources', data),
};


export const skillGapAPI = {
  analyze: (data) => api.post('/api/skillgap/analyze', data),
  getLatest: () => api.get('/api/skillgap/latest'),
};


export const roadmapAPI = {
  generate: (data) => api.post('/api/roadmap/generate', data),
  getLatest: () => api.get('/api/roadmap/latest'),
  toggleStep: (roadmapId, stepNumber) =>
    api.put(`/api/roadmap/step/${roadmapId}/${stepNumber}`),
};


export const chatAPI = {
  sendMessage: (data) => api.post('/api/chat/message', data),
  getHistory: (conversationId) =>
    api.get('/api/chat/history', { params: { conversation_id: conversationId } }),
  clearHistory: () => api.delete('/api/chat/history'),
};


export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getCareerMatch: () => api.get('/api/analytics/career-match'),
  getSkillProgress: () => api.get('/api/analytics/skill-progress'),
  getResumeScore: () => api.get('/api/analytics/resume-score'),
};


export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (data) => api.put('/api/settings', data),
  changePassword: (data) => api.post('/api/settings/change-password', data),
  deleteAccount: () => api.delete('/api/settings/account'),
};


export const subscriptionAPI = {
  get: () => api.get('/api/subscription'),
  activate: () => api.post('/api/subscription/activate'),
  cancel: () => api.post('/api/subscription/cancel'),
};

export default api;
