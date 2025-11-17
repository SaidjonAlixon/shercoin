// Vercel serverless function uchun
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { initializeDb } from '../server/db';
import { registerRoutes } from '../server/routes';

const app = express();

app.use(express.json({
  verify: (req: any, _res: any, buf: any) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Session middleware - Vercel uchun memory store ishlatamiz
const MemoryStoreSession = MemoryStore(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'shercoin-secret-prod-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // 24 soat
    }),
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none' as const,
    },
  })
);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Routes ni sozlash
let routesInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function initialize() {
  if (routesInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("Initializing database...");
      await initializeDb();
      console.log("Database initialized successfully");

      console.log("Initializing routes...");
      // Vercel uchun Server kerak emas, faqat routes qo'shamiz
      // registerRoutes Server qaytaradi, lekin biz uni ishlatmaymiz
      await registerRoutes(app);
      // Server ni ishlatmaymiz, chunki Vercel o'zi request'larni handle qiladi
      routesInitialized = true;
      console.log("Routes initialized successfully");
    } catch (error: any) {
      console.error("Initialization error:", error);
      throw error;
    }
  })();

  return initializationPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Database va routes ni initialize qilamiz
    await initialize();

    return app(req as any, res as any);
  } catch (error: any) {
    console.error("Handler error:", error);
    console.error("Error stack:", error?.stack);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error?.message || "Server xatosi yuz berdi",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}

