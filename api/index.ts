// Vercel serverless function uchun
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { initializeDb } from '../server/db';
import { registerRoutes } from '../server/routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let routesInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function initialize() {
  if (routesInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      // Database'ni initialize qilamiz
      try {
        await Promise.race([
          initializeDb(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 10000)
          )
        ]);
      } catch (dbError: any) {
        console.error('Database init failed:', dbError?.message);
        // Database xatosi bo'lsa ham, routes'ni qo'shamiz (ba'zi endpoint'lar ishlashi mumkin)
      }

      await registerRoutes(app);
      
      app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (res.headersSent) return next(err);
        const status = err.status || err.statusCode || 500;
        res.status(status).json({ 
          error: "Internal Server Error",
          message: err.message || "Server xatosi"
        });
      });
      
      routesInitialized = true;
    } catch (error: any) {
      routesInitialized = false;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initialize();
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "Gateway Timeout" });
        }
        resolve();
      }, 25000);
      
      app(req as any, res as any, () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Internal Server Error",
        message: error?.message || "Server xatosi yuz berdi"
      });
    }
  }
}

