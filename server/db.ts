let db: any = null;
let pool: any = null;
let initPromise: Promise<{ db: any; pool: any }> | null = null;

async function initializeDb() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
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

    return { db, pool };
  })();

  return initPromise;
}

async function getDb() {
  await initializeDb();
  return db;
}

export { getDb, pool, initializeDb, db };
