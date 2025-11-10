import axios from 'axios';
import type { 
  LoginCredentials, 
  SignupData, 
  AuthResponse, 
  User,
  GoogleTokenRequest 
} from '../types/auth';

// Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.get(`${API_BASE_URL}/auth/refreshSession`, {
            headers: {
              'refresh-token': `Bearer ${refreshToken}`,
            },
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAPI(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authAPI.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async signup(data: SignupData): Promise<User> {
    const response = await authAPI.post<User>('/auth/signup', data);
    return response.data;
  },

  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    const response = await authAPI.post<AuthResponse>('/auth/google/token', {
      token: googleToken,
    } as GoogleTokenRequest);
    return response.data;
  },

  async verifyToken(): Promise<User> {
    const response = await authAPI.get<User>('/auth/');
    return response.data;
  },

  async refreshSession(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.get<AuthResponse>(`${API_BASE_URL}/auth/refreshSession`, {
      headers: {
        'refresh-token': `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  storeAuthData(tokens: AuthResponse) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    if (tokens.user) {
      localStorage.setItem('user', JSON.stringify(tokens.user));
    }
  },
};

