import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../src/types/index";
import * as expenseController from "../../src/controllers/expenseController";

vi.mock("../../src/services/expenseService", () => ({
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

import * as expenseService from "../../src/services/expenseService";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

function mockReq(overrides = {}): AuthRequest {
  return {
    userId: "user-123",
    body: {},
    params: {},
    ...overrides,
  } as AuthRequest;
}

const next = vi.fn() as NextFunction;

const mockExpense = {
  _id: "expense-1",
  userId: "user-123",
  title: "Coffee",
  amount: 3.5,
  category: "food",
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("expenseController.getExpenses", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns expenses list", async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue([mockExpense] as any);
    const res = mockRes();

    await expenseController.getExpenses(mockReq(), res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: [mockExpense] });
  });

  it("calls next() on error", async () => {
    vi.mocked(expenseService.getExpenses).mockRejectedValue(new Error("DB error"));
    const res = mockRes();

    await expenseController.getExpenses(mockReq(), res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("expenseController.createExpense", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with created expense", async () => {
    vi.mocked(expenseService.createExpense).mockResolvedValue(mockExpense as any);
    const res = mockRes();
    const req = mockReq({ body: { title: "Coffee", amount: 3.5, category: "food", date: "2024-01-15" } });

    await expenseController.createExpense(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockExpense });
  });

  it("calls next() on error", async () => {
    vi.mocked(expenseService.createExpense).mockRejectedValue(new Error("DB error"));
    const res = mockRes();

    await expenseController.createExpense(mockReq(), res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("expenseController.updateExpense", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns updated expense", async () => {
    vi.mocked(expenseService.updateExpense).mockResolvedValue(mockExpense as any);
    const res = mockRes();
    const req = mockReq({ params: { id: "expense-1" }, body: { title: "Latte" } });

    await expenseController.updateExpense(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockExpense });
  });

  it("returns 404 when expense not found", async () => {
    vi.mocked(expenseService.updateExpense).mockResolvedValue(null);
    const res = mockRes();
    const req = mockReq({ params: { id: "bad-id" } });

    await expenseController.updateExpense(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("calls next() on error", async () => {
    vi.mocked(expenseService.updateExpense).mockRejectedValue(new Error("DB error"));
    const res = mockRes();

    await expenseController.updateExpense(mockReq({ params: { id: "1" } }), res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("expenseController.deleteExpense", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns success message on delete", async () => {
    vi.mocked(expenseService.deleteExpense).mockResolvedValue(true);
    const res = mockRes();
    const req = mockReq({ params: { id: "expense-1" } });

    await expenseController.deleteExpense(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Expense deleted" });
  });

  it("returns 404 when expense not found", async () => {
    vi.mocked(expenseService.deleteExpense).mockResolvedValue(false);
    const res = mockRes();
    const req = mockReq({ params: { id: "bad-id" } });

    await expenseController.deleteExpense(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("calls next() on error", async () => {
    vi.mocked(expenseService.deleteExpense).mockRejectedValue(new Error("DB error"));
    const res = mockRes();

    await expenseController.deleteExpense(mockReq({ params: { id: "1" } }), res, next);

    expect(next).toHaveBeenCalled();
  });
});
