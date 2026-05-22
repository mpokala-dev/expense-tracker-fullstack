import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index";
import * as expenseService from "../services/expenseService";

// userId is guaranteed to exist here because the authenticate middleware
// runs before any of these handlers and rejects unauthenticated requests.

export async function getExpenses(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expenses = await expenseService.getExpenses(req.userId!);
    res.json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
}

export async function createExpense(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expense = await expenseService.createExpense(req.userId!, req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function updateExpense(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expense = await expenseService.updateExpense(
      req.params.id,
      req.userId!,
      req.body
    );
    if (!expense) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function deleteExpense(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await expenseService.deleteExpense(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    next(error);
  }
}
