# 🏥 TurqHeal - Health Tourism Marketplace MVP

TurqHeal, Türkiye'deki sağlık turizmi sağlayıcılarını uluslararası hastalarla buluşturan modern bir platformdur. Provider'lar tedavi paketleri oluşturur, hastalar bunları keşfedip rezervasyon yapar.

---

## 📋 İçindekiler

- [Tech Stack](#-tech-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Çalıştırma](#-çalıştırma)
- [Test Kullanıcıları](#-test-kullanıcıları)
- [API Endpoints](#-api-endpoints)
- [API Dokümantasyonu](#-api-dokümantasyonu-swagger)
- [Özellikler](#-özellikler)
- [Sunum Rehberi](#-sunum-rehberi)

---

## 🛠 Tech Stack

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Python | 3.12+ | Programlama dili |
| Django | 5.0 | Web framework |
| Django REST Framework | 3.15 | API framework |
| Simple JWT | 5.3+ | JWT Authentication |
| drf-spectacular | 0.27+ | Swagger/OpenAPI docs |
| PostgreSQL / SQLite | - | Veritabanı |
| django-cors-headers | 4.6 | CORS desteği |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| React Router | v6 | Routing |
| Axios | - | HTTP client |
| Tailwind CSS | 3.x | Styling |
| React Hook Form | - | Form handling |
| Zod | - | Validation |
| Lucide React | - | Icons |

---

## 📁 Proje Yapısı

```
turqhesl/
├── backend/                        # Django REST API
│   ├── apps/
│   │   ├── users/                 # Authentication & User management
│   │   ├── providers/             # Provider CRUD + Stats
│   │   ├── packages/              # Packages + Favorites + Search
│   │   └── bookings/              # Booking management
│   ├── config/                    # Django settings & URLs
│   ├── venv/                      # Python virtual environment
│   ├── db.sqlite3                 # SQLite database
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   └── apps/
│       ├── customer/              # 🌐 Customer-facing app (React + Vite)
│       │   ├── src/
│       │   │   ├── api/           # API service layer
│       │   │   ├── components/    # UI components
│       │   │   ├── contexts/      # AuthContext
│       │   │   ├── pages/         # Page components
│       │   │   ├── routes/        # React Router config
│       │   │   ├── types/         # TypeScript types
│       │   │   └── utils/         # Helpers & validators
│       │   └── package.json
│       │
│       └── admin/                 # 🔧 Admin Dashboard (Next.js)
│           ├── app/               # Next.js App Router
│           ├── components/        # Admin UI components
│           ├── lib/               # API services
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

# Virtual environment oluştur
python3 -m venv venv

# Aktifleştir
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Dependencies yükle
pip install -r requirements.txt

# Veritabanı migration'ları
python manage.py migrate

# Test verilerini yükle
python manage.py seed_data

# Admin kullanıcısı oluştur (opsiyonel)
python manage.py createsuperuser
```

### 2. Customer Frontend Kurulumu

```bash
cd frontend/apps/customer
npm install
```

### 3. Admin Frontend Kurulumu

```bash
cd frontend/apps/admin
npm install
```

---

## ▶️ Çalıştırma

### Tüm Servisleri Başlat

| Terminal | Komut | URL |
|----------|-------|-----|
| Terminal 1 | `cd backend && source venv/bin/activate && python manage.py runserver 8000` | http://localhost:8000 |
| Terminal 2 | `cd frontend/apps/customer && npm run dev` | http://localhost:3001 |
| Terminal 3 | `cd frontend/apps/admin && npm run dev` | http://localhost:3000 |

### Erişim URL'leri

| Uygulama | URL | Açıklama |
|----------|-----|----------|
| **Customer App** | http://localhost:3001 | Hasta & Provider portalı |
| **Admin Dashboard** | http://localhost:3000 | Yönetim paneli |
| **API** | http://localhost:8000/api/ | REST API |
| **Swagger Docs** | http://localhost:8000/api/docs/ | API Dokümantasyonu |
| **ReDoc** | http://localhost:8000/api/redoc/ | Alternatif API docs |
| **Django Admin** | http://localhost:8000/admin/ | Django admin paneli |

---

## 👥 Test Kullanıcıları

### Admin
| | |
|---|---|
| **Email** | admin@turqheal.com |
| **Şifre** | Admin123! |
| **Erişim** | http://localhost:3000 |

### Provider Hesapları
| Klinik | Email | Şifre |
|--------|-------|-------|
| Istanbul Dental Center | dental@turqheal.com | Provider123! |
| Hair Turkey Clinic | hair@turqheal.com | Provider123! |
| Vision Plus Eye Center | vision@turqheal.com | Provider123! |
| Anadolu Medical Center | anadolu@turqheal.com | Provider123! |

### Hasta
Yeni kayıt oluşturarak test edebilirsiniz.

---

## 🔌 API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/register/` | ❌ | Kullanıcı kaydı |
| POST | `/login/` | ❌ | Giriş yap |
| POST | `/logout/` | ✅ | Çıkış yap |
| POST | `/token/refresh/` | ❌ | Token yenile |
| GET | `/me/` | ✅ | Kullanıcı bilgileri |
| PATCH | `/me/` | ✅ | Profil güncelle |
| POST | `/change-password/` | ✅ | Şifre değiştir |

### Providers (`/api/providers/`)

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/` | ❌ | Provider listesi (filtreleme destekli) |
| GET | `/:id/` | ❌ | Provider detayı |
| GET | `/me/` | ✅ | Kendi provider profilim |
| PUT | `/me/` | ✅ | Provider profil güncelle |
| GET | `/:id/packages/` | ❌ | Provider'ın paketleri |
| GET | `/stats/public/` | ❌ | Platform istatistikleri |

### Packages (`/api/packages/`)

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/` | ❌ | Paket listesi (filtreleme destekli) |
| GET | `/:id/` | ❌ | Paket detayı |
| GET | `/my/` | ✅ | Provider'ın kendi paketleri |
| POST | `/create/` | ✅ | Yeni paket oluştur |
| PATCH | `/:id/update/` | ✅ | Paket güncelle |
| DELETE | `/:id/delete/` | ✅ | Paket sil |
| PATCH | `/:id/toggle-status/` | ✅ | Paket aktif/pasif |

### Favorites (`/api/packages/`)

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/favorites/` | ✅ | Favori paketler listesi |
| GET | `/favorites/ids/` | ✅ | Favori paket ID'leri |
| GET | `/:id/favorite/` | ✅ | Favori durumu kontrol |
| POST | `/:id/favorite/` | ✅ | Favorilere ekle/çıkar (toggle) |

### Search (`/api/packages/`)

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/search/suggestions/?q=` | ❌ | Autocomplete önerileri |

### Bookings (`/api/bookings/`)

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/` | ✅ | Tüm bookingler (admin) |
| GET | `/my/` | ✅ | Hastanın bookingleri |
| GET | `/provider/` | ✅ | Provider'ın bookingleri |
| GET | `/:id/` | ✅ | Booking detayı |
| POST | `/create/` | ✅ | Yeni booking oluştur |
| PATCH | `/:id/status/` | ✅ | Booking durumu güncelle |
| POST | `/:id/cancel/` | ✅ | Booking iptal et |
| GET | `/stats/` | ✅ | Booking istatistikleri |

### Admin Endpoints

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/auth/admin/users/` | 🔐 | Kullanıcı listesi |
| GET | `/auth/admin/users/:id/` | 🔐 | Kullanıcı detayı |
| PATCH | `/auth/admin/users/:id/` | 🔐 | Kullanıcı güncelle |
| DELETE | `/auth/admin/users/:id/` | 🔐 | Kullanıcı deaktive |
| GET | `/auth/admin/stats/` | 🔐 | Kullanıcı istatistikleri |
| GET | `/providers/admin/stats/` | 🔐 | Platform istatistikleri |
| GET | `/providers/admin/pending/` | 🔐 | Bekleyen provider'lar |
| POST | `/providers/:id/verify/` | 🔐 | Provider onayla |
| POST | `/providers/:id/reject/` | 🔐 | Provider reddet |

> 🔐 = Admin yetkisi gerekli

---

## 📚 API Dokümantasyonu (Swagger)

Interaktif API dokümantasyonu için:

| URL | Açıklama |
|-----|----------|
| http://localhost:8000/api/docs/ | Swagger UI (interaktif test) |
| http://localhost:8000/api/redoc/ | ReDoc (okunabilir format) |
| http://localhost:8000/api/schema/ | OpenAPI JSON schema |

### Swagger Kullanımı

1. http://localhost:8000/api/docs/ adresine git
2. Sağ üstteki **"Authorize"** butonuna tıkla
3. `Bearer <access_token>` formatında token gir
4. "Try it out" ile endpoint'leri test et

---

## ✨ Özellikler

### 👤 Hasta (Patient)

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Paket arama & filtreleme | ✅ | Kategori, şehir, fiyat filtresi |
| Search Autocomplete | ✅ | ⌘K ile hızlı arama |
| Provider listeleme | ✅ | Verified badge gösterimi |
| Paket detay görüntüleme | ✅ | Fiyat, süre, dahil olanlar |
| Favorilere ekleme | ✅ | Kalp butonu ile kaydetme |
| Favoriler sayfası | ✅ | Kaydedilen paketler |
| Booking oluşturma | ✅ | Tarih/saat seçimi |
| Booking takibi | ✅ | Durum görüntüleme |
| Booking iptal | ✅ | İptal nedeni ile |
| Profil yönetimi | ✅ | İsim, telefon güncelleme |
| Şifre değiştirme | ✅ | Güvenli şifre değişimi |

### 🏥 Provider (Sağlık Kuruluşu)

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Dashboard | ✅ | İstatistikler, son bookingler |
| Paket CRUD | ✅ | Oluştur, düzenle, sil |
| Paket aktif/pasif | ✅ | Yayından kaldırma |
| Booking yönetimi | ✅ | Onayla, başlat, tamamla |
| Booking filtreleme | ✅ | Duruma göre |
| Profil düzenleme | ✅ | Klinik bilgileri |
| Verified badge | ✅ | Admin onayı ile |

### 👨‍💼 Admin

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Dashboard | ✅ | Platform istatistikleri |
| Kullanıcı yönetimi | ✅ | Listeleme, düzenleme, deaktive |
| Provider onaylama | ✅ | Verification flow |
| Provider reddetme | ✅ | Neden belirterek |
| Booking görüntüleme | ✅ | Tüm reservasyonlar |
| Paket görüntüleme | ✅ | Tüm paketler |

### 🔧 Teknik Özellikler

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| JWT Authentication | ✅ | Access + Refresh token |
| Role-based Access | ✅ | Patient, Provider, Admin |
| API Documentation | ✅ | Swagger / OpenAPI 3.0 |
| Real-time Stats | ✅ | Veritabanından canlı veri |
| Responsive Design | ✅ | Mobile-friendly |
| Form Validation | ✅ | Frontend + Backend |
| Error Handling | ✅ | Kullanıcı dostu mesajlar |

---

## 🎯 Sunum Rehberi

### Sunum Sırası (15-20 dakika)

#### 1. Giriş (2 dk)
- Problem: Medikal turizm pazarında güvenilir platform eksikliği
- Çözüm: TurqHeal platformu
- Tech stack özeti

#### 2. Hasta Akışı (5 dk)
1. Ana sayfa → Gerçek istatistikler
2. Paket arama → Filtreleme, Search Autocomplete (⌘K)
3. Paket detay → Favori ekleme
4. Kayıt/Giriş → Form validasyonları
5. Booking oluşturma
6. Dashboard → Favoriler, Bookings

#### 3. Provider Akışı (4 dk)
1. Provider girişi (dental@turqheal.com)
2. Dashboard istatistikleri
3. Paket yönetimi (CRUD)
4. Booking onaylama

#### 4. Admin Akışı (3 dk)
1. Admin girişi (admin@turqheal.com)
2. Platform istatistikleri
3. Provider verification
4. Kullanıcı yönetimi

#### 5. Teknik Demo (3 dk)
1. Swagger UI → API docs
2. Mobil görünüm (responsive)
3. JWT authentication

#### 6. Kapanış (2 dk)
- Özet
- Gelecek özellikler
- Sorular

---

## 🔑 Önemli Notlar

### Authentication
- JWT token: Access (15 dk) + Refresh (7 gün)
- Token'lar localStorage'da saklanır
- Otomatik token refresh

### Veritabanı
- **Development:** SQLite (`db.sqlite3`)
- **Production:** PostgreSQL

### CORS Ayarları
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
]
```

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor
```bash
# Virtual environment aktif mi?
which python  # venv/bin/python göstermeli

# Migration'lar güncel mi?
python manage.py migrate

# Port kullanımda mı?
lsof -i :8000
```

### Frontend Çalışmıyor
```bash
# Dependencies yüklü mü?
npm install

# Cache temizle
rm -rf node_modules/.vite
npm run dev
```

### CORS Hatası
Backend `settings.py`'de frontend URL'ini `CORS_ALLOWED_ORIGINS`'e ekle.

---

## 📝 Gelecek Özellikler (Roadmap)

| Özellik | Öncelik | Durum |
|---------|---------|-------|
| Firebase Storage (dosya upload) | Yüksek | ⏳ Planlandı |
| Email notifications | Yüksek | ⏳ Planlandı |
| Payment integration | Orta | ⏳ Planlandı |
| Real-time notifications | Orta | ⏳ Planlandı |
| Reviews & Ratings | Düşük | ⏳ Planlandı |
| Multi-language support | Düşük | ⏳ Planlandı |

---

## 📄 Proje Durumu

| Metrik | Değer |
|--------|-------|
| **Durum** | ✅ MVP Tamamlandı |
| **Son Güncelleme** | 2025-12-16 |
| **API Endpoints** | 35+ |
| **React Components** | 50+ |
| **Test Coverage** | Manuel test |

---

## 👨‍💻 Geliştirici

**Happy Coding! 🚀**
