// Mirrors the backend types — kept in sync manually.
// In a monorepo setup you'd share these from a common package.

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

export interface Expense {
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

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthResult {
  token: string;
  user: User;
}

// Form input types — what the forms submit
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface ExpenseFilters {
  category: ExpenseCategory | "";
  startDate: string;
  endDate: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  pagination: Pagination;
}
