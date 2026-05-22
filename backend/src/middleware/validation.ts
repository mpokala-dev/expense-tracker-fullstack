import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { EXPENSE_CATEGORIES } from "../types/index";

// Reads validation errors collected by express-validator rules.
// Call this as the last middleware in any validation chain.
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => e.msg),
    });
    return;
  }
  next();
}

// Auth validation rules
export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Expense validation rules
export const createExpenseRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("category")
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(", ")}`),
  body("date").isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

export const updateExpenseRules = [
  body("title").optional().trim().notEmpty().isLength({ max: 100 }),
  body("amount").optional().isFloat({ min: 0.01 }),
  body("category").optional().isIn(EXPENSE_CATEGORIES),
  body("date").optional().isISO8601(),
  body("notes").optional().trim().isLength({ max: 500 }),
];
