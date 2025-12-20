import axios from 'axios';
import type { 
  LoginCredentials, 
  SignupData, 
  AuthResponse, 
  User,
  GoogleTokenRequest 
} from '../types/auth';

// Auth requests now go through chat_agent service (port 3000) which proxies to auth service (port 8000)
const API_BASE_URL =  'http://localhost:3000';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required to send/receive cookies
});

export let accessToken = '';

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = accessToken;
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
        const response = await axios.get(`${API_BASE_URL}/auth/refreshSession`, {
          withCredentials: true,
        });
        
        const { accessToken: newAccessToken } = response.data;
        accessToken = newAccessToken;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return authAPI(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/';
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
    const response = await axios.get<AuthResponse>(`${API_BASE_URL}/auth/refreshSession`, {
      withCredentials: true,
    });
    return response.data;
  },

  logout() {
    sessionStorage.removeItem('accessToken');
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
    // sessionStorage.setItem('accessToken', tokens.accessToken);
    accessToken = tokens.accessToken;
    
    if (tokens.user) {
      localStorage.setItem('user', JSON.stringify(tokens.user));
    }
  },
};

