import { Router } from "express";
import * as expenseController from "../controllers/expenseController";
import { authenticate } from "../middleware/auth";
import {
  createExpenseRules,
  updateExpenseRules,
  validate,
} from "../middleware/validation";

const router = Router();

// All expense routes require a valid JWT.
// authenticate runs first — if it fails, the controller never runs.
router.use(authenticate);

// GET /api/expenses
router.get("/", expenseController.getExpenses);

// POST /api/expenses
router.post("/", createExpenseRules, validate, expenseController.createExpense);

// PUT /api/expenses/:id
router.put(
  "/:id",
  updateExpenseRules,
  validate,
  expenseController.updateExpense
);

// DELETE /api/expenses/:id
router.delete("/:id", expenseController.deleteExpense);

export default router;
