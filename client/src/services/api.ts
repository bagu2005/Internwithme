import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Job-related API functions
export const jobApi = {
  // Get all jobs with filtering
  getJobs: (params?: any) => api.get('/jobs', { params }),
  
  // Get job by ID
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  
  // Get job recommendations
  getJobRecommendations: () => api.get('/jobs/recommendations'),
  
  // Get job statistics
  getJobStats: () => api.get('/jobs/stats'),
  
  // Trigger job scraping (admin)
  triggerJobScraping: () => api.post('/jobs/scrape')
};

export default api;
