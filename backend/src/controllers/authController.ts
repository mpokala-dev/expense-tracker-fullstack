import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

// Controllers receive req/res, call the appropriate service method,
// and format the HTTP response. No business logic lives here.

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_EMAIL") {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    next(error);
  }
}
