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
    query: {},
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

const mockPaginatedResult = {
  expenses: [mockExpense],
  pagination: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

describe("expenseController.getExpenses", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns paginated expenses with default params", async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue(mockPaginatedResult as any);
    const res = mockRes();

    await expenseController.getExpenses(mockReq(), res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPaginatedResult });
    expect(expenseService.getExpenses).toHaveBeenCalledWith("user-123", {
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 5,
    });
  });

  it("passes category filter to service", async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue(mockPaginatedResult as any);
    const res = mockRes();
    const req = mockReq({ query: { category: "food" } });

    await expenseController.getExpenses(req, res, next);

    expect(expenseService.getExpenses).toHaveBeenCalledWith("user-123", expect.objectContaining({ category: "food" }));
  });

  it("returns 400 for invalid category", async () => {
    const res = mockRes();
    const req = mockReq({ query: { category: "invalid" } });

    await expenseController.getExpenses(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(expenseService.getExpenses).not.toHaveBeenCalled();
  });

  it("passes date filters to service", async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue(mockPaginatedResult as any);
    const res = mockRes();
    const req = mockReq({ query: { startDate: "2024-01-01", endDate: "2024-01-31" } });

    await expenseController.getExpenses(req, res, next);

    expect(expenseService.getExpenses).toHaveBeenCalledWith("user-123", expect.objectContaining({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    }));
  });

  it("passes page and limit to service", async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue(mockPaginatedResult as any);
    const res = mockRes();
    const req = mockReq({ query: { page: "2", limit: "3" } });

    await expenseController.getExpenses(req, res, next);

    expect(expenseService.getExpenses).toHaveBeenCalledWith("user-123", expect.objectContaining({ page: 2, limit: 3 }));
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