import { describe, it, expect, vi, beforeEach } from "vitest";
import * as expenseService from "../../src/services/expenseService";

vi.mock("../../src/models/Expense", () => ({
  Expense: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
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

describe("expenseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getExpenses returns expenses sorted by date desc", async () => {
    vi.mocked(Expense.find).mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockExpense]),
    } as any);

    const result = await expenseService.getExpenses(userId);
    expect(Expense.find).toHaveBeenCalledWith({ userId });
    expect(result).toHaveLength(1);
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
