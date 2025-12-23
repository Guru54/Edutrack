import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Project API
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => {
    // Handle both FormData and regular objects
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
    return api.post('/projects', data, { headers });
  },
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  approve: (id) => api.post(`/projects/${id}/approve`),
  reject: (id, reason) => api.post(`/projects/${id}/reject`, { reason }),
  checkDuplicates: (title, description) => 
    api.get('/projects/duplicates', { params: { title, description } })
};

// Milestone API
export const milestoneAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/milestones`),
  create: (projectId, data) => api.post(`/projects/${projectId}/milestones`, data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  submit: (id, data) => api.post(`/milestones/${id}/submit`, data),
  provideFeedback: (id, data) => api.post(`/milestones/${id}/feedback`, data),
  getFeedback: (id) => api.get(`/milestones/${id}/feedback`)
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  verify: (id) => api.put(`/users/${id}/verify`),
  getUserGroups: (id) => api.get(`/users/${id}/groups`),
  getGuides: () => api.get('/guides')
};

// Group API
export const groupAPI = {
  create: (data) => api.post('/groups', data),
  getById: (id) => api.get(`/groups/${id}`),
  addMember: (id, payload) => api.post(`/groups/${id}/add-member`, payload),
  removeMember: (id, payload) => api.post(`/groups/${id}/remove-member`, payload),
  leave: (id) => api.post(`/groups/${id}/leave`),
  transferLeader: (id, payload) => api.patch(`/groups/${id}/transfer-leader`, payload),
  requestTransfer: (id, payload) => api.post(`/groups/${id}/request-transfer`, payload)
};

// Allocation API
export const allocationAPI = {
  getGuides: () => api.get('/guides'),
  assignGuide: (data) => api.post('/allocations', data),
  reassignGuide: (id, guideId) => api.put(`/allocations/${id}`, { guideId }),
  getGuideWorkload: (id) => api.get(`/guides/${id}/workload`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getGuideWorkload: () => api.get('/analytics/guide-workload'),
  getProjectStatus: (params) => api.get('/analytics/project-status', { params }),
  getDuplicates: () => api.get('/analytics/duplicates'),
  getDelayed: () => api.get('/analytics/delayed')
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// File API
export const fileAPI = {
  upload: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  download: (id) => api.get(`/files/${id}`, { responseType: 'blob' })
};

export default api;
