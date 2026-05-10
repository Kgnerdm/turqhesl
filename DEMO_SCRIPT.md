# TurqHeal — Demo Script

Sunum akışı — hangi sırada ne tıklanacak, hangi cümleler söylenecek.
**Toplam süre:** ~12-15 dakika.

---

## 0. Setup (sunum öncesi 5 dakika)

```bash
# Servisler
brew services start postgresql@16
brew services start redis

# Backend (Terminal 1)
cd backend && source venv/bin/activate
python manage.py runserver

# Celery (Terminal 2) — burayı jüriye göstereceksin
cd backend && source venv/bin/activate
celery -A config worker -l info

# Customer frontend (Terminal 3)
cd frontend/apps/customer && npm run dev   # :3001

# Admin frontend (Terminal 4)
cd frontend/apps/admin && npm run dev   # :3000
```

**Ekran düzeni:**
- Sol monitör: tarayıcı (sunum)
- Sağ monitör: Celery worker terminali (email görmek için)

**Tarayıcı sekmeleri (önceden aç):**
1. http://localhost:3001 (customer)
2. http://localhost:3000 (admin)
3. http://localhost:8000/api/docs/ (Swagger)
4. https://github.com/.../turqheal (kod)

---

## 1. Açılış (1 dk)

> "TurqHeal, Türkiye sağlık turizmi pazarındaki bilgi asimetri sorununu çözen
> bir B2C/B2B marketplace. İki dönem boyunca geliştirdik — ilk dönem MVP'yi,
> ikinci dönemde production-ready hale getirdik."

**Söyle:**
- Problem: Türkiye top 5 medikal turizm destinasyonu ama merkezi platform yok
- Çözüm: doğrulanmış sağlayıcılar + şeffaf paket katalogu + ödeme + güvenli doc paylaşımı

**Dokunma:** Sadece konuş, ekran açıkken HomePage gözüksün.

---

## 2. Customer App — Hero ve Smart Match (2 dk)

**http://localhost:3001/**

> "Buradan başlıyoruz. Animasyonlu hero, gerçek zamanlı istatistikler — şu
> an veritabanından geliyor."

- **Sayaçların** 0'dan büyüdüğüne dikkat çek
- Aşağı kaydır → **AI Smart Match** section
- Sample query'lerden birine tıkla:
  - **"I need dental implants in Istanbul"** ← tıkla
- Smart Match butonuna bas
- **3 paket** önerisi gelir, kart 1-2-3 numaralı

> "Burada hasta semptomunu/ihtiyacını doğal dilde yazıyor. Llama 3.3 70B
> ile aktif paket katalogundan en uygun 3'ü seçiyor. API key yoksa lokal
> keyword matcher fallback'e düşüyor — synonym expansion var, 'teeth'
> yazınca dental kategorisini buluyor."

**Vurgu:** "Hallucination guard" — AI'nın icat ettiği paket id'leri filtrelenir.

---

## 3. Paket detay + Booking + Ödeme (4 dk) — DEMONUN KALBI

Smart Match'ten gelen ilk paketin **"View"** butonuna tıkla.

**Paket detay sayfası:**
- Görsel galeri, fiyat, "What's included", provider info
- **"Book Now"** butonuna bas
- Patient login isteyebilir → `patient@test1.com` / `Test123!`

**Booking modal:**
- Tarih seç (1-2 hafta sonra)
- Kişisel bilgi (önceden dolu)
- **Confirm** bas

**Otomatik checkout sayfasına yönlenir.** Bu kısmı dramatize et:

> "Booking yarattığında otomatik olarak payment session açılıyor. Çünkü
> bizim sistemimizde ödeme abstraction katmanı var — şu an Mock provider
> ile demo yapıyoruz, production'da `PAYMENT_PROVIDER=stripe` env
> değişikliğiyle gerçek Stripe'a geçiyor, kod değişmeden."

**3 senaryolu test card panel** sağ tarafta. Sırasıyla:

### 3a. Success kartı
- "Try" tuşuna bas → autofill: `4242 4242 4242 4242`
- **"Pay $..."** butonu
- ✅ **Animasyonlu success** → 2.5sn sonra dashboard
- **Sağ monitöre dön** → Celery worker'da email çıktısı:
  ```
  Subject: Your booking with ... is confirmed
  ```
  > "Email Celery worker tarafından asenkron işlendi. Production'da
  > Brevo veya SendGrid ile gerçek email gönderiliyor — burada console
  > backend'i kullanıyoruz."

### 3b. Decline kartı (geri dön, retry)
- Yeni booking yap (veya dashboard'dan başka bir paket)
- Checkout'ta **"Try" → declined card** (`4000 0000 0000 0002`)
- ❌ Shake animation
- "Try another card" butonu

> "Payment lifecycle 8 state'i destekliyor: pending → processing → succeeded
> veya declined / insufficient_funds. Her durum için booking ayrı davranıyor —
> başarısız ödeme booking'i pending'de tutuyor, kullanıcı tekrar deneyebiliyor."

---

## 4. Provider tarafı (2 dk)

Logout → `test@test.com` / `Test123!` ile login (provider).

**Provider dashboard:**
- Stats kartları
- Sol menü → **"Bookings"** → biraz önce yarattığın booking
- Status update → "Confirmed" → email
- **Sağ monitör:** Celery email görsünler

**"Profile":**
- Logo / cover / gallery upload component
- Bir image sürükle-bırak → Cloudinary'ye gider
- Image küçük resim olarak yansır

> "Cloudinary entegrasyonu görsel optimization sağlıyor — `f_auto` ile
> WebP/AVIF otomatik, `q_auto` ile kalite ayarı. Tek upload sonrası farklı
> boyutlarda servis ediliyor URL parametreleriyle."

**"Packages"** → bir paketi düzenle → galeri kısmında upload göster.

---

## 5. Admin tarafı (2 dk)

**http://localhost:3000/** → `admin@turqheal.com` / `Admin123!`

- Dashboard (recharts grafikleri)
- **Providers** → "Pending verification" listesi
- Bir provider'ı **"Verify"** → email gönder
- Sağ monitöre dön: provider'a "Verified" email çıktısı

> "Admin verification flow tamamen entegre. Verify bastığım anda Celery
> task tetikleniyor, provider'a email gidiyor, audit trail için
> `verified_by` field'ı admin user'ı kaydediyor."

---

## 6. Teknik göster (2 dk)

Tarayıcı sekmesi → **Swagger** http://localhost:8000/api/docs/

> "47+ endpoint, otomatik OpenAPI 3.0 dokümantasyonu, Swagger UI ile
> jüri istediği endpoint'i interaktif test edebilir."

Endpoint'lerden 2-3 tanesini göster — özellikle:
- `/api/health/` (DB + Redis health)
- `/api/payments/initiate/` (payment flow)
- `/api/packages/smart-match/` (AI)

**Health endpoint'e tıkla, "Try it out", Execute** → 200 OK.

> "Production deployment için load balancer'ın hit edebileceği health
> endpoint var — DB ve Redis kontrolü yapıp 200 veya 503 dönüyor."

**Terminal'i göster:**
```bash
pytest --cov
```

> "171 otomatik test, %79.8 line coverage. GitHub Actions her PR'da
> bunu çalıştırıyor, %70'in altına düşerse merge engelleniyor."

(Test'leri çalıştırmaya gerek yok, sadece son rapor sonucunu gösterebilirsin.)

---

## 7. Kapanış (1 dk)

> "İki dönem boyunca yaptıklarımız özet: MVP'den production-ready'ye
> 8 PR ile geçtik. PostgreSQL, Cloudinary, Mock+Stripe-ready payment,
> Celery+Redis async email, pytest+CI, security audit + dependency
> patches + rate limiting + production hardening, AI Smart Match,
> ve modern UI."

> "Şu anda live deploy yapılmadı — bu future work. Ama tüm environment
> variable matrix'i hazır, abstraction'lar production swap'a uygun.
> Stripe'ı aktif etmek için `PAYMENT_PROVIDER=stripe` + 3 env değişkeni;
> Groq yerine OpenAI için tek metod yazımı."

> "Sorularınızı bekliyorum."

---

## 🚨 Olası Jüri Soruları + Hazır Cevaplar

| Soru | Cevap |
|------|-------|
| "Bu ödeme gerçek mi?" | "Hayır, MockPaymentProvider ile demo. Gerçek Stripe için KYC süreci gerekiyor — bitirme projesinde scope dışı. Ama abstraction Stripe'a hazır, env değişikliği yeter." |
| "AI gerçekten LLM mi?" | "Groq API key set edilirse Llama 3.3 70B çağırıyor. Şu an [API key var/yok] — yoksa local keyword matcher fallback'i çalışıyor, synonym expansion + scoring yapıyor. Aynı endpoint, transparent." |
| "Test coverage ne?" | "%79.8, plan hedefi %70'i 10 puan aşıyor. 171 test var." |
| "Güvenlik nasıl?" | "OWASP Top 10 mapping yaptık. Rate limiting (auth=20/dk, payment=30/dk), JWT blacklist, signed URLs medical doc'lar için (15dk TTL), pip-audit + bandit + npm audit temiz, production hardening (HSTS, secure cookies, X-Frame-Options) `if not DEBUG` block'unda." |
| "KVKK uyumlu mu?" | "Posture'umuz var: card data hiç sunucumuza girmiyor, medical doc'lar Cloudinary authenticated resource olarak signed URL ile erişilebiliyor, anti-enumeration password reset, no PII in logs. Privacy notice + ToS production deploy ile birlikte." |
| "Ödeme başarısız olursa?" | "3 senaryo destekleniyor: declined, insufficient_funds, generic fail. Booking pending kalıyor, kullanıcı 'Try another card' ile yeni payment yaratabiliyor. Idempotency: terminal payment tekrar process edilemez (409)." |
| "Hangi yapay zeka modeli?" | "Llama 3.3 70B versatile, Groq üzerinde. Free tier 14,400 req/gün, kart gerekmiyor. JSON-only response format ile prompt injection'a karşı dirençli." |
| "Live URL var mı?" | "Henüz deploy edilmedi — Railway + Vercel + Neon + Upstash stack'i hazır, env variable matrix'i raporda var. Future work olarak listeli." |
| "Mobil uyumlu mu?" | "Tailwind responsive, tüm breakpoint'lerde test edildi. PWA wrapper future work." |
| "Reviews neden yok?" | "Verified-only review flow planlandı (sadece booking tamamlananlar yazabilir) ama Sem 2 scope'u dışında bırakıldı. Database modeli + endpoint'leri Future Work'te." |

---

## Yedek Plan

**İnternet kesilirse:** Smart Match local fallback ile çalışıyor, panik yapma.

**Backend çökerse:** Terminal'den `manage.py runserver` tekrar çalıştır.

**Demo kartı çalışmazsa:** Test cards panel'inde 3 tanesi var, tek tek dene.

**Cloudinary upload başarısız olursa:** "Network restrictions, normalde
çalışıyor" de — kod gösterip storage.py'ı aç.

---

## Pre-Demo Checklist

- [ ] Postgres çalışıyor (`brew services list`)
- [ ] Redis çalışıyor
- [ ] Backend `:8000` (test: `curl localhost:8000/api/health/`)
- [ ] Celery worker — bir email task çalıştı mı kontrol
- [ ] Customer `:3001`
- [ ] Admin `:3000`
- [ ] `.env`'de `GROQ_API_KEY` set (varsa real AI)
- [ ] Tarayıcı 4 sekme önceden açık
- [ ] Sağ monitör Celery worker'a ayarlı
- [ ] Test user şifreleri çalışıyor (test edip emin ol)
- [ ] Yedek paket görselleri Cloudinary'de var
- [ ] Hard copy raporu yanında
