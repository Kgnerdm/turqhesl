import api from './axios';
import type { 
  Package, 
  PackageFilters, 
  CreatePackageRequest,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

/**
 * Get all packages with filters
 */
export const getPackages = async (filters?: PackageFilters): Promise<PaginatedResponse<Package>> => {
  const response = await api.get<PaginatedResponse<Package>>('/packages', {
    params: filters,
  });
  return response.data;
};

/**
 * Get single package by ID
 */
export const getPackage = async (id: string): Promise<Package> => {
  const response = await api.get<ApiResponse<Package>>(`/packages/${id}`);
  return response.data.data;
};

/**
 * Get packages by provider ID
 */
export const getProviderPackages = async (providerId: string): Promise<Package[]> => {
  const response = await api.get<ApiResponse<Package[]>>(`/providers/${providerId}/packages`);
  return response.data.data;
};

/**
 * Get my packages (for provider dashboard)
 */
export const getMyPackages = async (): Promise<Package[]> => {
  const response = await api.get<ApiResponse<Package[]>>('/packages/me');
  return response.data.data;
};

/**
 * Create new package
 */
export const createPackage = async (data: CreatePackageRequest): Promise<Package> => {
  const response = await api.post<ApiResponse<Package>>('/packages', data);
  return response.data.data;
};

/**
 * Update package
 */
export const updatePackage = async (id: string, data: Partial<CreatePackageRequest>): Promise<Package> => {
  const response = await api.patch<ApiResponse<Package>>(`/packages/${id}`, data);
  return response.data.data;
};

/**
 * Delete package
 */
export const deletePackage = async (id: string): Promise<void> => {
  await api.delete(`/packages/${id}`);
};

/**
 * Toggle package active status
 */
export const togglePackageStatus = async (id: string): Promise<Package> => {
  const response = await api.patch<ApiResponse<Package>>(`/packages/${id}/toggle-status`);
  return response.data.data;
};

/**
 * Upload package images
 */
export const uploadPackageImages = async (id: string, files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  
  const response = await api.post<ApiResponse<{ urls: string[] }>>(`/packages/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data.urls;
};

/**
 * Get featured packages (for homepage)
 */
export const getFeaturedPackages = async (limit = 6): Promise<Package[]> => {
  const response = await api.get<ApiResponse<Package[]>>('/packages/featured', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get popular packages
 */
export const getPopularPackages = async (limit = 6): Promise<Package[]> => {
  const response = await api.get<ApiResponse<Package[]>>('/packages/popular', {
    params: { limit },
  });
  return response.data.data;
};

