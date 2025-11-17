// Telegram Bot - WebApp'ni ochish uchun
import { Telegraf, Markup } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
// Vercel URL yoki boshqa WebApp URL
const webAppUrl = process.env.WEBAPP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-vercel-url.vercel.app');

if (!botToken) {
  console.error('⚠️  TELEGRAM_BOT_TOKEN environment variable topilmadi!');
  console.error('Bot ishlamaydi. Bot token qo\'shing:');
  console.error('1. @BotFather ga kiring');
  console.error('2. /newbot yozing');
  console.error('3. Token ni .env faylga qo\'shing: TELEGRAM_BOT_TOKEN=...');
  process.exit(1);
}

const bot = new Telegraf(botToken);

// /start komandasi
bot.command('start', async (ctx) => {
  try {
    const commandText = ctx.message.text || '';
    const parts = commandText.split(' ');
    const startParam = parts.length > 1 ? parts[1] : null; // /start 123456789
    
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

// Botni ishga tushirish
bot.launch().then(() => {
  console.log('✅ Telegram bot ishga tushdi!');
  console.log(`🌐 WebApp URL: ${webAppUrl}`);
  console.log(`🤖 Bot username: @${bot.botInfo?.username || 'unknown'}`);
}).catch((error) => {
  console.error('❌ Bot xatosi:', error);
  process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('\n🛑 Bot to\'xtatilmoqda...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log('\n🛑 Bot to\'xtatilmoqda...');
  bot.stop('SIGTERM');
});
