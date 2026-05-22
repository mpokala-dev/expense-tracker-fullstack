import api from "./axios";
import type { ApiResponse, Expense, ExpenseFormData } from "../types/index";

export async function getExpenses(): Promise<Expense[]> {
  const response = await api.get<ApiResponse<Expense[]>>("/expenses");
  return response.data.data!;
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
