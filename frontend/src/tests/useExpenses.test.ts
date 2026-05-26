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

const mockPaginatedResult = {
  expenses: [mockExpense],
  pagination: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

const emptyPaginatedResult = {
  expenses: [],
  pagination: { total: 0, page: 1, limit: 5, totalPages: 0 },
};

describe("useExpenses hook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches expenses on mount and sets loading state correctly", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue(mockPaginatedResult);

    const { result } = renderHook(() => useExpenses());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.expenses).toEqual([mockExpense]);
    expect(result.current.pagination).toEqual(mockPaginatedResult.pagination);
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

  it("setFilters resets page to 1 and refetches", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue(mockPaginatedResult);

    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setFilters({ category: "food", startDate: "", endDate: "" });
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.filters.category).toBe("food");
  });

  it("setCurrentPage updates page number", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue(mockPaginatedResult);

    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);
  });

  it("createExpense refetches list (resets to page 1)", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue(mockPaginatedResult);
    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockExpense);

    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Move to page 2 first
    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);

    await act(async () => {
      await result.current.createExpense({
        title: "Coffee",
        amount: 3.5,
        category: "food",
        date: "2024-01-15",
      });
    });

    // Should reset to page 1
    expect(result.current.currentPage).toBe(1);
  });

  it("updateExpense updates the correct expense in the list", async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue(mockPaginatedResult);
    const updated = { ...mockExpense, title: "Latte" };
    vi.mocked(expensesApi.updateExpense).mockResolvedValue(updated);

    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateExpense("exp-1", { title: "Latte" });
    });

    expect(result.current.expenses[0].title).toBe("Latte");
  });

  it("deleteExpense refetches the list", async () => {
    vi.mocked(expensesApi.getExpenses)
      .mockResolvedValueOnce(mockPaginatedResult)
      .mockResolvedValueOnce(emptyPaginatedResult);
    vi.mocked(expensesApi.deleteExpense).mockResolvedValue(undefined);

    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteExpense("exp-1");
    });

    await waitFor(() => {
      expect(result.current.expenses).toHaveLength(0);
    });
  });
});
