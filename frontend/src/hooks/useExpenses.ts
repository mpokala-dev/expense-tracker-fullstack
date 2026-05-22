import { useState, useEffect, useCallback } from "react";
import type { Expense, ExpenseFormData } from "../types/index";
import * as expensesApi from "../api/expenses";

// Custom hook that owns all expense data fetching and mutation.
// Components that need expenses call this hook — they never call the API directly.
// This pattern makes it easy to add caching, optimistic updates, or
// swap the API layer without touching any component.

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  createExpense: (data: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getExpenses();
      setExpenses(data);
    } catch {
      setError("Failed to load expenses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = useCallback(async (data: ExpenseFormData) => {
    const newExpense = await expensesApi.createExpense(data);
    // Optimistic-style update — prepend to list without refetching
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);

  const updateExpense = useCallback(
    async (id: string, data: Partial<ExpenseFormData>) => {
      const updated = await expensesApi.updateExpense(id, data);
      setExpenses((prev) =>
        prev.map((e) => (e._id === id ? updated : e))
      );
    },
    []
  );

  const deleteExpense = useCallback(async (id: string) => {
    await expensesApi.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  }, []);

  return {
    expenses,
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
