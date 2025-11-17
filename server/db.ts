// Development uchun SQLite, production uchun Neon
let db: any = null;
let pool: any = null;
let dbInitialized = false;

async function initializeDb() {
  if (dbInitialized) {
    return { db, pool };
  }

  try {
    const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');

    if (useSQLite) {
      // SQLite uchun
      const Database = (await import('better-sqlite3')).default;
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './shercoin.db';
      const sqlite = new Database(dbPath);
      // SQLite uchun WAL mode yoqamiz (Write-Ahead Logging) - bu concurrent read/write uchun yaxshi
      sqlite.pragma('journal_mode = WAL');
      const { drizzle } = await import('drizzle-orm/better-sqlite3');
      const schema = await import('@shared/schema-sqlite');
      db = drizzle(sqlite, { schema });
      console.log('✅ SQLite database initialized');
    } else {
      // Neon PostgreSQL uchun
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable topilmadi!');
      }
      const { Pool, neonConfig } = await import('@neondatabase/serverless');
      const ws = await import("ws");
      const { drizzle } = await import('drizzle-orm/neon-serverless');
      const schema = await import('@shared/schema');

      neonConfig.webSocketConstructor = ws.default;

      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool, schema });
      console.log('✅ PostgreSQL database initialized');
    }

    dbInitialized = true;
    return { db, pool };
  } catch (error: any) {
    console.error('❌ Database initialization error:', error);
    throw new Error(`Database connection failed: ${error?.message || 'Unknown error'}`);
  }
}

// Lazy initialization - birinchi marta chaqirilganda initialize qiladi
async function getDb() {
  if (!dbInitialized) {
    await initializeDb();
  }
  return db;
}

// Backward compatibility - db ni ham export qilamiz
// Lekin u async bo'lgani uchun, avval initializeDb() ni chaqirish kerak
export { getDb, pool, initializeDb };

// db ni proxy orqali export qilamiz - bu ishlamaydi, shuning uchun getDb() ishlatamiz
// Lekin backward compatibility uchun, db ni ham export qilamiz
// Eslatma: db ni to'g'ridan-to'g'ri ishlatishdan oldin initializeDb() ni chaqirish kerak
export { db };
