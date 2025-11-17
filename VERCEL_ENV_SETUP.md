# Vercel Environment Variables - Qo'llanma

## Vercel Dashboard'da Environment Variables qo'shish:

1. **Vercel Dashboard'ga kiring:**
   - https://vercel.com/dashboard
   - Loyihangizni tanlang

2. **Settings ga kiring:**
   - Loyiha nomiga bosing
   - "Settings" tab'ini tanlang
   - "Environment Variables" bo'limini tanlang

3. **Quyidagi environment variables qo'shing:**

## MAJBURIY Environment Variables:

### 1. DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** PostgreSQL connection string
- **Misol:** `postgresql://user:password@host:port/database`
- **Qayerdan olish:** 
  - [Neon.tech](https://neon.tech) - bepul PostgreSQL
  - Yoki boshqa PostgreSQL provider
- **Qaysi environment:** Production, Preview, Development (hammasiga)

### 2. SESSION_SECRET
- **Key:** `SESSION_SECRET`
- **Value:** Kuchli random string (kamida 32 belgi)
- **Misol:** `shercoin-secret-2024-very-strong-random-key-12345`
- **Yaratish:** 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Qaysi environment:** Production, Preview, Development (hammasiga)

### 3. NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Qaysi environment:** Production, Preview, Development (hammasiga)

## Ixtiyoriy Environment Variables:

### 4. TELEGRAM_BOT_TOKEN
- **Key:** `TELEGRAM_BOT_TOKEN`
- **Value:** Telegram bot token (@BotFather dan oling)
- **Qaysi environment:** Production (faqat)

### 5. ALLOW_DEV_AUTH (Test uchun)
- **Key:** `ALLOW_DEV_AUTH`
- **Value:** `true`
- **Tavsif:** Telegram WebApp bo'lmasa ham test qilish uchun
- **Qaysi environment:** Production, Preview (test uchun)

## Qadam-baqadam:

1. Vercel Dashboard > Loyiha > Settings > Environment Variables
2. "Add New" tugmasini bosing
3. Key va Value ni kiriting
4. Environment'ni tanlang (Production/Preview/Development)
5. "Save" tugmasini bosing
6. **Muhim:** Har bir o'zgarishdan keyin "Redeploy" qiling!

## Database yaratish (Neon.tech):

1. https://neon.tech ga kiring
2. "Sign Up" yoki "Log In" qiling
3. "Create Project" ni bosing
4. Project nomini kiriting
5. "Create" ni bosing
6. "Connection Details" dan connection string ni oling
7. Connection string format:
   ```
   postgresql://username:password@host.neon.tech/database?sslmode=require
   ```
8. Bu string ni Vercel'da `DATABASE_URL` sifatida qo'shing

## Database strukturasini yaratish:

Database yaratilgandan keyin, local'da quyidagi buyruqlarni bajaring:

```bash
# .env faylga DATABASE_URL qo'shing
DATABASE_URL=postgresql://user:password@host/database

# Database strukturasini yaratish
npm run db:push

# Dastlabki ma'lumotlarni yuklash
npm run seed
```

Yoki Vercel'da build qilganda avtomatik yaratilishi uchun build script'ga qo'shing.

## Tekshirish:

Environment variables qo'shilgandan keyin:
1. "Redeploy" tugmasini bosing
2. Build loglarini tekshiring
3. Saytni ochib, ishlashini tekshiring

