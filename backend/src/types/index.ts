import type { Request } from "express";
import type { Types } from "mongoose";

// Extends Express Request to carry the authenticated user's ID.
// Set by the auth middleware after JWT verification.
export interface AuthRequest extends Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

// The shape of an expense document returned to the client.
// Omits internal Mongoose fields.
export interface ExpenseResponse {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | "food"
  | "transport"
  | "utilities"
  | "entertainment"
  | "health"
  | "shopping"
  | "other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "health",
  "shopping",
  "other",
];

export interface CreateExpenseDto {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Query params for filtering and paginating expenses
export interface ExpenseQuery {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Paginated response wrapper
export interface PaginatedExpenses {
  expenses: ExpenseResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}