import { Expense } from "../models/Expense";
import type { CreateExpenseDto, UpdateExpenseDto } from "../types/index";
import type { IExpense } from "../models/Expense";

// All expense operations are scoped to a userId.
// A user can never read or modify another user's expenses —
// the userId is always taken from the verified JWT, never from user input.

export async function getExpenses(userId: string): Promise<IExpense[]> {
  return Expense.find({ userId }).sort({ date: -1 });
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
