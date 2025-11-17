// Development uchun SQLite, production uchun Neon
let db: any = null;
let pool: any = null;
let dbInitialized = false;
let dbInitPromise: Promise<{ db: any; pool: any }> | null = null;

async function initializeDb() {
  if (dbInitialized && db) {
    return { db, pool };
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = (async () => {
    try {
      const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');

      if (useSQLite) {
        const Database = (await import('better-sqlite3')).default;
        const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './shercoin.db';
        const sqlite = new Database(dbPath);
        sqlite.pragma('journal_mode = WAL');
        const { drizzle } = await import('drizzle-orm/better-sqlite3');
        const schema = await import('@shared/schema-sqlite');
        db = drizzle(sqlite, { schema });
      } else {
        if (!process.env.DATABASE_URL) {
          throw new Error('DATABASE_URL topilmadi');
        }
        
        const { Pool, neonConfig } = await import('@neondatabase/serverless');
        const ws = await import("ws");
        const { drizzle } = await import('drizzle-orm/neon-serverless');
        const schema = await import('@shared/schema');

        neonConfig.webSocketConstructor = ws.default;
        neonConfig.fetchConnectionCache = true;

        pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          max: 1
        });
        db = drizzle({ client: pool, schema });
      }

      dbInitialized = true;
      return { db, pool };
    } catch (error: any) {
      dbInitialized = false;
      dbInitPromise = null;
      console.error('Database init error:', error?.message || error);
      throw error;
    }
  })();

  return dbInitPromise;
}

// Lazy initialization - birinchi marta chaqirilganda initialize qiladi
async function getDb() {
  if (!dbInitialized) {
    await initializeDb();
  }
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}

// db ni getter orqali export qilamiz - bu har safar getDb() ni chaqiradi
// Lekin bu sync bo'lishi kerak, shuning uchun db ni to'g'ridan-to'g'ri export qilamiz
// va foydalanuvchilar initializeDb() ni avval chaqirishlari kerak

export { getDb, pool, initializeDb };

// db ni export qilamiz - lekin u faqat initializeDb() chaqirilgandan keyin to'ldiriladi
// Eslatma: db ni ishlatishdan oldin initializeDb() ni chaqirish kerak
export { db };
