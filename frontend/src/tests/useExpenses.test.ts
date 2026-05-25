import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useExpenses } from "../hooks/useExpenses";

// Mock the expenses API module
vi.mock("../api/expenses", () => ({
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

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

describe("useExpenses hook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches expenses on mount and sets loading state correctly", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([mockExpense]);

    const { result } = renderHook(() => useExpenses());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.expenses).toEqual([mockExpense]);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when fetch fails", async () => {
    vi.mocked(expensesApi.getExpenses).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load expenses");
    expect(result.current.expenses).toEqual([]);
  });

  it("createExpense adds new expense to the list", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([]);
    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockExpense);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createExpense({
        title: "Coffee",
        amount: 3.5,
        category: "food",
        date: "2024-01-15",
      });
    });

    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].title).toBe("Coffee");
  });

  it("updateExpense updates the correct expense in the list", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([mockExpense]);
    const updated = { ...mockExpense, title: "Latte" };
    vi.mocked(expensesApi.updateExpense).mockResolvedValue(updated);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateExpense("exp-1", { title: "Latte" });
    });

    expect(result.current.expenses[0].title).toBe("Latte");
  });

  it("deleteExpense removes the expense from the list", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([mockExpense]);
    vi.mocked(expensesApi.deleteExpense).mockResolvedValue(undefined);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteExpense("exp-1");
    });

    expect(result.current.expenses).toHaveLength(0);
  });
});
