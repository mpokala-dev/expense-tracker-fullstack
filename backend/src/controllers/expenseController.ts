import type { Response, NextFunction } from "express";
import type { AuthRequest, ExpenseCategory } from "../types/index";
import { EXPENSE_CATEGORIES } from "../types/index";
import * as expenseService from "../services/expenseService";

// userId is guaranteed to exist here because the authenticate middleware
// runs before any of these handlers and rejects unauthenticated requests.

export async function getExpenses(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { category, startDate, endDate, page, limit } = req.query as Record<string, string>;

    if (category && !EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(", ")}`,
      });
      return;
    }
console.log("Received query parameters:", { category, startDate, endDate, page, limit });
    const pageNum = page ? Math.max(1, parseInt(page, 5)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 5;
    console.log("Parsed pagination parameters:", { pageNum, limitNum });

    const result = await expenseService.getExpenses(req.userId!, {
      category: category as ExpenseCategory | undefined,
      startDate,
      endDate,
      page: pageNum,
      limit: limitNum,
    });

    res.json({ success: true, data: result });
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
