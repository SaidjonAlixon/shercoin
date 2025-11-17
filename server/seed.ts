import { db } from "./db";

// SQLite yoki PostgreSQL uchun mos schema import
const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');
const schemaModule = useSQLite 
  ? await import('@shared/schema-sqlite')
  : await import('@shared/schema');

const { boosts, tasks, articles, promoCodes } = schemaModule;

async function seed() {
  console.log("Seeding database...");

  await db.insert(boosts).values([
    {
      code: "DOUBLE_TAP",
      name: "SherKuch",
      description: "30 daqiqa 2x bosish",
      durationSeconds: 1800,
      price: 5000,
    },
    {
      code: "UNLIMITED_ENERGY",
      name: "Cheksiz energiya",
      description: "10 daqiqa energiya cheklanmaydi",
      durationSeconds: 600,
      price: 3000,
    },
    {
      code: "DOUBLE_HOURLY",
      name: "Soatlik 2x",
      description: "1 soat passiv daromad ikki baravar",
      durationSeconds: 3600,
      price: 7000,
    },
    {
      code: "AUTO_TAP",
      name: "AvtoTap",
      description: "5 daqiqa avto bosish",
      durationSeconds: 300,
      price: 10000,
    },
  ]).onConflictDoNothing();

  await db.insert(tasks).values([
    {
      type: "daily",
      title: "1000 marta bos",
      description: "Bugun 1000 marta SherCoin bosing",
      reward: 500,
      isActive: true,
    },
    {
      type: "once",
      title: "Telegram kanalga a'zo bo'ling",
      description: "SherCoin yangiliklar kanaliga qo'shiling",
      reward: 1000,
      link: "https://t.me/shercoin",
      isActive: true,
    },
    {
      type: "once",
      title: "3 ta do'st chaqiring",
      description: "Kamida 3 ta do'stingizni taklif qiling",
      reward: 2000,
      isActive: true,
    },
    {
      type: "special",
      title: "5000 SherCoin to'plang",
      description: "Jami balansingizni 5000 ga yetkazing",
      reward: 500,
      isActive: true,
    },
    {
      type: "daily",
      title: "Bir maqola o'qing",
      description: "SherMaktabdan bitta maqola o'qib tugatish",
      reward: 300,
      isActive: true,
    },
  ]).onConflictDoNothing();

  await db.insert(articles).values([
    {
      title: "Onlayn marketing asoslari",
      content: `
        <h2>Onlayn Marketing nima?</h2>
        <p>Onlayn marketing - bu internetda mahsulot va xizmatlarni targ'ib qilish san'ati. Bugungi kunda har qanday biznes uchun onlayn mavjudlik juda muhim.</p>
        
        <h3>Asosiy yo'nalishlar:</h3>
        <ul>
          <li><strong>SMM (Social Media Marketing)</strong> - ijtimoiy tarmoqlarda faollik</li>
          <li><strong>SEO</strong> - qidiruv tizimlarida ko'rinish</li>
          <li><strong>Content Marketing</strong> - foydali kontent yaratish</li>
          <li><strong>Email Marketing</strong> - elektron pochta orqali aloqa</li>
        </ul>
        
        <h3>Muvaffaqiyat uchun maslahatlar:</h3>
        <p>1. Maqsadli auditoriyangizni aniqlang</p>
        <p>2. Muntazam kontent yarating</p>
        <p>3. Natijalarni tahlil qiling</p>
        <p>4. Mijozlar bilan aloqada bo'ling</p>
        
        <p>Onlayn marketing - bu uzluksiz jarayon. Sabr va izchillik muvaffaqiyat kaliti!</p>
      `,
      reward: 50,
      isActive: true,
    },
    {
      title: "Telegram bot orqali biznes",
      content: `
        <h2>Telegram botlar - biznes uchun kuchli vosita</h2>
        <p>Telegram botlari mijozlar bilan avtomatik muloqot qilish, buyurtmalarni qabul qilish va xizmat ko'rsatish uchun mukammal vositadir.</p>
        
        <h3>Telegram botning afzalliklari:</h3>
        <ul>
          <li>24/7 avtomatik ishlash</li>
          <li>Tez va qulay mijozlar aloqasi</li>
          <li>To'lov tizimlarini integratsiya</li>
          <li>Ma'lumotlar bazasini boshqarish</li>
          <li>Marketing kampaniyalari uchun kanal</li>
        </ul>
        
        <h3>Botdan qanday foydalanish mumkin:</h3>
        <p><strong>E-commerce:</strong> Mahsulot katalogi, buyurtma berish, to'lov qabul qilish</p>
        <p><strong>Xizmatlar:</strong> Navbat boshqarish, konsultatsiya, eslatmalar</p>
        <p><strong>Ta'lim:</strong> Kurslar, testlar, sertifikatlar</p>
        
        <p>Telegram bot yaratish uchun dasturlash bilimi talab etiladi, lekin natija bunga arziydi!</p>
      `,
      reward: 50,
      isActive: true,
    },
    {
      title: "Kiberxavfsizlik 10 qoidasi",
      content: `
        <h2>Internetda xavfsiz bo'lish qoidalari</h2>
        <p>Raqamli dunyoda shaxsiy ma'lumotlaringizni himoya qilish juda muhim. Quyida asosiy qoidalar bilan tanishing:</p>
        
        <h3>10 ta oltin qoida:</h3>
        <ol>
          <li><strong>Kuchli parollar ishlating</strong> - kamida 12 belgi, harflar, raqamlar va belgilar aralashmasi</li>
          <li><strong>Ikki bosqichli autentifikatsiya</strong> - barcha muhim akkauntlarda yoqing</li>
          <li><strong>Shubhali havolalarga bosmang</strong> - phishing hujumlaridan ehtiyot bo'ling</li>
          <li><strong>Dasturiy ta'minotni yangilang</strong> - tizimli ravishda barcha dasturlarni update qiling</li>
          <li><strong>Antivirus ishlating</strong> - kompyuteringizni himoya qiling</li>
          <li><strong>Ochiq Wi-Fi dan ehtiyot bo'ling</strong> - bank operatsiyalarini umumiy tarmoqda bajarmang</li>
          <li><strong>Ma'lumotlarni zaxiralang</strong> - muhim fayllarning nusxasini saqlang</li>
          <li><strong>Shaxsiy ma'lumotlarni tejang</strong> - ijtimoiy tarmoqlarda haddan oshirma ulashing</li>
          <li><strong>VPN ishlating</strong> - maxfiylikni oshirish uchun</li>
          <li><strong>Bilim oling</strong> - yangi xavflar haqida xabardor bo'ling</li>
        </ol>
        
        <p>Esda tuting: xavfsizlik - bu bir martalik emas, doimiy jarayondir!</p>
      `,
      reward: 50,
      isActive: true,
    },
  ]).onConflictDoNothing();

  await db.insert(promoCodes).values([
    {
      code: "SHERCOIN2024",
      reward: 1000,
      maxUsage: 1000,
      isActive: true,
    },
    {
      code: "WELCOME500",
      reward: 500,
      maxUsage: 5000,
      isActive: true,
    },
  ]).onConflictDoNothing();

  console.log("Seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
