import api from '../api';
import type { 
  AdminStats, 
  UserStats, 
  User, 
  Provider, 
  Booking,
  PaginatedResponse 
} from '@/types';

// ============================================
// STATS
// ============================================

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get('/providers/admin/stats/');
  return response.data;
}

export async function getUserStats(): Promise<UserStats> {
  const response = await api.get('/auth/admin/stats/');
  const data = response.data;
  return {
    total: data.total,
    active: data.active,
    inactive: data.inactive,
    byRole: {
      patient: data.by_role.patient,
      provider: data.by_role.provider,
      admin: data.by_role.admin,
    },
    newThisWeek: data.new_this_week,
    newThisMonth: data.new_this_month,
  };
}

// ============================================
// USERS
// ============================================

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

function transformUser(data: Record<string, unknown>): User {
  return {
    id: data.id as number,
    email: data.email as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    fullName: data.full_name as string,
    role: data.role as User['role'],
    phone: data.phone as string | undefined,
    isActive: data.is_active as boolean,
    isStaff: data.is_staff as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.role) queryParams.set('role', params.role);
  if (params.isActive !== undefined) queryParams.set('is_active', params.isActive.toString());
  if (params.search) queryParams.set('search', params.search);
  
  const response = await api.get(`/auth/admin/users/?${queryParams.toString()}`);
  
  return {
    data: response.data.data.map(transformUser),
    pagination: {
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.total_pages,
      hasNext: response.data.pagination.has_next,
      hasPrev: response.data.pagination.has_prev,
    },
  };
}

export async function getUser(id: number): Promise<User> {
  const response = await api.get(`/auth/admin/users/${id}/`);
  return transformUser(response.data);
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const payload: Record<string, unknown> = {};
  if (data.firstName !== undefined) payload.first_name = data.firstName;
  if (data.lastName !== undefined) payload.last_name = data.lastName;
  if (data.role !== undefined) payload.role = data.role;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  
  const response = await api.patch(`/auth/admin/users/${id}/`, payload);
  return transformUser(response.data);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/auth/admin/users/${id}/`);
}

// ============================================
// PROVIDERS
// ============================================

interface GetProvidersParams {
  page?: number;
  limit?: number;
  isVerified?: boolean;
  search?: string;
}

function transformProvider(data: Record<string, unknown>): Provider {
  return {
    id: data.id as number,
    userId: data.user_id as number,
    businessName: data.business_name as string,
    description: data.description as string,
    city: data.city as string,
    address: data.address as string,
    phone: data.phone as string,
    email: data.email as string,
    website: data.website as string | undefined,
    logoUrl: data.logo_url as string | undefined,
    coverImageUrl: data.cover_image_url as string | undefined,
    isVerified: data.is_verified as boolean,
    verificationDate: data.verification_date as string | undefined,
    categories: data.categories as string[],
    packageCount: (data.package_count ?? data.active_package_count) as number | undefined,
    isActive: data.is_active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function getProviders(params: GetProvidersParams = {}): Promise<PaginatedResponse<Provider>> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.isVerified !== undefined) queryParams.set('is_verified', params.isVerified.toString());
  if (params.search) queryParams.set('search', params.search);
  
  const response = await api.get(`/providers/?${queryParams.toString()}`);
  
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
}

export async function getPendingProviders(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Provider>> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  
  const response = await api.get(`/providers/admin/pending/?${queryParams.toString()}`);
  
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
}

export async function verifyProvider(id: number, isVerified: boolean): Promise<Provider> {
  const response = await api.post(`/providers/${id}/verify/`, { is_verified: isVerified });
  return transformProvider(response.data);
}

export async function rejectProvider(id: number, reason?: string): Promise<void> {
  await api.post(`/providers/${id}/reject/`, { reason });
}

// ============================================
// BOOKINGS
// ============================================

interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

function transformBooking(data: Record<string, unknown>): Booking {
  return {
    id: data.id as number,
    patientId: data.patient_id as number,
    patientName: data.patient_name as string,
    patientEmail: data.patient_email as string,
    patientPhone: data.patient_phone as string,
    providerId: data.provider_id as number,
    providerName: data.provider_name as string | undefined,
    packageId: data.package_id as number,
    packageName: data.package_name as string | undefined,
    packageCategory: data.package_category as string | undefined,
    status: data.status as Booking['status'],
    statusDisplay: data.status_display as string,
    appointmentDate: data.appointment_date as string,
    appointmentTime: data.appointment_time as string | undefined,
    totalPrice: data.total_price as number,
    currency: data.currency as string,
    paymentStatus: data.payment_status as Booking['paymentStatus'],
    paymentStatusDisplay: data.payment_status_display as string,
    notes: data.notes as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function getBookings(params: GetBookingsParams = {}): Promise<PaginatedResponse<Booking>> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.status) queryParams.set('status', params.status);
  if (params.startDate) queryParams.set('start_date', params.startDate);
  if (params.endDate) queryParams.set('end_date', params.endDate);
  
  const response = await api.get(`/bookings/?${queryParams.toString()}`);
  
  return {
    data: response.data.data.map(transformBooking),
    pagination: {
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.total_pages,
      hasNext: response.data.pagination.has_next,
      hasPrev: response.data.pagination.has_prev,
    },
  };
}

export async function updateBookingStatus(id: number, status: string): Promise<Booking> {
  const response = await api.patch(`/bookings/${id}/status/`, { status });
  return transformBooking(response.data);
}

