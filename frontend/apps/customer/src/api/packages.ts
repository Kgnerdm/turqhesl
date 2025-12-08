import api from './axios';
import type { 
  Package, 
  PackageFilters, 
  CreatePackageRequest,
  Provider
} from '@/types';

/**
 * Backend Package Response (snake_case)
 */
interface BackendPackage {
  id: number;
  provider: number | BackendProviderSummary;
  provider_name?: string;
  provider_city?: string;
  provider_is_verified?: boolean;
  name: string;
  description: string;
  category: string;
  category_display: string;
  price: string;
  currency: string;
  duration: string;
  includes: string[];
  excludes?: string[];
  images: string[];
  is_active?: boolean;
  is_featured?: boolean;
  booking_count?: number;
  created_at: string;
  updated_at?: string;
}

interface BackendProviderSummary {
  id: number;
  business_name: string;
  description: string;
  city: string;
  phone: string;
  email: string;
  logo_url?: string | null;
  cover_image_url?: string | null;
  categories: string[];
  is_verified: boolean;
  package_count: number;
  created_at: string;
}

/**
 * Backend pagination response
 */
interface BackendPaginatedResponse {
  data: BackendPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Transform backend package to frontend format
 */
const transformPackage = (backend: BackendPackage): Package => {
  // Handle provider - can be ID or full object
  let provider: Provider | undefined;
  let providerId: string;
  
  if (typeof backend.provider === 'object') {
    providerId = String(backend.provider.id);
    provider = {
      id: String(backend.provider.id),
      userId: '',
      businessName: backend.provider.business_name,
      description: backend.provider.description,
      city: backend.provider.city,
      address: '',
      phone: backend.provider.phone,
      email: backend.provider.email,
      logoUrl: backend.provider.logo_url || undefined,
      coverImageUrl: backend.provider.cover_image_url || undefined,
      categories: backend.provider.categories,
      isVerified: backend.provider.is_verified,
      certificates: [],
      workingHours: {
        monday: { isOpen: false },
        tuesday: { isOpen: false },
        wednesday: { isOpen: false },
        thursday: { isOpen: false },
        friday: { isOpen: false },
        saturday: { isOpen: false },
        sunday: { isOpen: false },
      },
      images: [],
      rating: 0,
      reviewCount: 0,
      createdAt: backend.provider.created_at,
      updatedAt: backend.provider.created_at,
    };
  } else {
    providerId = String(backend.provider);
    // Create minimal provider from summary fields
    if (backend.provider_name) {
      provider = {
        id: providerId,
        userId: '',
        businessName: backend.provider_name,
        description: '',
        city: backend.provider_city || '',
        address: '',
        phone: '',
        email: '',
        categories: [],
        isVerified: backend.provider_is_verified || false,
        certificates: [],
        workingHours: {
          monday: { isOpen: false },
          tuesday: { isOpen: false },
          wednesday: { isOpen: false },
          thursday: { isOpen: false },
          friday: { isOpen: false },
          saturday: { isOpen: false },
          sunday: { isOpen: false },
        },
        images: [],
        rating: 0,
        reviewCount: 0,
        createdAt: backend.created_at,
        updatedAt: backend.created_at,
      };
    }
  }
  
  return {
    id: String(backend.id),
    providerId,
    provider,
    name: backend.name,
    description: backend.description,
    category: backend.category as Package['category'],
    price: parseFloat(backend.price),
    currency: backend.currency,
    duration: backend.duration,
    includes: backend.includes || [],
    excludes: backend.excludes || [],
    images: backend.images || [],
    isActive: backend.is_active ?? true,
    rating: 0, // Not used in MVP
    reviewCount: 0, // Not used in MVP
    bookingCount: backend.booking_count || 0,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at || backend.created_at,
  };
};

/**
 * Transform filter params to backend format
 */
const transformFilters = (filters?: PackageFilters): Record<string, string | number | undefined> => {
  if (!filters) return {};
  
  return {
    category: filters.category,
    city: filters.city,
    provider: filters.providerId,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    search: filters.search,
    sort_by: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
  };
};

/**
 * Response type for package list
 */
export interface PackagesResponse {
  data: Package[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get all packages with filters
 */
export const getPackages = async (filters?: PackageFilters): Promise<PackagesResponse> => {
  const response = await api.get<BackendPaginatedResponse>('/packages/', {
    params: transformFilters(filters),
  });
  
  return {
    data: response.data.data.map(transformPackage),
    pagination: {
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.total_pages,
      hasNext: response.data.pagination.has_next,
      hasPrev: response.data.pagination.has_prev,
    },
  };
};

/**
 * Get single package by ID
 */
export const getPackage = async (id: string): Promise<Package> => {
  const response = await api.get<BackendPackage>(`/packages/${id}/`);
  return transformPackage(response.data);
};

/**
 * Get packages by provider ID
 */
export const getProviderPackages = async (providerId: string): Promise<Package[]> => {
  const response = await api.get<{ data: BackendPackage[] }>(`/providers/${providerId}/packages/`);
  return response.data.data.map(transformPackage);
};

/**
 * Get my packages (for provider dashboard)
 */
export const getMyPackages = async (): Promise<Package[]> => {
  const response = await api.get<{ data: BackendPackage[] }>('/packages/my/');
  return response.data.data.map(transformPackage);
};

/**
 * Create new package
 */
export const createPackage = async (data: CreatePackageRequest): Promise<Package> => {
  const backendData = {
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    currency: data.currency,
    duration: data.duration,
    includes: data.includes,
    excludes: data.excludes,
    images: data.images,
  };
  
  const response = await api.post<BackendPackage>('/packages/create/', backendData);
  return transformPackage(response.data);
};

/**
 * Update package
 */
export const updatePackage = async (id: string, data: Partial<CreatePackageRequest>): Promise<Package> => {
  const response = await api.patch<BackendPackage>(`/packages/${id}/update/`, data);
  return transformPackage(response.data);
};

/**
 * Delete package
 */
export const deletePackage = async (id: string): Promise<void> => {
  await api.delete(`/packages/${id}/delete/`);
};

/**
 * Get featured packages (for homepage)
 */
export const getFeaturedPackages = async (limit = 6): Promise<Package[]> => {
  const response = await api.get<BackendPaginatedResponse>('/packages/', {
    params: { limit, is_verified: true },
  });
  return response.data.data.map(transformPackage);
};

/**
 * Get featured providers (for homepage)
 */
export const getFeaturedProviders = async (limit = 4): Promise<Package[]> => {
  const response = await api.get<BackendPaginatedResponse>('/packages/', {
    params: { limit, is_verified: true },
  });
  return response.data.data.map(transformPackage);
};
