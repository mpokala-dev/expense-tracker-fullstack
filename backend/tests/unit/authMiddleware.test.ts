import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import { authenticate } from "../../src/middleware/auth";
import type { AuthRequest } from "../../src/types/index";
import jwt from "jsonwebtoken";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

const next = vi.fn() as NextFunction;

// Sign a real token for testing — uses the test JWT_SECRET from setup.ts
function makeToken(payload = { userId: "user-123", email: "test@test.com" }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

describe("authenticate middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() and attaches userId when token is valid", () => {
    const token = makeToken();
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe("user-123");
  });

  it("returns 401 when no Authorization header", () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header is not Bearer", () => {
    const req = {
      headers: { authorization: "Basic sometoken" },
    } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    const req = {
      headers: { authorization: "Bearer invalid-token" },
    } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is expired", () => {
    const token = jwt.sign(
      { userId: "user-123", email: "test@test.com" },
      process.env.JWT_SECRET!,
      { expiresIn: -1 } // already expired
    );
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
