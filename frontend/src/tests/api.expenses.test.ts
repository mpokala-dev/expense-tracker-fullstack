import { describe, it, expect, vi, beforeEach } from "vitest";
import * as expensesApi from "../api/expenses";
import api from "../api/axios";

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

describe("expenses API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getExpenses calls GET /expenses and returns array", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: [mockExpense] },
    });

    const result = await expensesApi.getExpenses();

    expect(api.get).toHaveBeenCalledWith("/expenses");
    expect(result).toEqual([mockExpense]);
  });

  it("createExpense calls POST /expenses with payload", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: mockExpense },
    });

    const payload = {
      title: "Coffee",
      amount: 3.5,
      category: "food" as const,
      date: "2024-01-15",
    };

    const result = await expensesApi.createExpense(payload);

    expect(api.post).toHaveBeenCalledWith("/expenses", payload);
    expect(result).toEqual(mockExpense);
  });

  it("updateExpense calls PUT /expenses/:id with payload", async () => {
    const updated = { ...mockExpense, title: "Latte" };
    vi.mocked(api.put).mockResolvedValue({
      data: { success: true, data: updated },
    });

    const result = await expensesApi.updateExpense("exp-1", { title: "Latte" });

    expect(api.put).toHaveBeenCalledWith("/expenses/exp-1", { title: "Latte" });
    expect(result.title).toBe("Latte");
  });

  it("deleteExpense calls DELETE /expenses/:id", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    await expensesApi.deleteExpense("exp-1");

    expect(api.delete).toHaveBeenCalledWith("/expenses/exp-1");
  });
});
