import api from './axios';
import type { 
  Provider, 
  ProviderFilters, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

/**
 * Get all providers with filters
 */
export const getProviders = async (filters?: ProviderFilters): Promise<PaginatedResponse<Provider>> => {
  const response = await api.get<PaginatedResponse<Provider>>('/providers', {
    params: filters,
  });
  return response.data;
};

/**
 * Get single provider by ID
 */
export const getProvider = async (id: string): Promise<Provider> => {
  const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
  return response.data.data;
};

/**
 * Get provider by user ID (for provider dashboard)
 */
export const getMyProvider = async (): Promise<Provider> => {
  const response = await api.get<ApiResponse<Provider>>('/providers/me');
  return response.data.data;
};

/**
 * Create provider profile
 */
export const createProvider = async (data: Partial<Provider>): Promise<Provider> => {
  const response = await api.post<ApiResponse<Provider>>('/providers', data);
  return response.data.data;
};

/**
 * Update provider profile
 */
export const updateProvider = async (id: string, data: Partial<Provider>): Promise<Provider> => {
  const response = await api.patch<ApiResponse<Provider>>(`/providers/${id}`, data);
  return response.data.data;
};

/**
 * Delete provider profile
 */
export const deleteProvider = async (id: string): Promise<void> => {
  await api.delete(`/providers/${id}`);
};

/**
 * Get provider statistics (for dashboard)
 */
export const getProviderStats = async (id: string): Promise<ProviderStats> => {
  const response = await api.get<ApiResponse<ProviderStats>>(`/providers/${id}/stats`);
  return response.data.data;
};

/**
 * Upload provider logo
 */
export const uploadProviderLogo = async (id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await api.post<ApiResponse<{ url: string }>>(`/providers/${id}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data.url;
};

/**
 * Upload provider images
 */
export const uploadProviderImages = async (id: string, files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  
  const response = await api.post<ApiResponse<{ urls: string[] }>>(`/providers/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data.urls;
};

// Types specific to providers
interface ProviderStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  monthlyBookings: { month: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
}

