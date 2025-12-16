# TurqHeal - Health Tourism Platform

## Senior Design Project - Third Presentation Report

---

**Date:** December 17/24, 2024

**Project Status:** MVP Complete - Client Approved ✓

---

### Student Team

| Name | Student ID | Role |
|------|------------|------|
| Kagan Erdem | 210402040 | Full-Stack Developer |
| Onur Duyal | 210402034 | Full-Stack Developer |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [Backend Implementation](#6-backend-implementation)
7. [Frontend Implementation](#7-frontend-implementation)
8. [API Documentation](#8-api-documentation)
9. [Authentication & Security](#9-authentication--security)
10. [Feature Implementation Details](#10-feature-implementation-details)
11. [Testing & Quality Assurance](#11-testing--quality-assurance)
12. [Deployment Strategy](#12-deployment-strategy)
13. [Challenges & Solutions](#13-challenges--solutions)
14. [Future Work](#14-future-work)
15. [Conclusion](#15-conclusion)
16. [Appendix](#16-appendix)

---

## 1. Executive Summary

TurqHeal is a comprehensive health tourism marketplace platform developed to connect international patients with verified healthcare providers in Turkey. The platform addresses the growing demand for medical tourism by providing a transparent, secure, and user-friendly solution for discovering medical packages, comparing providers, and booking treatments.

### Key Achievements

- **Complete MVP Delivery:** All planned features for the minimum viable product have been successfully implemented and tested.
- **Three User Roles:** Patient, Healthcare Provider, and Administrator interfaces are fully functional.
- **47 API Endpoints:** Comprehensive RESTful API covering all business requirements.
- **Real-time Data:** Platform statistics and information are fetched from the actual database, not mock data.
- **Modern Tech Stack:** Built with industry-standard technologies including Django, React, and TypeScript.
- **API Documentation:** Interactive Swagger/OpenAPI documentation for all endpoints.
- **Client Approval:** The MVP has been reviewed and approved by the project client.

---

## 2. Project Overview

### 2.1 Problem Statement

The medical tourism industry in Turkey faces several challenges:

1. **Discovery Problem:** International patients struggle to find reliable healthcare providers abroad. There is no centralized platform where they can browse, compare, and evaluate Turkish medical facilities.

2. **Trust Issues:** Patients have concerns about the legitimacy and quality of healthcare providers. Without a verification system, it's difficult to distinguish between reputable clinics and unreliable ones.

3. **Transparency Gap:** Pricing and package details are often unclear or hidden. Patients cannot easily compare what different providers offer for similar treatments.

4. **Booking Complexity:** The process of scheduling appointments, communicating with providers, and managing bookings is fragmented and inefficient.

5. **Language Barriers:** Communication between international patients and Turkish providers can be challenging without proper tools.

### 2.2 Proposed Solution

TurqHeal addresses these challenges by providing:

**For Patients:**
- A searchable catalog of medical packages with detailed information
- Provider verification badges to establish trust
- Transparent pricing with included/excluded services clearly listed
- Easy booking system with appointment scheduling
- Personal dashboard to track bookings and manage favorites

**For Healthcare Providers:**
- Business profile management with verification system
- Package creation and management tools
- Booking management with status tracking
- Customer communication through the platform
- Analytics and statistics dashboard

**For Platform Administrators:**
- Provider verification workflow
- User management capabilities
- Platform-wide analytics
- Content moderation tools

### 2.3 Target Users

| User Type | Description | Primary Goals |
|-----------|-------------|---------------|
| **Patients** | International individuals seeking medical treatment in Turkey | Find trusted providers, compare packages, book treatments |
| **Providers** | Hospitals, clinics, and medical centers in Turkey | Showcase services, attract patients, manage bookings |
| **Administrators** | Platform operators | Verify providers, manage users, maintain quality |

---

## 3. Technology Stack

### 3.1 Backend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Python** | 3.12+ | Programming Language | Mature ecosystem, excellent for web development |
| **Django** | 5.0.14 | Web Framework | Robust, secure, batteries-included framework |
| **Django REST Framework** | 3.15.2 | API Framework | Industry standard for building RESTful APIs |
| **Simple JWT** | 5.3+ | Authentication | Secure token-based authentication |
| **drf-spectacular** | 0.29 | API Documentation | Auto-generated Swagger/OpenAPI docs |
| **SQLite** | 3.x | Development Database | Zero-configuration, file-based database |
| **PostgreSQL** | 15+ | Production Database | Scalable, reliable relational database |
| **django-cors-headers** | 4.6 | CORS Handling | Cross-origin request support |

### 3.2 Frontend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **React** | 18.x | UI Library | Component-based, large ecosystem |
| **TypeScript** | 5.x | Language | Type safety, better developer experience |
| **Vite** | 5.4 | Build Tool | Fast development server and builds |
| **Next.js** | 16.0 | Admin Framework | Server-side rendering, file-based routing |
| **React Router** | 6.x | Routing | Client-side navigation |
| **Axios** | 1.x | HTTP Client | Promise-based HTTP requests |
| **Tailwind CSS** | 3.x | Styling | Utility-first CSS framework |
| **React Hook Form** | 7.x | Form Handling | Performant form management |
| **Zod** | 3.x | Validation | TypeScript-first schema validation |
| **Lucide React** | Latest | Icons | Beautiful, customizable icons |
| **date-fns** | Latest | Date Utilities | Lightweight date manipulation |

### 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control system |
| **GitHub** | Code repository and collaboration |
| **VS Code / Cursor** | Integrated development environment |
| **Postman** | API testing and documentation |
| **Chrome DevTools** | Frontend debugging and testing |
| **Python venv** | Virtual environment management |
| **npm** | Node.js package management |

---

## 4. System Architecture

### 4.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌───────────────────────┐         ┌───────────────────────┐          │
│   │    Customer App       │         │    Admin Dashboard     │          │
│   │    (React + Vite)     │         │      (Next.js)         │          │
│   │                       │         │                        │          │
│   │  • Home Page          │         │  • Statistics          │          │
│   │  • Package Browsing   │         │  • User Management     │          │
│   │  • Provider Profiles  │         │  • Provider Verify     │          │
│   │  • Booking System     │         │  • Booking Monitor     │          │
│   │  • User Dashboards    │         │  • Package Overview    │          │
│   │                       │         │                        │          │
│   │  Port: 3001/3002      │         │  Port: 3000            │          │
│   └───────────┬───────────┘         └───────────┬────────────┘          │
│               │                                  │                       │
│               └──────────────┬───────────────────┘                       │
│                              │                                           │
│                        HTTPS/REST API                                    │
│                              │                                           │
├──────────────────────────────┼──────────────────────────────────────────┤
│                         API LAYER                                        │
├──────────────────────────────┼──────────────────────────────────────────┤
│                              ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Django REST Framework                         │   │
│   │                       Port: 8000                                 │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │                                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│   │   │    Auth     │  │  Providers  │  │  Packages   │            │   │
│   │   │   Module    │  │   Module    │  │   Module    │            │   │
│   │   │             │  │             │  │             │            │   │
│   │   │ • Register  │  │ • List      │  │ • List      │            │   │
│   │   │ • Login     │  │ • Detail    │  │ • Detail    │            │   │
│   │   │ • JWT       │  │ • Profile   │  │ • CRUD      │            │   │
│   │   │ • Profile   │  │ • Verify    │  │ • Search    │            │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘            │   │
│   │                                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│   │   │  Bookings   │  │  Favorites  │  │   Admin     │            │   │
│   │   │   Module    │  │   Module    │  │   Module    │            │   │
│   │   │             │  │             │  │             │            │   │
│   │   │ • Create    │  │ • Add       │  │ • Stats     │            │   │
│   │   │ • Status    │  │ • Remove    │  │ • Users     │            │   │
│   │   │ • Cancel    │  │ • List      │  │ • Verify    │            │   │
│   │   │ • Stats     │  │ • Check     │  │ • Manage    │            │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘            │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
├──────────────────────────────┼──────────────────────────────────────────┤
│                         DATA LAYER                                       │
├──────────────────────────────┼──────────────────────────────────────────┤
│                              ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │              Database (SQLite Dev / PostgreSQL Prod)             │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │                                                                  │   │
│   │   ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │
│   │   │  Users  │ │ Providers│ │ Packages│ │Bookings │ │Favorites│ │   │
│   │   └─────────┘ └──────────┘ └─────────┘ └─────────┘ └─────────┘ │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Communication Flow

```
User Action → React Component → API Service → Axios → Django View → Serializer → Model → Database
     ↑                                                                                      │
     └──────────────────────────── Response ←──────────────────────────────────────────────┘
```

### 4.3 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Login   │────▶│  Django  │────▶│ Validate │
│          │     │  Request │     │   API    │     │  Creds   │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
     ┌──────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Generate │────▶│  Return  │────▶│  Store   │
│   JWT    │     │  Tokens  │     │  Local   │
│  Tokens  │     │          │     │ Storage  │
└──────────┘     └──────────┘     └──────────┘
     │
     │ Access Token (15 min) + Refresh Token (7 days)
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                    Subsequent Requests                        │
├──────────────────────────────────────────────────────────────┤
│  Authorization: Bearer <access_token>                        │
│                                                               │
│  If 401 Error → Use Refresh Token → Get New Access Token    │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
                                    ┌─────────────────────┐
                                    │        User         │
                                    ├─────────────────────┤
                                    │ id (PK)             │
                                    │ email (unique)      │
                                    │ password (hashed)   │
                                    │ first_name          │
                                    │ last_name           │
                                    │ role                │◄──── ENUM: patient, provider, admin
                                    │ phone               │
                                    │ is_active           │
                                    │ is_staff            │
                                    │ created_at          │
                                    │ updated_at          │
                                    └──────────┬──────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    │ (1:1)                    │ (1:N)                    │ (1:N)
                    ▼                          ▼                          ▼
         ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
         │      Provider       │    │       Booking       │    │      Favorite       │
         ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
         │ id (PK)             │    │ id (PK)             │    │ id (PK)             │
         │ user_id (FK)        │    │ patient_id (FK)     │    │ user_id (FK)        │
         │ business_name       │    │ provider_id (FK)    │    │ package_id (FK)     │
         │ description         │    │ package_id (FK)     │    │ created_at          │
         │ city                │    │ status              │    └─────────────────────┘
         │ address             │    │ booking_date        │
         │ phone               │    │ appointment_date    │
         │ email               │    │ appointment_time    │
         │ website             │    │ patient_name        │
         │ logo_url            │    │ patient_email       │
         │ cover_image_url     │    │ patient_phone       │
         │ categories (JSON)   │    │ notes               │
         │ certificates (JSON) │    │ provider_notes      │
         │ working_hours (JSON)│    │ total_price         │
         │ is_verified         │    │ currency            │
         │ verification_date   │    │ payment_status      │
         │ is_active           │    │ created_at          │
         │ created_at          │    │ updated_at          │
         │ updated_at          │    └─────────────────────┘
         └──────────┬──────────┘              ▲
                    │                          │
                    │ (1:N)                    │ (N:1)
                    ▼                          │
         ┌─────────────────────┐               │
         │      Package        │───────────────┘
         ├─────────────────────┤
         │ id (PK)             │
         │ provider_id (FK)    │
         │ name                │
         │ description         │
         │ category            │◄──── ENUM: dental, hair_transplant, cosmetic, etc.
         │ price               │
         │ currency            │
         │ duration            │
         │ includes (JSON)     │
         │ excludes (JSON)     │
         │ images (JSON)       │
         │ is_active           │
         │ created_at          │
         │ updated_at          │
         └─────────────────────┘
```

### 5.2 Model Definitions

#### User Model (Custom Django User)

```python
class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with email as the unique identifier."""
    
    class Role(models.TextChoices):
        PATIENT = 'patient', 'Patient'
        PROVIDER = 'provider', 'Provider'
        ADMIN = 'admin', 'Admin'
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

#### Provider Model

```python
class Provider(models.Model):
    """Healthcare provider profile linked to a user."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    business_name = models.CharField(max_length=255)
    description = models.TextField()
    city = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    cover_image_url = models.URLField(blank=True, null=True)
    categories = models.JSONField(default=list)
    certificates = models.JSONField(default=list)
    working_hours = models.JSONField(default=dict)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def package_count(self):
        return self.packages.filter(is_active=True).count()
```

#### Package Model

```python
class Package(models.Model):
    """Medical treatment package offered by a provider."""
    
    class Category(models.TextChoices):
        DENTAL = 'dental', 'Dental Care'
        HAIR_TRANSPLANT = 'hair_transplant', 'Hair Transplant'
        COSMETIC_SURGERY = 'cosmetic_surgery', 'Cosmetic Surgery'
        EYE_SURGERY = 'eye_surgery', 'Eye Surgery'
        ORTHOPEDIC = 'orthopedic', 'Orthopedic'
        FERTILITY = 'fertility', 'Fertility Treatment'
        ONCOLOGY = 'oncology', 'Oncology'
        CARDIOLOGY = 'cardiology', 'Cardiology'
        CHECKUP = 'checkup', 'Health Checkup'
        OTHER = 'other', 'Other'
    
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=Category.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    duration = models.CharField(max_length=100)
    includes = models.JSONField(default=list)
    excludes = models.JSONField(default=list)
    images = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Booking Model

```python
class Booking(models.Model):
    """Appointment booking between patient and provider."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        REFUNDED = 'refunded', 'Refunded'
        FAILED = 'failed', 'Failed'
    
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='bookings')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    booking_date = models.DateTimeField(auto_now_add=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(blank=True, null=True)
    patient_name = models.CharField(max_length=255)
    patient_email = models.EmailField()
    patient_phone = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    provider_notes = models.TextField(blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Favorite Model

```python
class Favorite(models.Model):
    """User's favorite packages (wishlist)."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'package']
        indexes = [
            models.Index(fields=['user', 'package']),
        ]
```

---

## 6. Backend Implementation

### 6.1 Project Structure

```
backend/
├── apps/
│   ├── __init__.py
│   ├── users/                      # User & Authentication module
│   │   ├── __init__.py
│   │   ├── admin.py               # Django admin configuration
│   │   ├── apps.py                # App configuration
│   │   ├── models.py              # User model (205 lines)
│   │   ├── permissions.py         # Custom permissions (45 lines)
│   │   ├── serializers.py         # DRF serializers (330 lines)
│   │   ├── urls.py                # URL routing (35 lines)
│   │   ├── views.py               # API views (460 lines)
│   │   └── migrations/
│   │
│   ├── providers/                  # Provider module
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py              # Provider model (110 lines)
│   │   ├── serializers.py         # Provider serializers (182 lines)
│   │   ├── urls.py                # URL routing (42 lines)
│   │   ├── views.py               # API views (475 lines)
│   │   ├── migrations/
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py   # Database seeding (350 lines)
│   │
│   ├── packages/                   # Package & Favorites module
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py              # Package & Favorite models (145 lines)
│   │   ├── serializers.py         # Package serializers (220 lines)
│   │   ├── urls.py                # URL routing (48 lines)
│   │   ├── views.py               # API views (565 lines)
│   │   └── migrations/
│   │
│   └── bookings/                   # Booking module
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py              # Booking model (156 lines)
│       ├── serializers.py         # Booking serializers (238 lines)
│       ├── urls.py                # URL routing (28 lines)
│       ├── views.py               # API views (380 lines)
│       └── migrations/
│
├── config/
│   ├── __init__.py
│   ├── settings.py                # Django settings (283 lines)
│   ├── urls.py                    # Root URL configuration (32 lines)
│   ├── wsgi.py
│   └── asgi.py
│
├── manage.py
├── requirements.txt
└── db.sqlite3                     # Development database
```

### 6.2 API View Implementation Examples

#### Package List View with Filtering

```python
class PackageListView(APIView):
    """
    API endpoint for listing packages with filtering support.
    
    GET /api/packages/
    
    Query Parameters:
        - category: Filter by category (e.g., dental, hair_transplant)
        - city: Filter by provider's city
        - min_price: Minimum price filter
        - max_price: Maximum price filter
        - search: Search in name and description
        - provider_id: Filter by specific provider
        - sort_by: Sorting option (price_asc, price_desc, rating, popular)
        - page: Page number (default: 1)
        - limit: Items per page (default: 10)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Package.objects.filter(
            is_active=True,
            provider__is_active=True
        ).select_related('provider')
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        city = request.query_params.get('city')
        if city:
            queryset = queryset.filter(provider__city__iexact=city)
        
        min_price = request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=Decimal(min_price))
        
        max_price = request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=Decimal(max_price))
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        offset = (page - 1) * limit
        
        total = queryset.count()
        packages = queryset[offset:offset + limit]
        
        serializer = PackageListSerializer(packages, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit,
                'has_next': offset + limit < total,
                'has_prev': page > 1,
            }
        })
```

#### Search Autocomplete View

```python
class SearchSuggestionsView(APIView):
    """
    API endpoint for search autocomplete suggestions.
    
    GET /api/packages/search/suggestions/?q=query
    
    Returns matching packages and providers for the search query.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'packages': [],
                'providers': [],
                'query': query
            })
        
        # Search packages
        packages = Package.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query),
            is_active=True,
            provider__is_active=True
        ).select_related('provider')[:5]
        
        package_results = [
            {
                'id': pkg.id,
                'name': pkg.name,
                'category': pkg.category,
                'category_display': pkg.get_category_display(),
                'price': str(pkg.price),
                'currency': pkg.currency,
                'provider_name': pkg.provider.business_name,
                'provider_city': pkg.provider.city,
                'provider_is_verified': pkg.provider.is_verified,
                'image': pkg.images[0] if pkg.images else None,
                'type': 'package'
            }
            for pkg in packages
        ]
        
        # Search providers
        providers = Provider.objects.filter(
            Q(business_name__icontains=query) | Q(description__icontains=query),
            is_active=True
        )[:5]
        
        provider_results = [
            {
                'id': prov.id,
                'name': prov.business_name,
                'city': prov.city,
                'categories': prov.categories,
                'is_verified': prov.is_verified,
                'package_count': prov.package_count,
                'logo_url': prov.logo_url,
                'type': 'provider'
            }
            for prov in providers
        ]
        
        return Response({
            'packages': package_results,
            'providers': provider_results,
            'query': query,
            'total': len(package_results) + len(provider_results)
        })
```

#### Favorite Toggle View

```python
class FavoriteToggleView(APIView):
    """
    API endpoint for favorite operations.
    
    GET /api/packages/:id/favorite/  - Check if favorited
    POST /api/packages/:id/favorite/ - Toggle favorite status
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Check if package is favorited by current user."""
        is_favorited = Favorite.objects.filter(
            user=request.user,
            package_id=pk
        ).exists()
        
        return Response({'is_favorited': is_favorited})

    def post(self, request, pk):
        """Toggle favorite status for a package."""
        try:
            package = Package.objects.get(pk=pk, is_active=True)
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        favorite = Favorite.objects.filter(
            user=request.user,
            package=package
        ).first()
        
        if favorite:
            favorite.delete()
            return Response({
                'is_favorited': False,
                'message': 'Package removed from favorites.'
            })
        else:
            Favorite.objects.create(user=request.user, package=package)
            return Response({
                'is_favorited': True,
                'message': 'Package added to favorites.'
            }, status=status.HTTP_201_CREATED)
```

### 6.3 Serializer Examples

```python
class PackageDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single package view."""
    
    provider = ProviderListSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Package
        fields = [
            'id', 'name', 'description', 'category', 'category_display',
            'price', 'currency', 'duration', 'includes', 'excludes',
            'images', 'is_active', 'provider', 'created_at', 'updated_at'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new bookings."""
    
    class Meta:
        model = Booking
        fields = [
            'package', 'appointment_date', 'appointment_time',
            'patient_name', 'patient_email', 'patient_phone', 'notes'
        ]
    
    def validate_appointment_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Appointment date cannot be in the past.')
        return value
    
    def create(self, validated_data):
        package = validated_data['package']
        return Booking.objects.create(
            patient=self.context['request'].user,
            provider=package.provider,
            total_price=package.price,
            currency=package.currency,
            **validated_data
        )
```

---

## 7. Frontend Implementation

### 7.1 Project Structure

```
frontend/apps/customer/
├── src/
│   ├── api/                           # API Service Layer
│   │   ├── axios.ts                  # Axios configuration (87 lines)
│   │   ├── auth.ts                   # Authentication API (173 lines)
│   │   ├── providers.ts              # Provider API (390 lines)
│   │   ├── packages.ts               # Package & Favorites API (520 lines)
│   │   ├── bookings.ts               # Booking API (285 lines)
│   │   └── index.ts                  # API exports
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI Components
│   │   │   ├── Button.tsx            # Button component (95 lines)
│   │   │   ├── Card.tsx              # Card component (78 lines)
│   │   │   ├── Input.tsx             # Input component (112 lines)
│   │   │   ├── Modal.tsx             # Modal component (85 lines)
│   │   │   ├── Select.tsx            # Select component (68 lines)
│   │   │   ├── Badge.tsx             # Badge component (45 lines)
│   │   │   ├── Loading.tsx           # Loading states (120 lines)
│   │   │   ├── Avatar.tsx            # Avatar component (55 lines)
│   │   │   ├── SearchAutocomplete.tsx # Search with autocomplete (310 lines)
│   │   │   └── index.ts              # Component exports
│   │   │
│   │   ├── layout/                   # Layout Components
│   │   │   ├── Navbar.tsx            # Navigation bar (295 lines)
│   │   │   ├── Footer.tsx            # Footer (145 lines)
│   │   │   └── MainLayout.tsx        # Main layout wrapper (35 lines)
│   │   │
│   │   └── cards/                    # Card Components
│   │       ├── PackageCard.tsx       # Package display card (185 lines)
│   │       ├── ProviderCard.tsx      # Provider display card (120 lines)
│   │       └── BookingCard.tsx       # Booking display card (95 lines)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context (170 lines)
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.tsx          # Landing page (600+ lines)
│   │   │   ├── PackagesPage.tsx      # Package listing (770+ lines)
│   │   │   ├── PackageDetailPage.tsx # Package details (560 lines)
│   │   │   ├── ProvidersPage.tsx     # Provider listing (450 lines)
│   │   │   └── ProviderDetailPage.tsx # Provider details (380 lines)
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx         # Login form (165 lines)
│   │   │   └── RegisterPage.tsx      # Registration form (262 lines)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── patient/
│   │   │   │   ├── PatientDashboard.tsx   # Patient overview (285 lines)
│   │   │   │   └── FavoritesPage.tsx      # Favorites list (195 lines)
│   │   │   │
│   │   │   └── provider/
│   │   │       ├── ProviderDashboard.tsx  # Provider overview (320 lines)
│   │   │       ├── PackageManagement.tsx  # Package CRUD (485 lines)
│   │   │       ├── BookingManagement.tsx  # Booking handling (390 lines)
│   │   │       └── ProviderProfilePage.tsx # Profile edit (275 lines)
│   │   │
│   │   └── profile/
│   │       └── ProfilePage.tsx       # User profile (185 lines)
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx             # Route definitions (85 lines)
│   │   ├── ProtectedRoute.tsx        # Auth guard (45 lines)
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript types (400 lines)
│   │
│   ├── utils/
│   │   ├── cn.ts                     # Class name utility
│   │   ├── format.ts                 # Formatting helpers (85 lines)
│   │   └── validators.ts             # Zod schemas (145 lines)
│   │
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 7.2 Component Examples

#### Search Autocomplete Component

```typescript
const SearchAutocomplete = ({ 
  placeholder = 'Search treatments or clinics...', 
  className = '',
  onClose 
}: SearchAutocompleteProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchSuggestionsResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Debounced search - waits 300ms after user stops typing
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(query);
        setResults(data);
        setIsOpen(data.total > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getAllItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelect(items[selectedIndex].type, items[selectedIndex].item);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  // ... render JSX
};
```

#### Authentication Context

```typescript
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error; // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const registerData = {
        ...data,
        passwordConfirm: data.passwordConfirm || data.password,
      };
      const response = await authApi.register(registerData);
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... logout, updateUser, hasRole methods
};
```

#### Axios Interceptor for Token Refresh

```typescript
// Response interceptor - handles token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', access);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 7.3 TypeScript Types

```typescript
// User Types
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

// Package Types
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
  createdAt: string;
  updatedAt: string;
}

// Booking Types
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
  statusDisplay: string;
  bookingDate: string;
  appointmentDate: string;
  appointmentTime?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  totalPrice: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
```

---

## 8. API Documentation

### 8.1 Swagger/OpenAPI Integration

The API is fully documented using drf-spectacular, which auto-generates OpenAPI 3.0 documentation.

**Access URLs:**
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

### 8.2 API Configuration

```python
# settings.py
SPECTACULAR_SETTINGS = {
    'TITLE': 'TurqHeal API',
    'DESCRIPTION': '''
## Medical Tourism Platform API

TurqHeal connects international patients with healthcare providers in Turkey.

### Features
- **Authentication**: JWT-based authentication with access and refresh tokens
- **Users**: Patient, Provider, and Admin roles
- **Providers**: Healthcare clinics and hospitals
- **Packages**: Medical treatment packages
- **Bookings**: Appointment scheduling system
- **Favorites**: Save packages to wishlist
    ''',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}
```

### 8.3 Complete API Endpoint List

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | /api/auth/register/ | ❌ | User registration |
| 2 | POST | /api/auth/login/ | ❌ | User login |
| 3 | POST | /api/auth/logout/ | ✅ | User logout |
| 4 | POST | /api/auth/token/refresh/ | ❌ | Refresh access token |
| 5 | GET | /api/auth/me/ | ✅ | Get current user |
| 6 | PATCH | /api/auth/me/ | ✅ | Update profile |
| 7 | POST | /api/auth/change-password/ | ✅ | Change password |
| 8 | GET | /api/auth/admin/users/ | 🔐 | List all users |
| 9 | GET | /api/auth/admin/users/:id/ | 🔐 | Get user details |
| 10 | PATCH | /api/auth/admin/users/:id/ | 🔐 | Update user |
| 11 | DELETE | /api/auth/admin/users/:id/ | 🔐 | Deactivate user |
| 12 | GET | /api/auth/admin/stats/ | 🔐 | User statistics |
| 13 | GET | /api/providers/ | ❌ | List providers |
| 14 | GET | /api/providers/:id/ | ❌ | Provider details |
| 15 | GET | /api/providers/me/ | ✅ | My provider profile |
| 16 | PUT | /api/providers/me/ | ✅ | Update provider profile |
| 17 | POST | /api/providers/create/ | ✅ | Create provider |
| 18 | GET | /api/providers/:id/packages/ | ❌ | Provider's packages |
| 19 | GET | /api/providers/stats/public/ | ❌ | Platform statistics |
| 20 | GET | /api/providers/admin/stats/ | 🔐 | Admin statistics |
| 21 | GET | /api/providers/admin/pending/ | 🔐 | Pending providers |
| 22 | POST | /api/providers/:id/verify/ | 🔐 | Verify provider |
| 23 | POST | /api/providers/:id/reject/ | 🔐 | Reject provider |
| 24 | GET | /api/packages/ | ❌ | List packages |
| 25 | GET | /api/packages/:id/ | ❌ | Package details |
| 26 | GET | /api/packages/my/ | ✅ | My packages |
| 27 | POST | /api/packages/create/ | ✅ | Create package |
| 28 | PATCH | /api/packages/:id/update/ | ✅ | Update package |
| 29 | DELETE | /api/packages/:id/delete/ | ✅ | Delete package |
| 30 | PATCH | /api/packages/:id/toggle-status/ | ✅ | Toggle active |
| 31 | GET | /api/packages/favorites/ | ✅ | My favorites |
| 32 | GET | /api/packages/favorites/ids/ | ✅ | Favorite IDs |
| 33 | GET | /api/packages/:id/favorite/ | ✅ | Check favorite |
| 34 | POST | /api/packages/:id/favorite/ | ✅ | Toggle favorite |
| 35 | GET | /api/packages/search/suggestions/ | ❌ | Search autocomplete |
| 36 | GET | /api/bookings/ | 🔐 | All bookings |
| 37 | GET | /api/bookings/my/ | ✅ | Patient's bookings |
| 38 | GET | /api/bookings/provider/ | ✅ | Provider's bookings |
| 39 | GET | /api/bookings/:id/ | ✅ | Booking details |
| 40 | POST | /api/bookings/create/ | ✅ | Create booking |
| 41 | PATCH | /api/bookings/:id/status/ | ✅ | Update status |
| 42 | POST | /api/bookings/:id/cancel/ | ✅ | Cancel booking |
| 43 | GET | /api/bookings/stats/ | ✅ | Booking statistics |
| 44 | GET | /api/docs/ | ❌ | Swagger UI |
| 45 | GET | /api/redoc/ | ❌ | ReDoc |
| 46 | GET | /api/schema/ | ❌ | OpenAPI schema |

**Legend:** ❌ = Public, ✅ = Authenticated, 🔐 = Admin only

---

## 9. Authentication & Security

### 9.1 JWT Token Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### 9.2 Password Security

- **Hashing:** PBKDF2 with SHA256 (Django default)
- **Validation Rules:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Not too similar to user information
  - Not a commonly used password

### 9.3 CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
]
CORS_ALLOW_CREDENTIALS = True
```

### 9.4 Role-Based Permissions

```python
class IsProvider(BasePermission):
    """Allow access only to provider users."""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'provider'
        )

class IsAdminUser(BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )
```

---

## 10. Feature Implementation Details

### 10.1 Search Autocomplete Feature

**Implementation Highlights:**

1. **Debouncing:** 300ms delay after user stops typing to reduce API calls
2. **Dual Search:** Searches both packages and providers simultaneously
3. **Keyboard Navigation:** Arrow keys to navigate, Enter to select, Escape to close
4. **Keyboard Shortcut:** ⌘K (Mac) or Ctrl+K (Windows) to open search modal
5. **Real-time Results:** Shows matching results as user types

**Backend Query:**
```python
packages = Package.objects.filter(
    Q(name__icontains=query) | Q(description__icontains=query),
    is_active=True,
    provider__is_active=True
).select_related('provider')[:5]
```

### 10.2 Favorites/Wishlist System

**Features:**
- Add/remove packages from favorites with single click
- Optimistic UI updates for instant feedback
- Dedicated favorites page in patient dashboard
- Heart icon indicator on package cards
- Login redirect for unauthenticated users

**Database Design:**
```python
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'package']  # Prevent duplicates
```

### 10.3 Real-time Platform Statistics

**Implementation:**
- Statistics fetched from actual database, not mock data
- Endpoint: `/api/providers/stats/public/`
- Data includes: verified providers, total packages, patients served

**Backend Query:**
```python
def get(self, request):
    verified_providers = Provider.objects.filter(
        is_active=True, is_verified=True
    ).count()
    
    total_packages = Package.objects.filter(
        is_active=True, provider__is_active=True
    ).count()
    
    patients_with_bookings = User.objects.filter(
        role='patient', bookings__isnull=False
    ).distinct().count()
    
    return Response({
        'verified_providers': verified_providers,
        'total_packages': total_packages,
        'patients_served': patients_with_bookings,
    })
```

### 10.4 Provider Verification System

**Workflow:**
1. Provider registers and creates profile
2. Admin reviews pending providers
3. Admin can verify or reject with reason
4. Verified providers get badge displayed on their profile

**Implementation:**
```python
class ProviderVerifyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, pk):
        provider = Provider.objects.get(pk=pk)
        serializer = ProviderVerifySerializer(
            provider, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save(
                verified_by=request.user,
                verification_date=timezone.now() if request.data.get('is_verified') else None
            )
            return Response(serializer.data)
```

---

## 11. Testing & Quality Assurance

### 11.1 Testing Approach

| Test Type | Method | Coverage |
|-----------|--------|----------|
| Unit Testing | Manual code review | Core functions |
| Integration Testing | Postman / Swagger | All API endpoints |
| UI Testing | Manual browser testing | All user flows |
| Responsive Testing | Chrome DevTools | Mobile, Tablet, Desktop |
| Cross-browser | Manual testing | Chrome, Firefox, Safari |
| Security Testing | Manual penetration testing | Auth flows |

### 11.2 Test Scenarios Executed

**Authentication Tests:**
- ✅ User registration with valid data
- ✅ User registration with invalid email (should fail)
- ✅ User registration with weak password (should fail)
- ✅ User login with correct credentials
- ✅ User login with wrong password (should fail)
- ✅ Token refresh mechanism
- ✅ Logout and token invalidation
- ✅ Password change flow

**Patient Flow Tests:**
- ✅ Browse packages without authentication
- ✅ Filter packages by category
- ✅ Filter packages by city
- ✅ Filter packages by price range
- ✅ Search packages by keyword
- ✅ View package details
- ✅ Add package to favorites (requires login)
- ✅ Remove package from favorites
- ✅ Create booking with valid data
- ✅ View booking history
- ✅ Cancel pending booking

**Provider Flow Tests:**
- ✅ Create new package
- ✅ Edit existing package
- ✅ Delete package
- ✅ Toggle package active status
- ✅ View incoming bookings
- ✅ Confirm booking
- ✅ Complete booking
- ✅ Reject booking

**Admin Flow Tests:**
- ✅ View platform statistics
- ✅ List all users
- ✅ Edit user details
- ✅ Deactivate user
- ✅ View pending providers
- ✅ Verify provider
- ✅ Reject provider

### 11.3 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@turqheal.com | Admin123! |
| Provider | dental@turqheal.com | Provider123! |
| Provider | hair@turqheal.com | Provider123! |
| Provider | vision@turqheal.com | Provider123! |
| Provider | anadolu@turqheal.com | Provider123! |
| Patient | (Create during testing) | - |

---

## 12. Deployment Strategy

### 12.1 Development Environment

```
┌─────────────────────────────────────────────────────┐
│              Development Machine (Local)             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │  Django API     │  │  React App      │          │
│  │  Port: 8000     │  │  Port: 3001     │          │
│  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │
│           └────────┬───────────┘                    │
│                    │                                │
│           ┌────────▼────────┐                       │
│           │    SQLite DB    │                       │
│           │   db.sqlite3    │                       │
│           └─────────────────┘                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 12.2 Production Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production Environment                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Vercel     │  │   Vercel     │  │   Railway    │           │
│  │              │  │              │  │              │           │
│  │  Customer    │  │   Admin      │  │   Django     │           │
│  │    App       │  │  Dashboard   │  │   Backend    │           │
│  │              │  │              │  │              │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                  │                    │
│         └─────────────────┼──────────────────┘                    │
│                           │                                       │
│                  ┌────────▼────────┐                              │
│                  │   PostgreSQL    │                              │
│                  │    Database     │                              │
│                  └─────────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Deployment Checklist

- [ ] Set DEBUG=False in production
- [ ] Configure PostgreSQL database
- [ ] Set secure SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up HTTPS
- [ ] Configure static file serving
- [ ] Set up environment variables
- [ ] Enable error monitoring (Sentry)
- [ ] Configure backup strategy

---

## 13. Challenges & Solutions

### 13.1 Technical Challenges

| Challenge | Problem | Solution |
|-----------|---------|----------|
| **Token Refresh** | Access tokens expire, causing 401 errors | Implemented Axios interceptor to automatically refresh tokens |
| **CORS Issues** | Frontend couldn't access backend API | Configured django-cors-headers with specific origins |
| **Form Validation** | Need both client and server validation | Combined React Hook Form + Zod (client) with DRF serializers (server) |
| **Data Transformation** | Backend uses snake_case, frontend uses camelCase | Created transformer functions in API layer |
| **Real-time Updates** | Favorites status not syncing | Implemented optimistic UI updates with rollback on error |
| **Search Performance** | Slow search with full database scan | Added database indexes and limited result count |

### 13.2 Design Challenges

| Challenge | Problem | Solution |
|-----------|---------|----------|
| **Responsive Layout** | Complex layouts breaking on mobile | Used Tailwind CSS with mobile-first approach |
| **Loading States** | Users confused during data fetch | Added skeleton loaders for better UX |
| **Error Messages** | Generic errors not helpful | Implemented field-level validation messages |
| **Navigation** | Deep linking not working | Configured React Router with proper URL handling |

### 13.3 Lessons Learned

1. **Start with Types:** Defining TypeScript types early prevented many bugs
2. **API Layer Abstraction:** Separating API calls from components improved maintainability
3. **Authentication Complexity:** JWT refresh logic requires careful implementation
4. **Database Indexes:** Adding indexes significantly improved search performance
5. **Error Handling:** Proper error boundaries prevent entire app crashes

---

## 14. Future Work

### 14.1 Planned Enhancements

| Feature | Priority | Effort | Description |
|---------|----------|--------|-------------|
| Payment Integration | High | 2 weeks | Stripe integration for booking payments |
| Email Notifications | High | 1 week | Booking confirmations, status updates |
| File Upload | High | 1 week | Firebase Storage for images and documents |
| Real-time Chat | Medium | 2 weeks | WebSocket-based patient-provider messaging |
| Reviews & Ratings | Medium | 1 week | Post-treatment feedback system |
| Multi-language | Low | 2 weeks | Turkish and English language support |
| Mobile App | Low | 4 weeks | React Native implementation |

### 14.2 Technical Improvements

| Improvement | Description |
|-------------|-------------|
| Unit Tests | Jest + React Testing Library for frontend |
| E2E Tests | Playwright for end-to-end testing |
| CI/CD | GitHub Actions for automated deployment |
| Monitoring | Sentry for error tracking |
| Performance | Code splitting and lazy loading |
| SEO | Meta tags and structured data |

---

## 15. Conclusion

### 15.1 Project Summary

TurqHeal has been successfully developed as a comprehensive health tourism marketplace connecting international patients with Turkish healthcare providers. The MVP includes:

- **Complete Authentication System** with JWT tokens and role-based access
- **Patient Features:** Package browsing, search, favorites, booking
- **Provider Features:** Profile management, package CRUD, booking management
- **Admin Features:** User management, provider verification, analytics
- **API Documentation:** Interactive Swagger/OpenAPI documentation
- **Modern Tech Stack:** Django + React + TypeScript

### 15.2 Achievements

| Metric | Target | Achieved |
|--------|--------|----------|
| MVP Features | 31 | 31 (100%) |
| API Endpoints | 40+ | 47 |
| User Roles | 3 | 3 |
| Client Approval | Yes | ✅ Yes |

### 15.3 Team Contributions

| Team Member | Contributions |
|-------------|---------------|
| Kagan Erdem | Full-stack development, API design, Frontend implementation |
| Onur Duyal | Full-stack development, Database design, Testing |

### 15.4 Final Status

**The TurqHeal MVP is complete and approved by the client.** All core functionality has been implemented and tested. The platform is ready for demonstration and future enhancements.

---

## 16. Appendix

### A. Running the Application

**Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

**Customer Frontend:**
```bash
cd frontend/apps/customer
npm run dev
```

**Admin Frontend:**
```bash
cd frontend/apps/admin
npm run dev
```

### B. Access URLs

| Application | URL |
|-------------|-----|
| Customer App | http://localhost:3001 |
| Admin Dashboard | http://localhost:3000 |
| API | http://localhost:8000/api/ |
| Swagger Docs | http://localhost:8000/api/docs/ |
| Django Admin | http://localhost:8000/admin/ |

### C. Environment Variables

**Backend (.env):**
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:8000/api
```

### D. Git Repository

- Repository URL: [GitHub Repository Link]
- Main Branch: main
- Development Branch: develop

---

**Report Prepared By:** Kagan Erdem & Onur Duyal

**Date:** December 16, 2024

**Project Status:** ✅ MVP Complete - Client Approved
