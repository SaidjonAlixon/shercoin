// Vercel serverless function uchun Telegram Bot Webhook
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf, Markup } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'https://shercoin.vercel.app';

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN topilmadi!');
}

const bot = new Telegraf(botToken);

// /start komandasi
bot.command('start', async (ctx) => {
  const parts = ctx.message.text?.split(' ') || [];
  const startParam = parts[1] || null;
  const webAppUrlWithParam = startParam ? `${webAppUrl}?start=${startParam}` : webAppUrl;
  
  await ctx.reply(
    `👋 Salom, ${ctx.from.first_name || 'Foydalanuvchi'}!\n\n` +
    `🎯 *SherCoin* - Bosib daromad qiling!\n\n` +
    `💰 Tangani bosib SherCoin yig'ing\n` +
    `🎁 Kunlik bonuslar va topshiriqlar\n` +
    `👥 Do'stlaringizni taklif qiling\n` +
    `📚 SherMaktab'da o'qing va bonus oling\n\n` +
    `Quyidagi tugmani bosing va o'yinni boshlang! 👇`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[Markup.button.webApp('🎮 O\'yinni boshlash', webAppUrlWithParam)]]
      }
    }
  );
});

// /help komandasi
bot.command('help', async (ctx) => {
  await ctx.reply(
    `📖 *SherCoin Bot - Yordam*\n\n` +
    `🎮 /start - O'yinni boshlash\n` +
    `📊 /stats - Statistika (tez orada)\n` +
    `👥 /referral - Referal link (tez orada)\n\n` +
    `Savollar uchun: @support`,
    { parse_mode: 'Markdown' }
  );
});

// Webhook handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Telegram Bot Webhook ready' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error?.message || 'Webhook error' });
  }
}

