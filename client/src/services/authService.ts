import axios from 'axios'
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../../../shared/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('Login attempt:', { email, API_BASE_URL })
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', {
      email,
      password,
    })
    console.log('Login response:', response.data)
    return response.data.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('Register attempt:', { email: data.email, API_BASE_URL })
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data)
    console.log('Register response:', response.data)
    return response.data.data
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    console.log('getCurrentUser: Token exists:', !!token);
    console.log('getCurrentUser: Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    const response = await api.get<{ success: boolean; data: User }>('/auth/me')
    console.log('getCurrentUser: Response received:', response.data);
    return response.data.data
  },

  async updateProfile(data: Partial<User>): Promise<void> {
    await api.put('/auth/profile', data)
  },
}

export default api
