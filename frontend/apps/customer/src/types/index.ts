// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'patient' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================
// PROVIDER TYPES
// ============================================

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  images: string[];
  isVerified: boolean;
  verificationDate?: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  certificates: Certificate[];
  workingHours: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  documentUrl?: string;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ProviderFilters {
  city?: string;
  category?: string;
  isVerified?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================
// PACKAGE TYPES
// ============================================

export type PackageCategory = 
  | 'dental'
  | 'hair_transplant'
  | 'cosmetic_surgery'
  | 'eye_surgery'
  | 'orthopedic'
  | 'fertility'
  | 'oncology'
  | 'cardiology'
  | 'checkup'
  | 'other';

export interface Package {
  id: string;
  providerId: string;
  provider?: Provider;
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  currency: string;
  duration: string;
  includes: string[];
  excludes: string[];
  images: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFilters {
  category?: PackageCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  providerId?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface CreatePackageRequest {
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  currency: string;
  duration: string;
  includes: string[];
  excludes: string[];
  images: string[];
}

// ============================================
// BOOKING TYPES
// ============================================

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface Booking {
  id: string;
  patientId: string;
  patient?: User;
  providerId: string;
  provider?: Provider;
  packageId: string;
  package?: Package;
  status: BookingStatus;
  bookingDate: string;
  appointmentDate: string;
  notes?: string;
  totalPrice: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface CreateBookingRequest {
  packageId: string;
  appointmentDate: string;
  notes?: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  notes?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  userId: string;
  user?: User;
  providerId?: string;
  packageId?: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  providerId?: string;
  packageId?: string;
  rating: number;
  comment: string;
  images?: string[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// UI TYPES
// ============================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const PACKAGE_CATEGORIES: Record<PackageCategory, string> = {
  dental: 'Dental Care',
  hair_transplant: 'Hair Transplant',
  cosmetic_surgery: 'Cosmetic Surgery',
  eye_surgery: 'Eye Surgery',
  orthopedic: 'Orthopedic',
  fertility: 'Fertility Treatment',
  oncology: 'Oncology',
  cardiology: 'Cardiology',
  checkup: 'Health Checkup',
  other: 'Other',
};

export const TURKISH_CITIES = [
  'Istanbul',
  'Ankara',
  'Izmir',
  'Antalya',
  'Bursa',
  'Adana',
  'Konya',
  'Gaziantep',
  'Mersin',
  'Kayseri',
] as const;

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

