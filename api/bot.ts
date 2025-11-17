// Vercel serverless function uchun Telegram Bot Webhook
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf, Markup } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'https://shercoin.vercel.app';

if (!botToken) {
  console.error('⚠️  TELEGRAM_BOT_TOKEN environment variable topilmadi!');
}

// Bot instance yaratamiz (agar token bo'lsa)
const bot = botToken ? new Telegraf(botToken) : null;

// /start komandasi
if (bot) {
  bot.command('start', async (ctx) => {
    try {
      const commandText = ctx.message.text || '';
      const parts = commandText.split(' ');
      const startParam = parts.length > 1 ? parts[1] : null;
      
      const userId = ctx.from.id;
      const firstName = ctx.from.first_name || 'Foydalanuvchi';
      
      // WebApp URL - agar startParam bo'lsa, referrer ID sifatida qo'shamiz
      const webAppUrlWithParam = startParam 
        ? `${webAppUrl}?start=${startParam}` 
        : webAppUrl;
      
      // WebApp tugmasi
      const webAppButton = Markup.button.webApp('🎮 O\'yinni boshlash', webAppUrlWithParam);
      
      await ctx.reply(
        `👋 Salom, ${firstName}!\n\n` +
        `🎯 *SherCoin* - Bosib daromad qiling!\n\n` +
        `💰 Tangani bosib SherCoin yig'ing\n` +
        `🎁 Kunlik bonuslar va topshiriqlar\n` +
        `👥 Do'stlaringizni taklif qiling\n` +
        `📚 SherMaktab'da o'qing va bonus oling\n\n` +
        `Quyidagi tugmani bosing va o'yinni boshlang! 👇`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[webAppButton]]
          }
        }
      );
      
      console.log(`✅ /start komandasi: userId=${userId}, startParam=${startParam}`);
    } catch (error: any) {
      console.error('❌ /start xatosi:', error);
      await ctx.reply('❌ Xato yuz berdi. Iltimos qayta urinib ko\'ring.');
    }
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
}

// Webhook handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // GET request - webhook info yoki test
    if (req.method === 'GET') {
      return res.status(200).json({ 
        ok: true, 
        message: 'Telegram Bot Webhook endpoint is ready',
        botConfigured: !!bot 
      });
    }

    // POST request - Telegram webhook
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!bot) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Request body'ni tekshiramiz
    const update = req.body;
    
    if (!update || typeof update !== 'object') {
      console.error('❌ Invalid update body:', update);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Telegram webhook request'ni handle qilamiz
    await bot.handleUpdate(update);
    
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      body: req.body
    });
    return res.status(500).json({ error: 'Webhook error', message: error?.message });
  }
}

