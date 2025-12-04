import { z } from 'zod';

/**
 * Common validation schemas
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .min(10, 'Please enter a valid phone number')
  .regex(/^[+]?[\d\s()-]+$/, 'Please enter a valid phone number');

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['patient', 'provider'], {
    required_error: 'Please select a role',
  }),
  phone: phoneSchema.optional().or(z.literal('')),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Package form schema
 */
export const packageSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.enum([
    'dental',
    'hair_transplant',
    'cosmetic_surgery',
    'eye_surgery',
    'orthopedic',
    'fertility',
    'oncology',
    'cardiology',
    'checkup',
    'other',
  ]),
  price: z.number().min(1, 'Price must be greater than 0'),
  currency: z.string().default('USD'),
  duration: z.string().min(1, 'Duration is required'),
  includes: z.array(z.string()).min(1, 'Please add at least one inclusion'),
  excludes: z.array(z.string()).optional().default([]),
});

export type PackageFormData = z.infer<typeof packageSchema>;

/**
 * Booking form schema
 */
export const bookingSchema = z.object({
  packageId: z.string().min(1, 'Package is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

/**
 * Provider profile form schema
 */
export const providerProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(10, 'Please enter a complete address'),
  phone: phoneSchema,
  email: emailSchema,
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
});

export type ProviderProfileFormData = z.infer<typeof providerProfileSchema>;

/**
 * Review form schema
 */
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

/**
 * Contact form schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Password change form schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

