# Telegram Bot Sozlash

## 1. Bot Token Olish

1. Telegram'da [@BotFather](https://t.me/BotFather) ga kiring
2. `/newbot` yozing
3. Bot nomini kiriting (masalan: `SherCoin Bot`)
4. Bot username kiriting (masalan: `SherCoinBot`)
5. Bot token olasiz (masalan: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 2. Environment Variables

`.env` faylga qo'shing:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://your-vercel-url.vercel.app
```

**Yoki** Vercel'da environment variable sifatida:
- `TELEGRAM_BOT_TOKEN` - Bot token
- `WEBAPP_URL` - Vercel URL (masalan: `https://shercoin.vercel.app`)

## 3. Botni Ishga Tushirish

### Local Development:

```bash
npm run dev:bot
```

### Production (VPS yoki server):

Bot alohida serverda ishlashi kerak. Vercel'da bot ishlamaydi, chunki bot polling ishlatadi.

**Variant 1: VPS/Server'da ishga tushirish**

```bash
# PM2 yoki boshqa process manager ishlatish
npm install -g pm2
pm2 start npm --name "shercoin-bot" -- run dev:bot
pm2 save
pm2 startup
```

**Variant 2: Railway/Render kabi platformada**

1. `server/bot.ts` faylini alohida service sifatida deploy qiling
2. Environment variables qo'shing

## 4. Bot'ni Telegram'da Sozlash

1. [@BotFather](https://t.me/BotFather) ga kiring
2. `/mybots` yozing
3. Botingizni tanlang
4. "Bot Settings" > "Menu Button" > "Configure Menu Button"
5. WebApp URL ni kiriting: `https://your-vercel-url.vercel.app`
6. Button text: `🎮 O'yinni boshlash`

Bu orqali bot'ning pastki burchagida doimiy WebApp tugmasi paydo bo'ladi.

## 5. Test Qilish

1. Bot'ga kiring: `https://t.me/YourBotUsername`
2. `/start` yozing
3. "🎮 O'yinni boshlash" tugmasini bosing
4. WebApp ochilishi kerak

## 6. Referal Link

Foydalanuvchilar referal link yaratishlari mumkin:
```
https://t.me/YourBotUsername?start=123456789
```

Bu yerda `123456789` - referrer user ID.

## Muammo Hal Qilish

### Bot ishlamayapti:
- ✅ `TELEGRAM_BOT_TOKEN` to'g'ri qo'shilganmi?
- ✅ Internet ulanishi bormi?
- ✅ Bot token to'g'rimi? (BotFather'dan yangi token oling)

### WebApp ochilmayapti:
- ✅ `WEBAPP_URL` to'g'ri qo'shilganmi?
- ✅ Vercel'da loyiha deploy qilinganmi?
- ✅ URL HTTPS bilan boshlanadimi? (Telegram faqat HTTPS qo'llab-quvvatlaydi)

### Bot'ga /start yozganda javob bermayapti:
- ✅ Bot ishga tushganmi? (`npm run dev:bot`)
- ✅ Console'da xatolar bormi?
- ✅ Bot token to'g'rimi?

