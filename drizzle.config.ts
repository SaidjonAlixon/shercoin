import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const useSQLite = process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');
const dbPath = process.env.DATABASE_URL.replace('file:', '');

export default defineConfig({
  out: "./migrations",
  schema: useSQLite ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: useSQLite ? "sqlite" : "postgresql",
  dbCredentials: useSQLite 
    ? { url: dbPath }
    : { url: process.env.DATABASE_URL },
});
