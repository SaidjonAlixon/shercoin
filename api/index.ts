// Vercel serverless function uchun
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!routesInitialized) {
    // Vercel uchun Server kerak emas, faqat routes qo'shamiz
    // registerRoutes Server qaytaradi, lekin biz uni ishlatmaymiz
    const server = await registerRoutes(app);
    // Server ni ishlatmaymiz, chunki Vercel o'zi request'larni handle qiladi
    routesInitialized = true;
  }

  return app(req as any, res as any);
}

