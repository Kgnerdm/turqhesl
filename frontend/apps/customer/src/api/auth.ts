import api from './axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '@/types';

/**
 * Backend User Response (snake_case)
 */
interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'provider' | 'admin';
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Backend Auth Response
 */
interface BackendAuthResponse {
  user: BackendUser;
  tokens: {
    access: string;
    refresh: string;
  };
}

/**
 * Backend Register Request (snake_case)
 */
interface BackendRegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'provider';
  phone?: string;
}

/**
 * Transform backend user to frontend format
 */
const transformUser = (backendUser: BackendUser): User => ({
  id: String(backendUser.id),
  email: backendUser.email,
  firstName: backendUser.first_name,
  lastName: backendUser.last_name,
  role: backendUser.role,
  phone: backendUser.phone ?? undefined,
  createdAt: backendUser.created_at,
  updatedAt: backendUser.updated_at,
});

/**
 * Transform backend auth response to frontend format
 */
const transformAuthResponse = (backendResponse: BackendAuthResponse): AuthResponse => ({
  user: transformUser(backendResponse.user),
  tokens: {
    accessToken: backendResponse.tokens.access,
    refreshToken: backendResponse.tokens.refresh,
  },
});

/**
 * Login user with email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<BackendAuthResponse>('/auth/login/', data);
  return transformAuthResponse(response.data);
};

/**
 * Register new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  // Transform frontend request to backend format
  const backendRequest: BackendRegisterRequest = {
    email: data.email,
    password: data.password,
    password_confirm: data.passwordConfirm || data.password, // Handle both formats
    first_name: data.firstName,
    last_name: data.lastName,
    role: data.role === 'admin' ? 'patient' : data.role, // Admin role not allowed on register
    phone: data.phone,
  };
  
  const response = await api.post<BackendAuthResponse>('/auth/register/', backendRequest);
  return transformAuthResponse(response.data);
};

/**
 * Logout user (invalidate refresh token on server)
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken });
    }
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
  const response = await api.get<BackendUser>('/auth/me/');
  return transformUser(response.data);
};

/**
 * Refresh access token
 */
export const refreshToken = async (token: string): Promise<AuthResponse['tokens']> => {
  const response = await api.post<{ access: string; refresh: string }>('/auth/token/refresh/', {
    refresh: token,
  });
  return {
    accessToken: response.data.access,
    refreshToken: response.data.refresh,
  };
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  // Transform to backend format
  const backendData: Partial<BackendUser> = {};
  if (data.firstName !== undefined) backendData.first_name = data.firstName;
  if (data.lastName !== undefined) backendData.last_name = data.lastName;
  if (data.phone !== undefined) backendData.phone = data.phone || null;
  
  const response = await api.patch<BackendUser>('/auth/me/', backendData);
  return transformUser(response.data);
};

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  // Transform to backend format (snake_case)
  const backendData = {
    current_password: data.currentPassword,
    new_password: data.newPassword,
    confirm_password: data.confirmPassword,
  };
  
  await api.post('/auth/change-password/', backendData);
};
