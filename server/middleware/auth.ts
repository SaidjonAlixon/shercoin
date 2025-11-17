import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

export function getUserId(req: Request): number | null {
  const userIdHeader = req.headers['x-user-id'];
  if (userIdHeader) {
    const userId = parseInt(String(userIdHeader), 10);
    if (!isNaN(userId)) return userId;
  }
  return null;
}
