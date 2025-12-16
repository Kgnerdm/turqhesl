# 🏥 TurqHeal - Health Tourism Marketplace MVP

TurqHeal, Türkiye'deki sağlık turizmi sağlayıcılarını hastalarla buluşturan modern bir platform. Provider'lar tedavi paketleri oluşturur, hastalar bunları keşfedip rezervasyon yapar.

---

## 📋 İçindekiler

- [Tech Stack](#-tech-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Çalıştırma](#-çalıştırma)
- [Test Kullanıcıları](#-test-kullanıcıları)
- [API Endpoints](#-api-endpoints)
- [Özellikler](#-özellikler)
- [Geliştirme Notları](#-geliştirme-notları)

---

## 🛠 Tech Stack

### Backend
- **Python 3.12+**
- **Django 6.0**
- **Django REST Framework 3.15**
- **Simple JWT 5.3+** (Authentication)
- **PostgreSQL** (Production) / **SQLite** (Development)
- **django-cors-headers** (CORS)

### Frontend
- **React 18**
- **TypeScript**
- **Vite** (Build tool)
- **React Router v6**
- **Axios** (HTTP client)
- **Tailwind CSS**
- **React Hook Form**
- **date-fns** (Date formatting)
- **lucide-react** (Icons)

---

## 📁 Proje Yapısı

```
turqhesl/
├── backend/                    # Django API
│   ├── apps/
│   │   ├── users/             # Authentication & User management
│   │   ├── providers/         # Provider CRUD operations
│   │   ├── packages/          # Package CRUD operations
│   │   └── bookings/          # Booking management
│   ├── config/                # Django settings
│   ├── venv/                  # Python virtual environment
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                   # React applications
│   └── apps/
│       └── customer/          # Customer-facing app
│           ├── src/
│           │   ├── api/       # API service layer
│           │   ├── components/# Reusable components
│           │   ├── pages/     # Page components
│           │   ├── contexts/  # React Context (AuthContext)
│           │   ├── types/     # TypeScript types
│           │   └── utils/     # Utility functions
│           └── package.json
│
└── README.md
```

---

## 🚀 Kurulum

### 1. Backend Kurulumu

```bash
# Backend dizinine git
cd backend

# Virtual environment oluştur (ilk kez)
python3 -m venv venv

# Virtual environment'ı aktifleştir
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Dependencies yükle
pip install -r requirements.txt

# Veritabanı migration'larını çalıştır
python manage.py migrate

# Test verilerini yükle (opsiyonel)
python manage.py seed_data
```

### 2. Frontend Kurulumu

```bash
# Frontend dizinine git
cd frontend/apps/customer

# Dependencies yükle
npm install

# Environment variables oluştur (opsiyonel)
# .env.local dosyası oluştur:
echo "VITE_API_URL=http://localhost:8000/api" > .env.local
```

---

## ▶️ Çalıştırma

### Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # macOS/Linux
python manage.py runserver 8000
```

**Backend URL:** `http://localhost:8000`  
**Admin Panel:** `http://localhost:8000/admin/`

### Frontend (Terminal 2)

```bash
cd frontend/apps/customer
npm run dev
```

**Frontend URL:** `http://localhost:3002` (veya 5173)

---

## 👥 Test Kullanıcıları

### Admin
- **Email:** `admin@turqheal.com`
- **Şifre:** `Admin123!`
- **Rol:** Admin

### Provider
- **Email:** `dental@turqheal.com`
- **Şifre:** `Provider123!`
- **Rol:** Provider
- **Klinik:** Istanbul Dental Center

### Provider (Alternatif)
- **Email:** `hair@turqheal.com`
- **Şifre:** `Provider123!`
- **Klinik:** Hair Turkey Clinic

### Provider (Alternatif 2)
- **Email:** `vision@turqheal.com`
- **Şifre:** `Provider123!`
- **Klinik:** Vision Plus Eye Center

---

## 🔌 API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register/` | Kullanıcı kaydı |
| POST | `/api/auth/login/` | Giriş yap |
| POST | `/api/auth/logout/` | Çıkış yap |
| POST | `/api/auth/token/refresh/` | Token yenile |
| GET | `/api/auth/me/` | Kullanıcı bilgileri |
| PATCH | `/api/auth/me/` | Profil güncelle |
| POST | `/api/auth/change-password/` | Şifre değiştir |

### Providers (`/api/providers/`)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/providers/` | Provider listesi |
| GET | `/api/providers/:id/` | Provider detayı |
| GET | `/api/providers/me/` | Kendi provider profilim |
| GET | `/api/providers/:id/packages/` | Provider'ın paketleri |

### Packages (`/api/packages/`)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/packages/` | Paket listesi (filtering destekli) |
| GET | `/api/packages/:id/` | Paket detayı |
| GET | `/api/packages/my/` | Provider'ın kendi paketleri |
| POST | `/api/packages/create/` | Yeni paket oluştur |
| PATCH | `/api/packages/:id/update/` | Paket güncelle |
| DELETE | `/api/packages/:id/delete/` | Paket sil |
| PATCH | `/api/packages/:id/toggle-status/` | Paket aktif/pasif |

### Bookings (`/api/bookings/`)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/bookings/` | Tüm bookingler (admin) |
| GET | `/api/bookings/my/` | Hastanın kendi bookingleri |
| GET | `/api/bookings/provider/` | Provider'ın bookingleri |
| GET | `/api/bookings/:id/` | Booking detayı |
| POST | `/api/bookings/create/` | Yeni booking oluştur |
| PATCH | `/api/bookings/:id/status/` | Booking durumu güncelle |
| POST | `/api/bookings/:id/cancel/` | Booking iptal et |
| GET | `/api/bookings/stats/` | Booking istatistikleri |

---

## ✨ Özellikler

### 👤 Patient (Hasta)
- ✅ Paket arama ve filtreleme
- ✅ Provider listesi ve detayları
- ✅ Paket detayları görüntüleme
- ✅ Booking oluşturma (appointment date/time seçimi)
- ✅ Kendi bookinglerini görüntüleme
- ✅ Booking iptal etme
- ✅ Profil yönetimi (isim, telefon güncelleme)
- ✅ Şifre değiştirme

### 🏥 Provider (Sağlık Sağlayıcı)
- ✅ Dashboard (istatistikler, son bookingler)
- ✅ Paket yönetimi (oluştur, düzenle, sil, aktif/pasif)
- ✅ Booking yönetimi (onayla, başlat, tamamla, reddet)
- ✅ Booking filtreleme (duruma göre)
- ✅ Profil yönetimi

### 👨‍💼 Admin
- ⚠️ Admin Dashboard (UI var, backend entegrasyonu eksik)
- ⚠️ Provider verification (henüz yapılmadı)

---

## 🔑 Önemli Notlar

### Authentication
- JWT token kullanılıyor (Access + Refresh token)
- Access token: 15 dakika geçerli
- Refresh token: 7 gün geçerli
- Token'lar localStorage'da saklanıyor

### CORS
Backend `settings.py`'de CORS izinleri:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
]
```

### Database
- **Development:** SQLite (`db.sqlite3`)
- **Production:** PostgreSQL (ayar gerekli)

### Veritabanı Seed
Test verileri yüklemek için:
```bash
cd backend
source venv/bin/activate
python manage.py seed_data
```

Bu komut:
- 4 Provider kullanıcısı oluşturur
- 4 Provider profil oluşturur
- 10+ Paket oluşturur

---

## 🐛 Sorun Giderme

### Backend çalışmıyor
```bash
# Virtual environment aktif mi kontrol et
which python  # venv/bin/python göstermeli

# Dependencies yüklü mü?
pip list

# Migration'lar çalıştırıldı mı?
python manage.py showmigrations
```

### Frontend çalışmıyor
```bash
# Node modules yüklü mü?
ls node_modules

# Port kullanımda mı?
lsof -i :3002
lsof -i :5173

# Farklı port dene
npm run dev -- --port 3003
```

### CORS hatası
Backend'de `CORS_ALLOWED_ORIGINS` listesine frontend URL'ini ekle.

---

## 📝 Geliştirme Notları

### Yapılacaklar (TODO)
- [ ] Firebase Storage entegrasyonu (License PDF + Logo upload)
- [x] Admin Dashboard backend entegrasyonu ✅
- [x] Provider verification flow ✅
- [ ] Email notifications
- [ ] Payment integration
- [ ] Reviews & Ratings (MVP dışı)

### MVP Scope (Kapsam Dışı)
- ❌ Ratings & Reviews
- ❌ Comments system
- ❌ Payment processing (şimdilik sadece booking oluşturma)
- ❌ Email notifications
- ❌ Real-time notifications

---

## 🔐 Admin Dashboard

Admin Dashboard ayrı bir Next.js uygulaması olarak çalışır.

### Admin Kurulumu

```bash
cd frontend/apps/admin
npm install
npm run dev
```

**Admin URL:** `http://localhost:3000`

### Admin Özellikleri
- ✅ Platform istatistikleri (kullanıcılar, provider'lar, bookings, gelir)
- ✅ Provider yönetimi (onaylama, reddetme, verification)
- ✅ User yönetimi (listeleme, aktif/pasif, silme)
- ✅ Booking yönetimi (listeleme, filtreleme, detay görüntüleme)
- ✅ Package yönetimi (listeleme, filtreleme)

### Admin API Endpoints
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/auth/admin/users/` | Tüm kullanıcıları listele |
| GET | `/api/auth/admin/users/:id/` | Kullanıcı detayı |
| PATCH | `/api/auth/admin/users/:id/` | Kullanıcı güncelle |
| DELETE | `/api/auth/admin/users/:id/` | Kullanıcı sil (deaktive) |
| GET | `/api/auth/admin/stats/` | Kullanıcı istatistikleri |
| GET | `/api/providers/admin/stats/` | Platform istatistikleri |
| GET | `/api/providers/admin/pending/` | Bekleyen provider'lar |
| POST | `/api/providers/:id/verify/` | Provider onayla |
| POST | `/api/providers/:id/reject/` | Provider reddet |

---

## 📄 License

Bu proje MVP (Minimum Viable Product) aşamasındadır.

---

## 👨‍💻 Geliştirici Notları

**Son Güncelleme:** 2025-12-16

**Durum:** MVP tamamlandı ✅
- Patient flow: ✅
- Provider flow: ✅
- Authentication: ✅
- Admin Dashboard: ✅

**Sonraki Adımlar:**
1. Firebase Storage entegrasyonu
2. Email notifications
3. Production deployment

---

## 🤝 Destek

Sorularınız için issue açabilir veya geliştiriciyle iletişime geçebilirsiniz.

**Happy Coding! 🚀**


