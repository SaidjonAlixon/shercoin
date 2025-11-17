# Vercel'ga Deploy Qilish

## Qadamlar:

1. **GitHub'ga push qiling:**
   ```bash
   git add .
   git commit -m "Vercel uchun sozlandi"
   git push origin main
   ```

2. **Vercel'da loyihani yarating:**
   - [Vercel Dashboard](https://vercel.com/dashboard) ga kiring
   - "Add New Project" ni bosing
   - GitHub repository ni tanlang
   - Import qiling

3. **Environment Variables qo'shing:**
   Vercel Dashboard > Settings > Environment Variables da quyidagilarni qo'shing:

   - `DATABASE_URL` - PostgreSQL database connection string (Neon yoki boshqa PostgreSQL)
   - `TELEGRAM_BOT_TOKEN` - Telegram bot token (agar kerak bo'lsa)
   - `SESSION_SECRET` - Session secret key (random string)
   - `NODE_ENV` - `production`

4. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

5. **Deploy qiling:**
   - "Deploy" tugmasini bosing
   - Build jarayoni tugagach, loyiha ishga tushadi

## Muhim eslatmalar:

- Vercel serverless functions ishlatadi, shuning uchun `api/index.ts` fayli mavjud
- Database uchun Neon PostgreSQL yoki boshqa PostgreSQL ishlatish kerak (SQLite Vercel'da ishlamaydi)
- Session storage uchun MemoryStore ishlatiladi (production uchun Redis yoki boshqa persistent storage tavsiya etiladi)

## Database sozlash:

1. [Neon](https://neon.tech) da bepul PostgreSQL database yarating
2. Connection string ni oling
3. Vercel'da `DATABASE_URL` environment variable sifatida qo'shing
4. Database strukturasini yaratish uchun:
   ```bash
   npm run db:push
   ```
5. Dastlabki ma'lumotlarni yuklash uchun:
   ```bash
   npm run seed
   ```

