import api from "./axios";
import type { ApiResponse, Expense, ExpenseFormData, ExpenseFilters, PaginatedExpenses } from "../types/index";

export async function getExpenses(
  filters: Partial<ExpenseFilters> = {},
  page = 1,
  limit = 5
): Promise<PaginatedExpenses> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (filters.category) params.set("category", filters.category);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  const response = await api.get<ApiResponse<PaginatedExpenses | Expense[]>>(
    `/expenses?${params.toString()}`
  );

  const raw = response.data.data!;

  // Normalise: handle both old backend (flat array) and new backend (paginated object)
  if (Array.isArray(raw)) {
    return {
      expenses: raw,
      pagination: { total: raw.length, page: 1, limit: raw.length || 5, totalPages: 1 },
    };
  }

  return raw;
}

export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  const response = await api.post<ApiResponse<Expense>>("/expenses", data);
  return response.data.data!;
}

export async function updateExpense(
  id: string,
  data: Partial<ExpenseFormData>
): Promise<Expense> {
  const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
  return response.data.data!;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}