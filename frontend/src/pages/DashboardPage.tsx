import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { ExpenseForm } from "../components/ExpenseForm";
import { useExpenses } from "../hooks/useExpenses";
import type { Expense, ExpenseFormData, ExpenseFilters } from "../types/index";
import { EXPENSE_CATEGORIES } from "../types/index";

// Dashboard is the main authenticated page.
// It delegates all data fetching and mutation to the useExpenses hook.
// The component only manages UI state (which modal is open, which expense is being edited).
export function DashboardPage() {
  const {
    expenses,
    pagination,
    isLoading,
    error,
    filters,
    currentPage,
    setFilters,
    setCurrentPage,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  // Local filter draft — applied on submit
  const [draftFilters, setDraftFilters] = useState<ExpenseFilters>(filters);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const hasActiveFilters =
    filters.category !== "" || filters.startDate !== "" || filters.endDate !== "";

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

  function handleApplyFilters() {
    setFilters(draftFilters);
  }

  function handleClearFilters() {
    const cleared: ExpenseFilters = { category: "", startDate: "", endDate: "" };
    setDraftFilters(cleared);
    setFilters(cleared);
  }

  return (
    <div>
      <Navbar />
      <main style={styles.main}>
        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <span data-testid="summary-label" style={styles.summaryLabel}>
              {hasActiveFilters ? "Filtered Total" : "Total Expenses"}
            </span>
            <span data-testid="total-amount" style={styles.summaryValue}>£{total.toFixed(2)}</span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>
              {hasActiveFilters ? "Matching Transactions" : "Transactions"}
            </span>
            <span style={styles.summaryValue}>
              {pagination ? pagination.total : expenses.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filtersCard}>
          <h3 style={styles.filtersTitle}>Filter Expenses</h3>
          <div style={styles.filtersRow}>
            {/* Category */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select
                style={styles.filterSelect}
                value={draftFilters.category}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    category: e.target.value as ExpenseFilters["category"],
                  }))
                }
              >
                <option value="">All categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>From</label>
              <input
                type="date"
                style={styles.filterInput}
                value={draftFilters.startDate}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            {/* End date */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>To</label>
              <input
                type="date"
                style={styles.filterInput}
                value={draftFilters.endDate}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            {/* Actions */}
            <div style={styles.filterActions}>
              <button onClick={handleApplyFilters} style={styles.applyBtn}>
                Apply
              </button>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} style={styles.clearBtn}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <p style={styles.activeFiltersNote}>
              ✦ Filters active
              {filters.category ? ` · ${filters.category}` : ""}
              {filters.startDate ? ` · from ${filters.startDate}` : ""}
              {filters.endDate ? ` · to ${filters.endDate}` : ""}
            </p>
          )}
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
          <p style={styles.state}>
            {hasActiveFilters
              ? "No expenses match the current filters."
              : "No expenses yet. Add your first one above."}
          </p>
        )}

        {!isLoading && expenses.length > 0 && (
          <div style={styles.list}>
            {expenses.map((expense) => (
              <div key={expense._id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <span style={styles.category}>{expense.category}</span>
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
                <div data-testid="card-right" style={styles.cardRight}>
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
              }}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                style={{
                  ...styles.pageBtn,
                  ...(p === currentPage ? styles.pageBtnActive : {}),
                }}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage === pagination.totalPages ? styles.pageBtnDisabled : {}),
              }}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next →
            </button>

            <span style={styles.pageInfo}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" },
  summary: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
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

  // Filters
  filtersCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "1.25rem 1.5rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  },
  filtersTitle: { margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 600, color: "#374151" },
  filtersRow: { display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "4px", minWidth: "140px" },
  filterLabel: { fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" },
  filterSelect: {
    padding: "0.45rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "0.875rem",
    background: "#fafafa",
    color: "#111827",
    cursor: "pointer",
  },
  filterInput: {
    padding: "0.45rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "0.875rem",
    background: "#fafafa",
    color: "#111827",
  },
  filterActions: { display: "flex", gap: "0.5rem", alignItems: "flex-end" },
  applyBtn: {
    padding: "0.45rem 1rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  clearBtn: {
    padding: "0.45rem 1rem",
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  activeFiltersNote: {
    margin: "0.75rem 0 0",
    fontSize: "0.8rem",
    color: "#4f46e5",
    fontWeight: 500,
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
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
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    flexShrink: 0,
  },
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

  // Pagination
  pagination: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1.5rem",
    flexWrap: "wrap",
  },
  pageBtn: {
    padding: "0.4rem 0.85rem",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "#374151",
    transition: "all 0.15s",
  },
  pageBtnActive: {
    background: "#4f46e5",
    color: "#fff",
    border: "1px solid #4f46e5",
    fontWeight: 600,
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginLeft: "0.5rem",
  },
};
