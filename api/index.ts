import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { initializeDb } from '../server/db';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;
let initPromise: Promise<void> | null = null;

async function initialize() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await initializeDb();
    await registerRoutes(app);
    
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (res.headersSent) return next(err);
      res.status(err.status || 500).json({ error: err.message || "Server xatosi" });
    });
    
    initialized = true;
  })();

  return initPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initialize();
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) res.status(504).json({ error: "Timeout" });
        resolve();
      }, 25000);
      
      app(req as any, res as any, () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "Server xatosi" });
    }
  }
}

