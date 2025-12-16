// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'patient' | 'provider' | 'admin';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  isStaff: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================
// PROVIDER TYPES
// ============================================

export interface Provider {
  id: number;
  userId: number;
  businessName: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  verificationDate?: string;
  categories: string[];
  packageCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  id: number;
  providerId: number;
  provider?: Provider;
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  currency: string;
  duration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Booking {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerId: number;
  providerName?: string;
  packageId: number;
  packageName?: string;
  packageCategory?: string;
  status: BookingStatus;
  statusDisplay: string;
  appointmentDate: string;
  appointmentTime?: string;
  totalPrice: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentStatusDisplay: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STATS TYPES
// ============================================

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

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    patient: number;
    provider: number;
    admin: number;
  };
  newThisWeek: number;
  newThisMonth: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
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

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-slate-100 text-slate-800',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  provider: 'Provider',
  admin: 'Admin',
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  patient: 'bg-sky-100 text-sky-800',
  provider: 'bg-violet-100 text-violet-800',
  admin: 'bg-rose-100 text-rose-800',
};

