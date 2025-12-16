import api from './axios';
import type { 
  Provider, 
  ProviderFilters
} from '@/types';

/**
 * Backend Provider Response (snake_case)
 */
interface BackendProvider {
  id: number;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  business_name: string;
  description: string;
  city: string;
  address?: string;
  phone: string;
  email: string;
  website?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  categories: string[];
  is_verified: boolean;
  verification_date?: string | null;
  certificates?: Array<{
    name: string;
    issued_by: string;
    issued_date: string;
  }>;
  working_hours?: Record<string, {
    is_open: boolean;
    open_time?: string;
    close_time?: string;
  }>;
  images?: string[];
  is_active?: boolean;
  package_count: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Backend pagination response
 */
interface BackendPaginatedResponse {
  data: BackendProvider[];
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
 * Transform backend provider to frontend format
 */
const transformProvider = (backend: BackendProvider): Provider => ({
  id: String(backend.id),
  userId: backend.user ? String(backend.user.id) : '',
  businessName: backend.business_name,
  description: backend.description,
  city: backend.city,
  address: backend.address || '',
  phone: backend.phone,
  email: backend.email,
  website: backend.website || undefined,
  logoUrl: backend.logo_url || undefined,
  coverImageUrl: backend.cover_image_url || undefined,
  categories: backend.categories,
  isVerified: backend.is_verified,
  verificationDate: backend.verification_date || undefined,
  certificates: (backend.certificates || []).map((cert, idx) => ({
    id: String(idx + 1),
    name: cert.name,
    issuedBy: cert.issued_by,
    issuedDate: cert.issued_date,
  })),
  workingHours: backend.working_hours ? {
    monday: transformDayHours(backend.working_hours.monday),
    tuesday: transformDayHours(backend.working_hours.tuesday),
    wednesday: transformDayHours(backend.working_hours.wednesday),
    thursday: transformDayHours(backend.working_hours.thursday),
    friday: transformDayHours(backend.working_hours.friday),
    saturday: transformDayHours(backend.working_hours.saturday),
    sunday: transformDayHours(backend.working_hours.sunday),
  } : {
    monday: { isOpen: false },
    tuesday: { isOpen: false },
    wednesday: { isOpen: false },
    thursday: { isOpen: false },
    friday: { isOpen: false },
    saturday: { isOpen: false },
    sunday: { isOpen: false },
  },
  images: backend.images || [],
  rating: 0, // Not used in MVP
  reviewCount: 0, // Not used in MVP
  packageCount: backend.package_count,
  createdAt: backend.created_at,
  updatedAt: backend.updated_at || backend.created_at,
});

const transformDayHours = (day?: { is_open: boolean; open_time?: string; close_time?: string }) => ({
  isOpen: day?.is_open || false,
  openTime: day?.open_time,
  closeTime: day?.close_time,
});

/**
 * Transform filter params to backend format
 */
const transformFilters = (filters?: ProviderFilters): Record<string, string | number | boolean | undefined> => {
  if (!filters) return {};
  
  return {
    city: filters.city,
    category: filters.category,
    is_verified: filters.isVerified,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  };
};

/**
 * Response type for provider list
 */
export interface ProvidersResponse {
  data: Provider[];
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
 * Get all providers with filters
 */
export const getProviders = async (filters?: ProviderFilters): Promise<ProvidersResponse> => {
  const response = await api.get<BackendPaginatedResponse>('/providers/', {
    params: transformFilters(filters),
  });
  
  return {
    data: response.data.data.map(transformProvider),
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
 * Get single provider by ID
 */
export const getProvider = async (id: string): Promise<Provider> => {
  const response = await api.get<BackendProvider>(`/providers/${id}/`);
  return transformProvider(response.data);
};

/**
 * Get provider by user ID (for provider dashboard)
 */
export const getMyProvider = async (): Promise<Provider> => {
  const response = await api.get<BackendProvider>('/providers/me/');
  return transformProvider(response.data);
};

/**
 * Create provider profile
 */
export const createProvider = async (data: Partial<Provider>): Promise<Provider> => {
  const backendData = {
    business_name: data.businessName,
    description: data.description,
    city: data.city,
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logo_url: data.logoUrl,
    cover_image_url: data.coverImageUrl,
    categories: data.categories,
  };
  
  const response = await api.post<BackendProvider>('/providers/create/', backendData);
  return transformProvider(response.data);
};

/**
 * Update provider profile
 */
export const updateProvider = async (id: string, data: Partial<Provider>): Promise<Provider> => {
  const backendData: Record<string, unknown> = {};
  
  if (data.businessName !== undefined) backendData.business_name = data.businessName;
  if (data.description !== undefined) backendData.description = data.description;
  if (data.city !== undefined) backendData.city = data.city;
  if (data.address !== undefined) backendData.address = data.address;
  if (data.phone !== undefined) backendData.phone = data.phone;
  if (data.email !== undefined) backendData.email = data.email;
  if (data.website !== undefined) backendData.website = data.website;
  if (data.logoUrl !== undefined) backendData.logo_url = data.logoUrl;
  if (data.coverImageUrl !== undefined) backendData.cover_image_url = data.coverImageUrl;
  if (data.categories !== undefined) backendData.categories = data.categories;
  
  const response = await api.patch<BackendProvider>(`/providers/${id}/update/`, backendData);
  return transformProvider(response.data);
};

// Types specific to providers
export interface ProviderStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  monthlyBookings: { month: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
}

// ==================== ADMIN API ====================

/**
 * Backend admin stats response
 */
interface BackendAdminStats {
  users: {
    total: number;
    patients: number;
    providers: number;
    admins: number;
  };
  providers: {
    total: number;
    verified: number;
    pending: number;
    active: number;
  };
  packages: {
    total: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
}

/**
 * Frontend admin stats type
 */
export interface AdminStats {
  users: {
    total: number;
    patients: number;
    providers: number;
    admins: number;
  };
  providers: {
    total: number;
    verified: number;
    pending: number;
    active: number;
  };
  packages: {
    total: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
}

/**
 * Get admin dashboard statistics (admin only)
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<BackendAdminStats>('/providers/admin/stats/');
  return response.data;
};

/**
 * Get pending providers for verification (admin only)
 */
export const getPendingProviders = async (page = 1, limit = 10): Promise<ProvidersResponse> => {
  const response = await api.get<BackendPaginatedResponse>('/providers/admin/pending/', {
    params: { page, limit },
  });
  
  return {
    data: response.data.data.map(transformProvider),
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
 * Verify a provider (admin only)
 */
export const verifyProvider = async (id: string, isVerified = true): Promise<Provider> => {
  const response = await api.post<BackendProvider>(`/providers/${id}/verify/`, {
    is_verified: isVerified,
  });
  return transformProvider(response.data);
};

/**
 * Reject a provider (admin only)
 */
export const rejectProvider = async (id: string, reason?: string): Promise<{ detail: string; reason: string }> => {
  const response = await api.post<{ detail: string; reason: string }>(`/providers/${id}/reject/`, {
    reason,
  });
  return response.data;
};


// ============================================
// PLATFORM STATS
// ============================================

/**
 * Platform statistics response
 */
export interface PlatformStats {
  verifiedProviders: number;
  totalProviders: number;
  totalPackages: number;
  totalTreatments: number;
  patientsServed: number;
  completedBookings: number;
}

/**
 * Get public platform statistics for homepage
 */
export const getPlatformStats = async (): Promise<PlatformStats> => {
  const response = await api.get<{
    verified_providers: number;
    total_providers: number;
    total_packages: number;
    total_treatments: number;
    patients_served: number;
    completed_bookings: number;
  }>('/providers/stats/public/');
  
  return {
    verifiedProviders: response.data.verified_providers,
    totalProviders: response.data.total_providers,
    totalPackages: response.data.total_packages,
    totalTreatments: response.data.total_treatments,
    patientsServed: response.data.patients_served,
    completedBookings: response.data.completed_bookings,
  };
};
