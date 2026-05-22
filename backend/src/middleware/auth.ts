import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import type { AuthRequest, JwtPayload } from "../types/index";

// Middleware applied to any route that requires authentication.
// Reads the Bearer token from the Authorization header,
// verifies its signature, and attaches the userId to req.
// If verification fails, responds 401 — the route handler never runs.
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
