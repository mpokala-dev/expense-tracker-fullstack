import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import * as authController from "../../src/controllers/authController";

vi.mock("../../src/services/authService", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
}));

import * as authService from "../../src/services/authService";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

const mockAuthResult = {
  token: "test-token",
  user: { _id: "1", name: "Test", email: "test@test.com" },
};

describe("authController.register", () => {
  const req = { body: { name: "Test", email: "test@test.com", password: "pass123" } } as Request;
  const next = vi.fn() as NextFunction;

  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with token on success", async () => {
    vi.mocked(authService.registerUser).mockResolvedValue(mockAuthResult);
    const res = mockRes();

    await authController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAuthResult });
  });

  it("returns 409 on DUPLICATE_EMAIL", async () => {
    vi.mocked(authService.registerUser).mockRejectedValue(new Error("DUPLICATE_EMAIL"));
    const res = mockRes();

    await authController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("calls next() on unexpected error", async () => {
    const unexpectedError = new Error("DB crashed");
    vi.mocked(authService.registerUser).mockRejectedValue(unexpectedError);
    const res = mockRes();

    await authController.register(req, res, next);

    expect(next).toHaveBeenCalledWith(unexpectedError);
  });
});

describe("authController.login", () => {
  const req = { body: { email: "test@test.com", password: "pass123" } } as Request;
  const next = vi.fn() as NextFunction;

  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with token on success", async () => {
    vi.mocked(authService.loginUser).mockResolvedValue(mockAuthResult);
    const res = mockRes();

    await authController.login(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAuthResult });
  });

  it("returns 401 on INVALID_CREDENTIALS", async () => {
    vi.mocked(authService.loginUser).mockRejectedValue(new Error("INVALID_CREDENTIALS"));
    const res = mockRes();

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("calls next() on unexpected error", async () => {
    const unexpectedError = new Error("DB crashed");
    vi.mocked(authService.loginUser).mockRejectedValue(unexpectedError);
    const res = mockRes();

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(unexpectedError);
  });
});
