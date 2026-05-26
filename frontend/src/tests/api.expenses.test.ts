import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../api/axios";
import * as expensesApi from "../api/expenses";

const mockExpense = {
  _id: "exp-1",
  userId: "user-1",
  title: "Coffee",
  amount: 3.5,
  category: "food" as const,
  date: "2024-01-15",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

const mockPaginatedResult = {
  expenses: [mockExpense],
  pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

describe("expenses API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getExpenses calls correct endpoint with default params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockPaginatedResult } });

    const result = await expensesApi.getExpenses();

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/expenses?"));
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("page=1"));
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("limit=5"));
    expect(result).toEqual(mockPaginatedResult);
  });

  it("getExpenses includes category filter in URL when provided", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockPaginatedResult } });

    await expensesApi.getExpenses({ category: "food" });

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("category=food"));
  });

  it("getExpenses includes date filters in URL when provided", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockPaginatedResult } });

    await expensesApi.getExpenses({ startDate: "2024-01-01", endDate: "2024-01-31" });

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("startDate=2024-01-01"));
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("endDate=2024-01-31"));
  });

  it("getExpenses passes custom page and limit", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockPaginatedResult } });

    await expensesApi.getExpenses({}, 3, 5);

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("page=3"));
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("limit=5"));
  });

  it("createExpense posts and returns created expense", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: mockExpense } });

    const result = await expensesApi.createExpense({
      title: "Coffee",
      amount: 3.5,
      category: "food",
      date: "2024-01-15",
    });

    expect(api.post).toHaveBeenCalledWith("/expenses", expect.objectContaining({ title: "Coffee" }));
    expect(result).toEqual(mockExpense);
  });

  it("updateExpense sends PUT and returns updated expense", async () => {
    const updated = { ...mockExpense, title: "Latte" };
    vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: updated } });

    const result = await expensesApi.updateExpense("exp-1", { title: "Latte" });

    expect(api.put).toHaveBeenCalledWith("/expenses/exp-1", { title: "Latte" });
    expect(result.title).toBe("Latte");
  });

  it("deleteExpense sends DELETE request", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    await expensesApi.deleteExpense("exp-1");

    expect(api.delete).toHaveBeenCalledWith("/expenses/exp-1");
  });
});