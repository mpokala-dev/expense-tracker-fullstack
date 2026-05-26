import { useState, useEffect, useCallback, useRef } from "react";
import type { Expense, ExpenseFormData, ExpenseFilters, Pagination } from "../types/index";
import * as expensesApi from "../api/expenses";

const DEFAULT_FILTERS: ExpenseFilters = {
  category: "",
  startDate: "",
  endDate: "",
};

const PAGE_SIZE = 5;

interface UseExpensesReturn {
  expenses: Expense[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  currentPage: number;
  setFilters: (filters: ExpenseFilters) => void;
  setCurrentPage: (page: number) => void;
  createExpense: (data: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPageState] = useState(1);

  // Refs so callbacks always read the latest values without needing to be in deps
  const filtersRef = useRef(filters);
  const currentPageRef = useRef(currentPage);
  filtersRef.current = filters;
  currentPageRef.current = currentPage;

  const fetchExpenses = useCallback(
    async (activeFilters?: ExpenseFilters, page?: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await expensesApi.getExpenses(
          activeFilters ?? filtersRef.current,
          page ?? currentPageRef.current,
          PAGE_SIZE
        );
        setExpenses(result.expenses);
        setPagination(result.pagination);
      } catch {
        setError("Failed to load expenses");
      } finally {
        setIsLoading(false);
      }
    },
    [] // stable — reads latest values via refs
  );

  // Refetch whenever filters or page changes
  useEffect(() => {
    void fetchExpenses(filters, currentPage);
  }, [filters, currentPage, fetchExpenses]);

  const setFilters = useCallback((newFilters: ExpenseFilters) => {
    setFiltersState(newFilters);
    setCurrentPageState(1);
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const createExpense = useCallback(async (data: ExpenseFormData) => {
    await expensesApi.createExpense(data);
    // Always refetch after create — resets to page 1 if already there
    await fetchExpenses(filtersRef.current, 1);
    setCurrentPageState(1);
  }, [fetchExpenses]);

  const updateExpense = useCallback(
    async (id: string, data: Partial<ExpenseFormData>) => {
      const updated = await expensesApi.updateExpense(id, data);
      setExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));
    },
    []
  );

  const deleteExpense = useCallback(async (id: string) => {
    await expensesApi.deleteExpense(id);
    await fetchExpenses(filtersRef.current, currentPageRef.current);
  }, [fetchExpenses]);

  return {
    expenses,
    pagination,
    isLoading,
    error,
    filters,
    currentPage,
    setFilters,
    setCurrentPage,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: () => fetchExpenses(filtersRef.current, currentPageRef.current),
  };
}