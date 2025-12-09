import api from './axios';
import type { 
  Booking, 
  BookingListItem,
  BookingFilters,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  CancelBookingRequest,
  BookingStats,
  Provider,
  Package
} from '@/types';

/**
 * Backend Booking Response (snake_case)
 */
interface BackendBookingListItem {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  package_name: string;
  package_category: string;
  provider_name: string;
  provider_city: string;
  status: string;
  status_display: string;
  appointment_date: string;
  appointment_time?: string;
  total_price: string;
  currency: string;
  payment_status: string;
  payment_status_display: string;
  notes?: string;
  created_at: string;
}

interface BackendBookingDetail {
  id: number;
  patient: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
  };
  provider: {
    id: number;
    business_name: string;
    description: string;
    city: string;
    phone: string;
    email: string;
    logo_url?: string;
    cover_image_url?: string;
    categories: string[];
    is_verified: boolean;
    package_count: number;
    created_at: string;
  };
  package: {
    id: number;
    name: string;
    description: string;
    category: string;
    category_display: string;
    price: string;
    currency: string;
    duration: string;
    includes: string[];
    images: string[];
    provider: number;
    provider_name: string;
    provider_city: string;
    provider_is_verified: boolean;
    created_at: string;
  };
  status: string;
  status_display: string;
  booking_date: string;
  appointment_date: string;
  appointment_time?: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  notes?: string;
  provider_notes?: string;
  total_price: string;
  currency: string;
  payment_status: string;
  payment_status_display: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  is_cancellable: boolean;
  is_confirmable: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendBookingStats {
  total: number;
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total_revenue?: number;
}

interface BackendPaginatedResponse<T> {
  data: T[];
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
 * Transform backend booking list item to frontend format
 */
const transformBookingListItem = (backend: BackendBookingListItem): BookingListItem => ({
  id: String(backend.id),
  patientName: backend.patient_name,
  patientEmail: backend.patient_email,
  patientPhone: backend.patient_phone,
  packageName: backend.package_name,
  packageCategory: backend.package_category,
  providerName: backend.provider_name,
  providerCity: backend.provider_city,
  status: backend.status as BookingListItem['status'],
  statusDisplay: backend.status_display,
  appointmentDate: backend.appointment_date,
  appointmentTime: backend.appointment_time,
  totalPrice: parseFloat(backend.total_price),
  currency: backend.currency,
  paymentStatus: backend.payment_status as BookingListItem['paymentStatus'],
  paymentStatusDisplay: backend.payment_status_display,
  notes: backend.notes,
  createdAt: backend.created_at,
});

/**
 * Transform backend booking detail to frontend format
 */
const transformBookingDetail = (backend: BackendBookingDetail): Booking => {
  const provider: Provider = {
    id: String(backend.provider.id),
    userId: '',
    businessName: backend.provider.business_name,
    description: backend.provider.description,
    city: backend.provider.city,
    address: '',
    phone: backend.provider.phone,
    email: backend.provider.email,
    logoUrl: backend.provider.logo_url,
    coverImageUrl: backend.provider.cover_image_url,
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
    packageCount: backend.provider.package_count,
    createdAt: backend.provider.created_at,
    updatedAt: backend.provider.created_at,
  };

  const pkg: Package = {
    id: String(backend.package.id),
    providerId: String(backend.package.provider),
    name: backend.package.name,
    description: backend.package.description,
    category: backend.package.category as Package['category'],
    price: parseFloat(backend.package.price),
    currency: backend.package.currency,
    duration: backend.package.duration,
    includes: backend.package.includes,
    excludes: [],
    images: backend.package.images,
    isActive: true,
    rating: 0,
    reviewCount: 0,
    bookingCount: 0,
    createdAt: backend.package.created_at,
    updatedAt: backend.package.created_at,
  };

  return {
    id: String(backend.id),
    patientId: String(backend.patient.id),
    patient: {
      id: String(backend.patient.id),
      email: backend.patient.email,
      firstName: backend.patient.first_name,
      lastName: backend.patient.last_name,
      role: backend.patient.role as 'patient' | 'provider' | 'admin',
      phone: backend.patient.phone,
      createdAt: '',
      updatedAt: '',
    },
    providerId: String(backend.provider.id),
    provider,
    packageId: String(backend.package.id),
    package: pkg,
    status: backend.status as Booking['status'],
    statusDisplay: backend.status_display,
    bookingDate: backend.booking_date,
    appointmentDate: backend.appointment_date,
    appointmentTime: backend.appointment_time,
    patientName: backend.patient_name,
    patientEmail: backend.patient_email,
    patientPhone: backend.patient_phone,
    notes: backend.notes,
    providerNotes: backend.provider_notes,
    totalPrice: parseFloat(backend.total_price),
    currency: backend.currency,
    paymentStatus: backend.payment_status as Booking['paymentStatus'],
    paymentStatusDisplay: backend.payment_status_display,
    confirmedAt: backend.confirmed_at,
    completedAt: backend.completed_at,
    cancelledAt: backend.cancelled_at,
    cancellationReason: backend.cancellation_reason,
    isCancellable: backend.is_cancellable,
    isConfirmable: backend.is_confirmable,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
};

/**
 * Response type for booking list
 */
export interface BookingsResponse {
  data: BookingListItem[];
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
 * Get all bookings (role-based)
 */
export const getBookings = async (filters?: BookingFilters): Promise<BookingsResponse> => {
  const params: Record<string, string | number | undefined> = {
    status: filters?.status,
    start_date: filters?.startDate,
    end_date: filters?.endDate,
    page: filters?.page,
    limit: filters?.limit,
  };

  const response = await api.get<BackendPaginatedResponse<BackendBookingListItem>>('/bookings/', { params });
  
  return {
    data: response.data.data.map(transformBookingListItem),
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
 * Get my bookings (patient)
 */
export const getMyBookings = async (filters?: BookingFilters): Promise<BookingsResponse> => {
  const params: Record<string, string | number | undefined> = {
    status: filters?.status,
    page: filters?.page,
    limit: filters?.limit,
  };

  const response = await api.get<BackendPaginatedResponse<BackendBookingListItem>>('/bookings/my/', { params });
  
  return {
    data: response.data.data.map(transformBookingListItem),
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
 * Get provider's bookings
 */
export const getProviderBookings = async (filters?: BookingFilters): Promise<BookingsResponse> => {
  const params: Record<string, string | number | undefined> = {
    status: filters?.status,
    date: filters?.date,
    page: filters?.page,
    limit: filters?.limit,
  };

  const response = await api.get<BackendPaginatedResponse<BackendBookingListItem>>('/bookings/provider/', { params });
  
  return {
    data: response.data.data.map(transformBookingListItem),
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
 * Get single booking by ID
 */
export const getBooking = async (id: string): Promise<Booking> => {
  const response = await api.get<BackendBookingDetail>(`/bookings/${id}/`);
  return transformBookingDetail(response.data);
};

/**
 * Create a new booking
 */
export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const backendData = {
    package_id: data.packageId,
    appointment_date: data.appointmentDate,
    appointment_time: data.appointmentTime,
    patient_name: data.patientName,
    patient_email: data.patientEmail,
    patient_phone: data.patientPhone,
    notes: data.notes,
  };

  const response = await api.post<BackendBookingDetail>('/bookings/create/', backendData);
  return transformBookingDetail(response.data);
};

/**
 * Update booking status (provider/admin)
 */
export const updateBookingStatus = async (
  id: string, 
  data: UpdateBookingStatusRequest
): Promise<Booking> => {
  const backendData = {
    status: data.status,
    notes: data.notes,
    cancellation_reason: data.cancellationReason,
  };

  const response = await api.patch<BackendBookingDetail>(`/bookings/${id}/status/`, backendData);
  return transformBookingDetail(response.data);
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (id: string, data?: CancelBookingRequest): Promise<Booking> => {
  const response = await api.post<BackendBookingDetail>(`/bookings/${id}/cancel/`, {
    reason: data?.reason,
  });
  return transformBookingDetail(response.data);
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (): Promise<BookingStats> => {
  const response = await api.get<BackendBookingStats>('/bookings/stats/');
  
  return {
    total: response.data.total,
    pending: response.data.pending,
    confirmed: response.data.confirmed,
    inProgress: response.data.in_progress,
    completed: response.data.completed,
    cancelled: response.data.cancelled,
    totalRevenue: response.data.total_revenue,
  };
};
