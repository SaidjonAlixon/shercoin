# Telegram Bot Webhook Sozlash (Vercel uchun)

## 1. Webhook Endpoint

Bot webhook endpoint: `https://shercoin.vercel.app/api/bot`

## 2. Webhook'ni Sozlash

### Variant 1: Telegram Bot API orqali

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://shercoin.vercel.app/api/bot"}'
```

### Variant 2: Browser orqali

Quyidagi URL'ni browser'da oching (YOUR_BOT_TOKEN o'rniga bot token'ni qo'ying):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://shercoin.vercel.app/api/bot
```

### Variant 3: Node.js script orqali

```javascript
const https = require('https');

const botToken = 'YOUR_BOT_TOKEN';
const webhookUrl = 'https://shercoin.vercel.app/api/bot';

const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});
```

## 3. Webhook'ni Tekshirish

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## 4. Webhook'ni O'chirish (Polling uchun)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

## 5. Environment Variables

Vercel'da quyidagi environment variables qo'shing:

- `TELEGRAM_BOT_TOKEN` - Bot token
- `WEBAPP_URL` - WebApp URL (masalan: `https://shercoin.vercel.app`)

## 6. Test Qilish

1. Webhook'ni sozlash
2. Bot'ga `/start` yuborish
3. "🎮 O'yinni boshlash" tugmasini bosing
4. WebApp ochilishi kerak

## Muammo Hal Qilish

### Webhook ishlamayapti:
- ✅ `TELEGRAM_BOT_TOKEN` to'g'ri qo'shilganmi?
- ✅ Webhook URL to'g'rimi?
- ✅ Vercel deploy qilinganmi?
- ✅ Bot endpoint ishlayaptimi? (`https://shercoin.vercel.app/api/bot`)

### Webhook xatosi:
- Vercel function loglarini tekshiring
- Webhook URL'ni tekshiring: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

