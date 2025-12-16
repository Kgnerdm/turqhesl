# TurqHeal - Health Tourism Platform

## Senior Design Project - Third Presentation Report

**Date:** December 17/24, 2024

**Project Status:** MVP Complete - Client Approved

**Student Team:**
- Kagan Erdem – Student ID: 210402040
- Onur Duyal – Student ID: 210402034

---

## 1. Project Overview

### 1.1 Project Description

TurqHeal is a comprehensive health tourism platform that connects international patients with verified healthcare providers in Turkey. The platform facilitates the entire journey from discovering medical packages to booking treatments, managing appointments, and tracking bookings.

### 1.2 Problem Statement

- International patients face challenges finding reliable healthcare providers abroad
- Lack of transparency in pricing and package details
- Difficulty in comparing different treatment options
- Complex booking and communication processes
- No centralized platform for Turkish medical tourism market

### 1.3 Solution

A full-stack web application that provides:

- **For Patients:** Easy discovery of medical packages, transparent pricing, secure booking system, favorites/wishlist functionality
- **For Healthcare Providers:** Package management, booking management, profile customization, verification system
- **For Administrators:** Platform oversight, provider verification, user management, analytics dashboard

---

## 2. Technology Stack

### 2.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.12+ | Programming Language |
| Django | 5.0.14 | Web Framework |
| Django REST Framework | 3.15.2 | RESTful API |
| Simple JWT | 5.3+ | JWT Authentication |
| drf-spectacular | 0.29 | API Documentation (Swagger/OpenAPI) |
| SQLite | 3 | Development Database |
| PostgreSQL | 15+ | Production Database |
| django-cors-headers | 4.6 | Cross-Origin Resource Sharing |

### 2.2 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Library |
| TypeScript | 5.x | Type-Safe JavaScript |
| Vite | 5.4 | Build Tool & Dev Server |
| Next.js | 16.0 | Admin Dashboard Framework |
| React Router | 6.x | Client-Side Routing |
| Axios | 1.x | HTTP Client |
| Tailwind CSS | 3.x | Utility-First CSS Framework |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |
| Lucide React | - | Icon Library |
| date-fns | - | Date Utilities |

### 2.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version Control |
| GitHub | Code Repository |
| VS Code / Cursor | IDE |
| Postman | API Testing |
| Chrome DevTools | Frontend Debugging |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Customer App   │  │  Admin Dashboard │  │   Mobile View   │  │
│  │  (React+Vite)   │  │    (Next.js)     │  │   (Responsive)  │  │
│  │  Port: 3001     │  │   Port: 3000     │  │                 │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │            │
│           └────────────────────┼────────────────────┘            │
│                                │                                 │
│                         HTTP/HTTPS                               │
│                                │                                 │
├────────────────────────────────┼────────────────────────────────┤
│                        API LAYER                                 │
├────────────────────────────────┼────────────────────────────────┤
│                                ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                Django REST Framework                         ││
│  │                    Port: 8000                                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │  Auth    │ │ Providers│ │ Packages │ │ Bookings │       ││
│  │  │  API     │ │   API    │ │   API    │ │   API    │       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  │                                                              ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                     ││
│  │  │ Favorites│ │  Search  │ │  Admin   │                     ││
│  │  │   API    │ │   API    │ │   API    │                     ││
│  │  └──────────┘ └──────────┘ └──────────┘                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                │                                 │
├────────────────────────────────┼────────────────────────────────┤
│                        DATA LAYER                                │
├────────────────────────────────┼────────────────────────────────┤
│                                ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              SQLite (Dev) / PostgreSQL (Prod)                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  Users │ Providers │ Packages │ Bookings │ Favorites        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      User        │     │     Provider     │     │     Package      │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │     │ id (PK)          │
│ email (unique)   │     │ user_id (FK)     │────▶│ provider_id (FK) │
│ password         │     │ business_name    │     │ name             │
│ first_name       │     │ description      │     │ description      │
│ last_name        │     │ city             │     │ category         │
│ role             │     │ address          │     │ price            │
│ phone            │     │ phone            │     │ currency         │
│ is_active        │     │ email            │     │ duration         │
│ created_at       │     │ website          │     │ includes[]       │
│ updated_at       │     │ logo_url         │     │ excludes[]       │
└──────────────────┘     │ cover_image_url  │     │ images[]         │
         │               │ categories[]     │     │ is_active        │
         │               │ is_verified      │     │ created_at       │
         │               │ is_active        │     └──────────────────┘
         │               │ certificates[]   │              │
         │               │ working_hours{}  │              │
         │               │ created_at       │              │
         │               └──────────────────┘              │
         │                                                 │
         ▼                                                 ▼
┌──────────────────┐                           ┌──────────────────┐
│     Booking      │                           │     Favorite     │
├──────────────────┤                           ├──────────────────┤
│ id (PK)          │                           │ id (PK)          │
│ patient_id (FK)  │                           │ user_id (FK)     │
│ provider_id (FK) │                           │ package_id (FK)  │
│ package_id (FK)  │                           │ created_at       │
│ status           │                           └──────────────────┘
│ booking_date     │
│ appointment_date │
│ appointment_time │
│ patient_name     │
│ patient_email    │
│ patient_phone    │
│ notes            │
│ total_price      │
│ currency         │
│ payment_status   │
│ created_at       │
└──────────────────┘
```

---

## 4. Implemented Features

### 4.1 Authentication & Authorization

| Feature | Description | Status |
|---------|-------------|--------|
| User Registration | Email-based registration with role selection (Patient/Provider) | ✅ Complete |
| User Login | JWT-based authentication with access & refresh tokens | ✅ Complete |
| Password Validation | Strong password requirements (8+ chars, uppercase, lowercase, number) | ✅ Complete |
| Token Refresh | Automatic token refresh mechanism | ✅ Complete |
| Role-Based Access Control | Patient, Provider, Admin roles with different permissions | ✅ Complete |
| Password Change | Secure password change with current password verification | ✅ Complete |
| Profile Management | Update personal information | ✅ Complete |

### 4.2 Patient Features

| Feature | Description | Status |
|---------|-------------|--------|
| Browse Packages | View all available medical packages | ✅ Complete |
| Package Filtering | Filter by category, city, price range | ✅ Complete |
| Package Search | Full-text search in package names and descriptions | ✅ Complete |
| Search Autocomplete | Real-time suggestions while typing (⌘K shortcut) | ✅ Complete |
| Package Details | Detailed view with pricing, duration, inclusions | ✅ Complete |
| Provider Profiles | View provider information and verification status | ✅ Complete |
| Favorites System | Add/remove packages to wishlist | ✅ Complete |
| Favorites Page | Dedicated page for saved packages | ✅ Complete |
| Booking Creation | Create appointments with date/time selection | ✅ Complete |
| Booking Management | View, track, and cancel bookings | ✅ Complete |
| Patient Dashboard | Overview of bookings and quick actions | ✅ Complete |

### 4.3 Provider Features

| Feature | Description | Status |
|---------|-------------|--------|
| Provider Dashboard | Statistics and recent bookings overview | ✅ Complete |
| Package Management | Create, edit, delete medical packages | ✅ Complete |
| Package Status Toggle | Activate/deactivate packages | ✅ Complete |
| Booking Management | View and manage incoming bookings | ✅ Complete |
| Booking Status Updates | Confirm, start, complete, or reject bookings | ✅ Complete |
| Provider Profile | Edit business information, working hours | ✅ Complete |
| Verification Badge | Display verified status after admin approval | ✅ Complete |

### 4.4 Admin Features

| Feature | Description | Status |
|---------|-------------|--------|
| Admin Dashboard | Platform-wide statistics and analytics | ✅ Complete |
| User Management | List, view, edit, deactivate users | ✅ Complete |
| Provider Verification | Approve or reject provider applications | ✅ Complete |
| Provider Management | View all providers and their status | ✅ Complete |
| Booking Overview | Monitor all platform bookings | ✅ Complete |
| Package Overview | View all packages across providers | ✅ Complete |

### 4.5 Platform Features

| Feature | Description | Status |
|---------|-------------|--------|
| Real-time Statistics | Live data from database (not mock) | ✅ Complete |
| API Documentation | Swagger/OpenAPI interactive docs | ✅ Complete |
| Responsive Design | Mobile-friendly interface | ✅ Complete |
| Form Validation | Client-side and server-side validation | ✅ Complete |
| Error Handling | User-friendly error messages | ✅ Complete |
| Loading States | Skeleton loaders and spinners | ✅ Complete |

---

## 5. API Endpoints Summary

### 5.1 Endpoint Statistics

| Category | Count | Authentication |
|----------|-------|----------------|
| Authentication | 7 | Mixed |
| Providers | 10 | Mixed |
| Packages | 8 | Mixed |
| Favorites | 4 | Required |
| Search | 1 | Public |
| Bookings | 8 | Required |
| Admin | 9 | Admin Only |
| **Total** | **47** | - |

### 5.2 API Documentation Access

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI - Interactive API testing |
| `/api/redoc/` | ReDoc - Readable documentation |
| `/api/schema/` | OpenAPI 3.0 JSON schema |

---

## 6. User Interface Screenshots

### 6.1 Customer Application Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero section, search, featured providers, statistics |
| Packages | `/packages` | Package listing with filters and search |
| Package Detail | `/packages/:id` | Detailed package view with booking |
| Providers | `/providers` | Provider listing |
| Provider Detail | `/providers/:id` | Provider profile and packages |
| Login | `/auth/login` | User authentication |
| Register | `/auth/register` | New user registration |
| Patient Dashboard | `/dashboard/patient` | Patient overview |
| Favorites | `/dashboard/patient/favorites` | Saved packages |
| Provider Dashboard | `/dashboard/provider` | Provider management |
| Package Management | `/dashboard/provider/packages` | CRUD operations |
| Booking Management | `/dashboard/provider/bookings` | Booking handling |

### 6.2 Admin Dashboard Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Platform statistics |
| Users | `/users` | User management |
| Providers | `/providers` | Provider management |
| Packages | `/packages` | Package overview |
| Bookings | `/bookings` | Booking monitoring |
| Settings | `/settings` | Admin settings |

---

## 7. Security Implementation

### 7.1 Authentication Security

| Measure | Implementation |
|---------|----------------|
| Password Hashing | Django's PBKDF2 with SHA256 |
| JWT Tokens | Access token (15 min) + Refresh token (7 days) |
| Token Blacklisting | Logout invalidates refresh token |
| CORS Protection | Whitelist-based origin control |
| CSRF Protection | Django's built-in CSRF middleware |

### 7.2 Authorization

| Role | Permissions |
|------|-------------|
| Patient | View packages, create bookings, manage favorites, edit own profile |
| Provider | All patient permissions + manage own packages and bookings |
| Admin | Full platform access, user management, provider verification |

### 7.3 Input Validation

- Frontend: Zod schema validation
- Backend: Django REST Framework serializers
- Database: Model-level constraints

---

## 8. Testing

### 8.1 Testing Approach

| Type | Method | Coverage |
|------|--------|----------|
| Manual Testing | User flow testing | All features |
| API Testing | Swagger UI / Postman | All endpoints |
| Responsive Testing | Chrome DevTools | Mobile, Tablet, Desktop |
| Cross-browser | Chrome, Firefox, Safari | Core functionality |

### 8.2 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@turqheal.com | Admin123! |
| Provider | dental@turqheal.com | Provider123! |
| Provider | hair@turqheal.com | Provider123! |
| Provider | vision@turqheal.com | Provider123! |
| Patient | (Create new account) | - |

---

## 9. Deployment Architecture

### 9.1 Development Environment

```
┌─────────────────────────────────────────┐
│            Development Machine           │
├─────────────────────────────────────────┤
│  Backend:  http://localhost:8000        │
│  Customer: http://localhost:3001        │
│  Admin:    http://localhost:3000        │
│  Database: SQLite (db.sqlite3)          │
└─────────────────────────────────────────┘
```

### 9.2 Production Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloud Provider                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Vercel    │  │   Vercel    │  │   Railway   │         │
│  │  Customer   │  │   Admin     │  │   Backend   │         │
│  │    App      │  │  Dashboard  │  │   + API     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│                 ┌─────────────────┐                         │
│                 │   PostgreSQL    │                         │
│                 │    Database     │                         │
│                 └─────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Project Metrics

### 10.1 Codebase Statistics

| Metric | Count |
|--------|-------|
| Backend Python Files | 25+ |
| Frontend Components | 50+ |
| API Endpoints | 47 |
| Database Models | 5 |
| TypeScript Types | 30+ |

### 10.2 Feature Completion

| Category | Planned | Completed | Percentage |
|----------|---------|-----------|------------|
| Authentication | 7 | 7 | 100% |
| Patient Features | 11 | 11 | 100% |
| Provider Features | 7 | 7 | 100% |
| Admin Features | 6 | 6 | 100% |
| **Total MVP** | **31** | **31** | **100%** |

---

## 11. Challenges & Solutions

### 11.1 Technical Challenges

| Challenge | Solution |
|-----------|----------|
| JWT Token Management | Implemented automatic token refresh with Axios interceptors |
| Real-time Data Updates | Used useEffect hooks with proper dependency arrays |
| Form Validation | Combined React Hook Form with Zod for type-safe validation |
| API Response Transformation | Created transformer functions for snake_case to camelCase |
| CORS Issues | Configured django-cors-headers with specific origins |
| Error Handling | Implemented global error boundaries and toast notifications |

### 11.2 Design Challenges

| Challenge | Solution |
|-----------|----------|
| Responsive Layout | Tailwind CSS with mobile-first approach |
| Complex Forms | Multi-step forms with progress indicators |
| Data Tables | Implemented filtering, sorting, pagination |
| Loading States | Skeleton loaders for better UX |

---

## 12. Future Enhancements

### 12.1 Planned Features

| Feature | Priority | Estimated Effort |
|---------|----------|------------------|
| Payment Integration (Stripe) | High | 2 weeks |
| Email Notifications | High | 1 week |
| File Upload (Firebase) | High | 1 week |
| Real-time Chat | Medium | 2 weeks |
| Reviews & Ratings | Medium | 1 week |
| Multi-language Support | Low | 2 weeks |
| Mobile App (React Native) | Low | 4 weeks |

### 12.2 Technical Improvements

| Improvement | Description |
|-------------|-------------|
| Unit Testing | Jest + React Testing Library |
| E2E Testing | Playwright or Cypress |
| CI/CD Pipeline | GitHub Actions |
| Performance Optimization | Code splitting, lazy loading |
| Monitoring | Error tracking with Sentry |

---

## 13. Conclusion

### 13.1 Project Achievements

- ✅ Successfully developed a full-stack health tourism platform
- ✅ Implemented all MVP features for Patient, Provider, and Admin roles
- ✅ Created comprehensive API with 47 endpoints
- ✅ Built responsive, modern UI with React and Tailwind CSS
- ✅ Implemented secure JWT-based authentication
- ✅ Added advanced features: Search Autocomplete, Favorites, Real-time Stats
- ✅ Created API documentation with Swagger/OpenAPI

### 13.2 Learning Outcomes

- Full-stack development with Django and React
- RESTful API design and implementation
- JWT authentication and authorization
- TypeScript for type-safe development
- Modern CSS with Tailwind
- Database design and ORM usage
- Project management and version control

### 13.3 Final Status

| Aspect | Status |
|--------|--------|
| MVP Features | ✅ 100% Complete |
| Core Functionality | ✅ Working |
| API Documentation | ✅ Available |
| User Testing | ✅ Passed |
| Client Approval | ✅ Approved |

---

## 14. References

### 14.1 Technologies Documentation

- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- Vite: https://vitejs.dev/guide/

### 14.2 Project Repository

- GitHub: [Repository URL]
- API Documentation: http://localhost:8000/api/docs/

---

**Report Generated:** December 16, 2024

**Project Status:** MVP Complete ✅
