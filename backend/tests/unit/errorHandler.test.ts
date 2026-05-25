import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middleware/errorHandler";

// Helper to create minimal mock req/res/next objects
function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

const req = {} as Request;
const next = vi.fn() as NextFunction;

describe("errorHandler middleware", () => {
  it("handles Mongoose ValidationError with 400", () => {
    const res = mockRes();
    const err = Object.assign(new Error("Validation failed"), {
      name: "ValidationError",
      errors: {
        title: { message: "Title is required" },
        amount: { message: "Amount must be positive" },
      },
    });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining(["Title is required", "Amount must be positive"]),
      })
    );
  });

  it("handles Mongoose duplicate key error with 409", () => {
    const res = mockRes();
    const err = Object.assign(new Error("Duplicate key"), { code: 11000 });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("handles generic errors with 500 in development", () => {
    process.env.NODE_ENV = "development";
    const res = mockRes();
    const err = new Error("Something went wrong");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Something went wrong",
      })
    );
  });

  it("hides error message in production", () => {
    process.env.NODE_ENV = "production";
    const res = mockRes();
    const err = new Error("Internal server error");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ "success": false, message: "Internal server error" })
    );
    process.env.NODE_ENV = "development";
  });
});
