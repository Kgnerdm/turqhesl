import api from './axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  User 
} from '@/types';

/**
 * Login user with email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data;
};

/**
 * Logout user (invalidate refresh token on server)
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (token: string): Promise<AuthResponse['tokens']> => {
  const response = await api.post<ApiResponse<AuthResponse['tokens']>>('/auth/refresh', {
    refreshToken: token,
  });
  return response.data.data;
};

/**
 * Request password reset email
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, password: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, password });
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.patch<ApiResponse<User>>('/auth/profile', data);
  return response.data.data;
};

/**
 * Change password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.post('/auth/change-password', { currentPassword, newPassword });
};

