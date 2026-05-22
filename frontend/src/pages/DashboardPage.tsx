import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { ExpenseForm } from "../components/ExpenseForm";
import { useExpenses } from "../hooks/useExpenses";
import type { Expense, ExpenseFormData } from "../types/index";

// Dashboard is the main authenticated page.
// It delegates all data fetching and mutation to the useExpenses hook.
// The component only manages UI state (which modal is open, which expense is being edited).
export function DashboardPage() {
  const { expenses, isLoading, error, createExpense, updateExpense, deleteExpense } =
    useExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  async function handleCreate(data: ExpenseFormData) {
    await createExpense(data);
    setShowForm(false);
  }

  async function handleUpdate(data: ExpenseFormData) {
    if (!editingExpense) return;
    await updateExpense(editingExpense._id, data);
    setEditingExpense(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    await deleteExpense(id);
  }

  return (
    <div>
      <Navbar />
      <main style={styles.main}>
        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total Expenses</span>
            <span style={styles.summaryValue}>£{total.toFixed(2)}</span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Transactions</span>
            <span style={styles.summaryValue}>{expenses.length}</span>
          </div>
        </div>

        {/* Add button */}
        <div style={styles.toolbar}>
          <h2 style={styles.sectionTitle}>My Expenses</h2>
          <button onClick={() => setShowForm(true)} style={styles.addButton}>
            + Add Expense
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={styles.formWrapper}>
            <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Edit form */}
        {editingExpense && (
          <div style={styles.formWrapper}>
            <ExpenseForm
              expense={editingExpense}
              onSubmit={handleUpdate}
              onCancel={() => setEditingExpense(null)}
            />
          </div>
        )}

        {/* States */}
        {isLoading && <p style={styles.state}>Loading...</p>}
        {error && <p style={{ ...styles.state, color: "#dc2626" }}>{error}</p>}

        {/* Expense list */}
        {!isLoading && !error && expenses.length === 0 && (
          <p style={styles.state}>No expenses yet. Add your first one above.</p>
        )}

        {!isLoading && expenses.length > 0 && (
          <div style={styles.list}>
            {expenses.map((expense) => (
              <div key={expense._id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <span style={styles.category}>
                    {expense.category}
                  </span>
                  <div>
                    <p style={styles.cardTitle}>{expense.title}</p>
                    <p style={styles.cardDate}>
                      {new Date(expense.date).toLocaleDateString("en-GB")}
                    </p>
                    {expense.notes && (
                      <p style={styles.cardNotes}>{expense.notes}</p>
                    )}
                  </div>
                </div>
                <div style={styles.cardRight}>
                  <span style={styles.amount}>£{expense.amount.toFixed(2)}</span>
                  <div style={styles.actions}>
                    <button
                      onClick={() => setEditingExpense(expense)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(expense._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" },
  summary: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" },
  summaryCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "1.25rem 1.5rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  summaryLabel: { fontSize: "0.85rem", color: "#6b7280" },
  summaryValue: { fontSize: "1.75rem", fontWeight: 700, color: "#111827" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  sectionTitle: { margin: 0, fontSize: "1.1rem", fontWeight: 600 },
  addButton: {
    padding: "0.5rem 1.25rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
  },
  formWrapper: {
    background: "#fff",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  state: { textAlign: "center", color: "#6b7280", marginTop: "2rem" },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  cardLeft: { display: "flex", gap: "1rem", alignItems: "flex-start" },
  category: {
    background: "#ede9fe",
    color: "#4f46e5",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    marginTop: "3px",
  },
  cardTitle: { margin: 0, fontWeight: 500 },
  cardDate: { margin: "2px 0 0", fontSize: "0.8rem", color: "#9ca3af" },
  cardNotes: { margin: "4px 0 0", fontSize: "0.8rem", color: "#6b7280" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
  amount: { fontWeight: 700, fontSize: "1.1rem" },
  actions: { display: "flex", gap: "0.5rem" },
  editBtn: {
    padding: "3px 10px",
    fontSize: "0.8rem",
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "3px 10px",
    fontSize: "0.8rem",
    background: "transparent",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
