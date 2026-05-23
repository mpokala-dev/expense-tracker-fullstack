import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EXPENSE_CATEGORIES, type ExpenseCategory, type ExpenseFormData, type Expense } from "../types/index";

// Zod schema defines validation rules once — react-hook-form uses it automatically.
// The same schema could be imported by the backend in a monorepo.
const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum(
    EXPENSE_CATEGORIES as [ExpenseCategory, ...ExpenseCategory[]],
    { errorMap: () => ({ message: "Please select a category" }) }
  ),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
});

interface Props {
  // If expense is provided, the form is in edit mode
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

// Single form component handles both create and edit.
// Default values come from the expense prop when editing.
export function ExpenseForm({ expense, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: expense.date.substring(0, 10), // ISO string → YYYY-MM-DD for input
          notes: expense.notes ?? "",
        }
      : {
          date: new Date().toISOString().substring(0, 10),
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
      <h2 style={styles.heading}>{expense ? "Edit Expense" : "Add Expense"}</h2>

      <div style={styles.field}>
        <label style={styles.label}>Title</label>
        <input {...register("title")} style={styles.input} placeholder="e.g. Coffee" />
        {errors.title && <span style={styles.error}>{errors.title.message}</span>}
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Amount (£)</label>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            style={styles.input}
            placeholder="0.00"
          />
          {errors.amount && <span style={styles.error}>{errors.amount.message}</span>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Date</label>
          <input {...register("date")} type="date" style={styles.input} />
          {errors.date && <span style={styles.error}>{errors.date.message}</span>}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Category</label>
        <select {...register("category")} style={styles.input}>
          <option value="">Select a category</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && <span style={styles.error}>{errors.category.message}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Notes (optional)</label>
        <textarea {...register("notes")} style={{ ...styles.input, height: "80px" }} />
        {errors.notes && <span style={styles.error}>{errors.notes.message}</span>}
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
          {isSubmitting ? "Saving..." : expense ? "Update" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  heading: { margin: 0, fontSize: "1.2rem", fontWeight: 600 },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  label: { fontSize: "0.85rem", fontWeight: 500, color: "#374151" },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    outline: "none",
  },
  error: { fontSize: "0.8rem", color: "#dc2626" },
  actions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" },
  cancelBtn: {
    padding: "0.5rem 1.25rem",
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "0.5rem 1.25rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
  },
};
