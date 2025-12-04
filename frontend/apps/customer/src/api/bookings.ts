import api from './axios';
import type { 
  Booking, 
  BookingFilters,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

/**
 * Get bookings (role-based: patient sees their bookings, provider sees incoming)
 */
export const getBookings = async (filters?: BookingFilters): Promise<PaginatedResponse<Booking>> => {
  const response = await api.get<PaginatedResponse<Booking>>('/bookings', {
    params: filters,
  });
  return response.data;
};

/**
 * Get single booking by ID
 */
export const getBooking = async (id: string): Promise<Booking> => {
  const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return response.data.data;
};

/**
 * Create new booking (patient only)
 */
export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const response = await api.post<ApiResponse<Booking>>('/bookings', data);
  return response.data.data;
};

/**
 * Update booking status (provider/admin)
 */
export const updateBookingStatus = async (
  id: string, 
  data: UpdateBookingStatusRequest
): Promise<Booking> => {
  const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, data);
  return response.data.data;
};

/**
 * Cancel booking (patient can cancel pending/confirmed bookings)
 */
export const cancelBooking = async (id: string, reason?: string): Promise<Booking> => {
  const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  return response.data.data;
};

/**
 * Get booking statistics (for dashboard)
 */
export const getBookingStats = async (): Promise<BookingStats> => {
  const response = await api.get<ApiResponse<BookingStats>>('/bookings/stats');
  return response.data.data;
};

/**
 * Get upcoming bookings
 */
export const getUpcomingBookings = async (limit = 5): Promise<Booking[]> => {
  const response = await api.get<ApiResponse<Booking[]>>('/bookings/upcoming', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get recent bookings
 */
export const getRecentBookings = async (limit = 10): Promise<Booking[]> => {
  const response = await api.get<ApiResponse<Booking[]>>('/bookings/recent', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Request refund for booking
 */
export const requestRefund = async (id: string, reason: string): Promise<Booking> => {
  const response = await api.post<ApiResponse<Booking>>(`/bookings/${id}/refund`, { reason });
  return response.data.data;
};

// Types specific to bookings
interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  thisMonthBookings: number;
  thisMonthRevenue: number;
}

