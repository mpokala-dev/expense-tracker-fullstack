import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

// Centralised error handler — registered LAST in Express middleware chain.
// Any route that calls next(error) or throws (with async wrappers) ends up here.
// Keeps error formatting consistent across all endpoints.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values((err as any).errors).map((e: any) => e.message),
    });
    return;
  }

  // Mongoose duplicate key (e.g. email already exists)
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: "A record with that value already exists",
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: config.nodeEnv === "production" ? "Internal server error" : err.message,
  });
}
