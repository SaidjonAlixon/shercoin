// Development uchun SQLite, production uchun Neon
const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');

let db: any;
let pool: any = null;

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
} else {
  // Neon PostgreSQL uchun
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const ws = await import("ws");
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const schema = await import('@shared/schema');

  neonConfig.webSocketConstructor = ws.default;

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db, pool };
