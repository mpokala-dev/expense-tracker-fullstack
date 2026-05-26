import { describe, it, expect, vi, beforeEach } from "vitest";
import * as expenseService from "../../src/services/expenseService";

vi.mock("../../src/models/Expense", () => ({
  Expense: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

import { Expense } from "../../src/models/Expense";

const userId = "user-123";
const expenseId = "expense-456";

const mockExpense = {
  _id: expenseId,
  userId,
  title: "Coffee",
  amount: 3.5,
  category: "food",
  date: new Date("2024-01-15"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to mock the Expense.find chained query: .find().sort().skip().limit()
function mockFindChain(results: typeof mockExpense[]) {
  vi.mocked(Expense.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(results),
      }),
    }),
  } as any);
}

describe("expenseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getExpenses returns paginated expenses with default pagination", async () => {
    mockFindChain([mockExpense]);
    vi.mocked(Expense.countDocuments).mockResolvedValue(1);

    const result = await expenseService.getExpenses(userId);
    expect(Expense.find).toHaveBeenCalledWith({ userId });
    expect(result.expenses).toHaveLength(1);
    expect(result.pagination).toEqual({ total: 1, page: 1, limit: 5, totalPages: 1 });
  });

  it("getExpenses filters by category", async () => {
    mockFindChain([mockExpense]);
    vi.mocked(Expense.countDocuments).mockResolvedValue(1);

    await expenseService.getExpenses(userId, { category: "food" });
    expect(Expense.find).toHaveBeenCalledWith({ userId, category: "food" });
  });

  it("getExpenses filters by startDate and endDate", async () => {
    let capturedFilter: unknown;
    (Expense.find as any).mockImplementation((filter: unknown) => {
      capturedFilter = filter;
      return {
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any;
    });
    vi.mocked(Expense.countDocuments).mockResolvedValue(0);

    await expenseService.getExpenses(userId, {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });

    const filter = capturedFilter as Record<string, unknown>;
    expect(filter).toHaveProperty("date");
    expect((filter["date"] as Record<string, unknown>)["$gte"]).toBeInstanceOf(Date);
    expect((filter["date"] as Record<string, unknown>)["$lte"]).toBeInstanceOf(Date);
  });

  it("getExpenses respects custom page and limit", async () => {
    mockFindChain([]);
    vi.mocked(Expense.countDocuments).mockResolvedValue(25);

    const result = await expenseService.getExpenses(userId, { page: 2, limit: 3 });
    expect(result.pagination).toEqual({ total: 25, page: 2, limit: 3, totalPages: 9 });
  });

  it("createExpense creates and returns an expense", async () => {
    vi.mocked(Expense.create).mockResolvedValue(mockExpense as any);

    const result = await expenseService.createExpense(userId, {
      title: "Coffee",
      amount: 3.5,
      category: "food",
      date: "2024-01-15",
    });

    expect(Expense.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId, title: "Coffee" })
    );
    expect(result).toEqual(mockExpense);
  });

  it("updateExpense returns updated expense", async () => {
    const updated = { ...mockExpense, title: "Latte" };
    vi.mocked(Expense.findOneAndUpdate).mockResolvedValue(updated as any);

    const result = await expenseService.updateExpense(expenseId, userId, {
      title: "Latte",
    });

    expect(Expense.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expenseId, userId },
      { $set: { title: "Latte" } },
      { new: true, runValidators: true }
    );
    expect(result?.title).toBe("Latte");
  });

  it("updateExpense returns null when expense not found", async () => {
    vi.mocked(Expense.findOneAndUpdate).mockResolvedValue(null);
    const result = await expenseService.updateExpense("bad-id", userId, {});
    expect(result).toBeNull();
  });

  it("deleteExpense returns true when expense found and deleted", async () => {
    vi.mocked(Expense.findOneAndDelete).mockResolvedValue(mockExpense as any);
    const result = await expenseService.deleteExpense(expenseId, userId);
    expect(result).toBe(true);
  });

  it("deleteExpense returns false when expense not found", async () => {
    vi.mocked(Expense.findOneAndDelete).mockResolvedValue(null);
    const result = await expenseService.deleteExpense("bad-id", userId);
    expect(result).toBe(false);
  });
});