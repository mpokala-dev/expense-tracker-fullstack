import mongoose, { type Document, type Model } from "mongoose";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "../types/index";

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId; // reference to User._id
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new mongoose.Schema<IExpense>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // enables .populate("userId") if needed later
      required: [true, "User ID is required"],
      index: true, // index on userId — most queries filter by this
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: userId + date — speeds up "get my expenses sorted by date"
expenseSchema.index({ userId: 1, date: -1 });

expenseSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Expense: Model<IExpense> = mongoose.model<IExpense>(
  "Expense",
  expenseSchema
);
