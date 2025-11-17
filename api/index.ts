// Vercel serverless function uchun
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import session from 'express-session';
import { initializeDb } from '../server/db';
import { registerRoutes } from '../server/routes';

const app = express();

app.use(express.json({
  verify: (req: any, _res: any, buf: any) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Session middleware - Vercel uchun cookie-based session ishlatamiz
// MemoryStore serverless muhitda ishlamaydi, shuning uchun cookie-based qilamiz
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'shercoin-secret-prod-key',
    resave: false,
    saveUninitialized: false,
    // Store ni olib tashlaymiz - cookie-based session ishlatamiz
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
      sameSite: 'none' as const,
    },
  })
);

// Routes ni sozlash
let routesInitialized = false;
let initializationPromise: Promise<void> | null = null;
let errorHandlerRegistered = false;

async function initialize() {
  if (routesInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("🔧 Step 1: Initializing database...");
      console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
      console.log("DATABASE_URL type:", process.env.DATABASE_URL?.substring(0, 20) || 'not set');
      
      await initializeDb();
      console.log("✅ Database initialized successfully");

      console.log("🔧 Step 2: Initializing routes...");
      // Vercel uchun Server kerak emas, faqat routes qo'shamiz
      // registerRoutes Server qaytaradi, lekin Vercel'da null qaytaradi
      const server = await registerRoutes(app);
      console.log("Server returned:", server ? "Server created" : "No server (Vercel mode)");
      
      // Error handler middleware - routes dan keyin qo'yamiz (faqat bir marta)
      if (!errorHandlerRegistered) {
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
          console.error("❌ Express error handler:", err);
          console.error("Error stack:", err?.stack);
          
          if (res.headersSent) {
            return next(err);
          }
          
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          res.status(status).json({ 
            error: "Internal Server Error",
            message: message,
            details: process.env.NODE_ENV === 'development' ? err?.stack : undefined
          });
        });
        errorHandlerRegistered = true;
      }
      
      // Server ni ishlatmaymiz, chunki Vercel o'zi request'larni handle qiladi
      routesInitialized = true;
      console.log("✅ Routes initialized successfully");
    } catch (error: any) {
      console.error("❌ Initialization error:", error);
      console.error("Initialization error name:", error?.name);
      console.error("Initialization error message:", error?.message);
      console.error("Initialization error stack:", error?.stack);
      routesInitialized = false; // Reset flag so we can retry
      initializationPromise = null; // Reset promise so we can retry
      throw error;
    }
  })();

  return initializationPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[${req.method}] ${req.url} - Request received`);
    
    // Database va routes ni initialize qilamiz
    try {
      await initialize();
    } catch (initError: any) {
      console.error("❌ Initialization failed:", initError);
      console.error("Initialization error stack:", initError?.stack);
      return res.status(500).json({ 
        error: "Initialization Error",
        message: initError?.message || "Server initialization failed",
        details: process.env.NODE_ENV === 'development' ? initError?.stack : undefined
      });
    }

    // Express app ni ishlatamiz - Vercel uchun
    app(req as any, res as any);
  } catch (error: any) {
    console.error("❌ Handler error:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    
    // Agar response yuborilmagan bo'lsa, yuboramiz
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Internal Server Error",
        message: error?.message || "Server xatosi yuz berdi",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  }
}

