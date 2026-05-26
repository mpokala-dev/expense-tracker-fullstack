import { Expense } from "../models/Expense";
import type { CreateExpenseDto, UpdateExpenseDto, ExpenseResponse, ExpenseQuery, PaginatedExpenses } from "../types/index";
import type { IExpense } from "../models/Expense";

// All expense operations are scoped to a userId.
// A user can never read or modify another user's expenses —
// the userId is always taken from the verified JWT, never from user input.

export async function getExpenses(
  userId: string,
  query: ExpenseQuery = {}
): Promise<PaginatedExpenses> {
  const { category, startDate, endDate, page = 1, limit = 5 } = query;

  const filter: Record<string, any> = { userId };

  if (category) filter["category"] = category;

  if (startDate || endDate) {
    filter["date"] = {};
    if (startDate) filter["date"]["$gte"] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter["date"]["$lte"] = end;
    }
  }

  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses: expenses as unknown as ExpenseResponse[],
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getExpenseById(
  id: string,
  userId: string
): Promise<IExpense | null> {
  return Expense.findOne({ _id: id, userId });
}

export async function createExpense(
  userId: string,
  dto: CreateExpenseDto
): Promise<IExpense> {
  return Expense.create({ ...dto, userId });
}

export async function updateExpense(
  id: string,
  userId: string,
  dto: UpdateExpenseDto
): Promise<IExpense | null> {
  // findOneAndUpdate with { new: true } returns the updated document.
  // We include userId in the filter so users can only update their own expenses.
  return Expense.findOneAndUpdate(
    { _id: id, userId },
    { $set: dto },
    { new: true, runValidators: true }
  );
}

export async function deleteExpense(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await Expense.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
