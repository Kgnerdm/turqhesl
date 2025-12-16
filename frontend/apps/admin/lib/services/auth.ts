import api from '../api';
import type { User, AuthResponse, LoginRequest } from '@/types';

// Transform snake_case to camelCase for user
function transformUser(data: Record<string, unknown>): User {
  return {
    id: data.id as number,
    email: data.email as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    fullName: `${data.first_name} ${data.last_name}`,
    role: data.role as User['role'],
    phone: data.phone as string | undefined,
    isActive: data.is_active as boolean,
    isStaff: data.is_staff as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await api.post('/auth/login/', credentials);
  const { user, tokens } = response.data;
  
  return {
    user: transformUser(user),
    tokens: {
      access: tokens.access,
      refresh: tokens.refresh,
    },
  };
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me/');
  return transformUser(response.data);
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout/', { refresh: refreshToken });
}

