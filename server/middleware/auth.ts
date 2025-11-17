import { Request, Response, NextFunction } from "express";

// Session middleware olib tashlandi, userId header'dan o'qiladi
declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.userId = userId;
  next();
}

export function getUserId(req: Request): number | null {
  // Header'dan userId o'qamiz
  const userIdHeader = req.headers['x-user-id'];
  if (userIdHeader) {
    const userId = parseInt(String(userIdHeader), 10);
    if (!isNaN(userId)) {
      return userId;
    }
  }
  return null;
}
