import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardPage } from "../pages/DashboardPage";
import type { ExpenseFilters, Pagination } from "../types/index";

vi.mock("../hooks/useExpenses", () => ({
  useExpenses: vi.fn(),
}));

vi.mock("../components/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("../components/ExpenseForm", () => ({
  ExpenseForm: ({ onSubmit, onCancel }: { onSubmit: (d: any) => void; onCancel: () => void }) => (
    <div>
      <button onClick={() => onSubmit({ title: "Test", amount: 10, category: "food", date: "2024-01-15" })}>
        Submit Form
      </button>
      <button onClick={onCancel}>Cancel Form</button>
    </div>
  ),
}));

import { useExpenses } from "../hooks/useExpenses";

const mockFns = {
  setFilters: vi.fn(),
  setCurrentPage: vi.fn(),
  createExpense: vi.fn().mockResolvedValue(undefined),
  updateExpense: vi.fn().mockResolvedValue(undefined),
  deleteExpense: vi.fn().mockResolvedValue(undefined),
  refetch: vi.fn(),
};

const mockExpense = {
  _id: "exp-1",
  userId: "user-1",
  title: "Coffee",
  amount: 3.5,
  category: "food" as const,
  date: "2024-01-15T00:00:00Z",
  createdAt: "",
  updatedAt: "",
};

const mockExpenseWithNotes = { ...mockExpense, _id: "exp-2", notes: "Morning brew" };

const defaultHookValue = {
  expenses: [],
  pagination: null as Pagination | null,
  isLoading: false,
  error: null as string | null,
  filters: { category: "" as ExpenseFilters["category"], startDate: "", endDate: "" },
  currentPage: 1,
  ...mockFns,
};

function setup(overrides = {}) {
  vi.mocked(useExpenses).mockReturnValue({ ...defaultHookValue, ...overrides });
  return render(<DashboardPage />);
}

describe("DashboardPage — loading / error states", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows loading indicator", () => {
    setup({ isLoading: true });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows error message", () => {
    setup({ error: "Failed to load expenses" });
    expect(screen.getByText(/failed to load expenses/i)).toBeInTheDocument();
  });

  it("shows empty state when no expenses and no filters", () => {
    setup();
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument();
  });

  it("shows filtered empty state when filters are active", () => {
    setup({ filters: { category: "food", startDate: "", endDate: "" } });
    expect(screen.getByText(/no expenses match the current filters/i)).toBeInTheDocument();
  });
});

describe("DashboardPage — summary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows total amount from expenses list", () => {
    setup({ expenses: [mockExpense] });
    expect(screen.getByTestId("total-amount").textContent).toBe("£3.50");
  });

  it("shows total transaction count from pagination when available", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 13, page: 1, limit: 5, totalPages: 2 },
    });
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("shows filtered total label when filters active", () => {
    setup({ filters: { category: "food", startDate: "", endDate: "" } });
    expect(screen.getByText(/filtered total/i)).toBeInTheDocument();
  });
});

describe("DashboardPage — expense list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders expense title, category and amount", () => {
    setup({ expenses: [mockExpense] });
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByTestId("card-right").textContent).toContain("£3.50");
  });

  it("renders notes when present", () => {
    setup({ expenses: [mockExpenseWithNotes] });
    expect(screen.getByText("Morning brew")).toBeInTheDocument();
  });

  it("does not render notes element when notes absent", () => {
    setup({ expenses: [mockExpense] });
    expect(screen.queryByText("Morning brew")).not.toBeInTheDocument();
  });
});

describe("DashboardPage — Add Expense form", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows form when Add Expense clicked", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /\+ add expense/i }));
    expect(screen.getByText("Submit Form")).toBeInTheDocument();
  });

  it("hides form on cancel", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /\+ add expense/i }));
    fireEvent.click(screen.getByText("Cancel Form"));
    expect(screen.queryByText("Submit Form")).not.toBeInTheDocument();
  });

  it("calls createExpense and closes form on submit", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /\+ add expense/i }));
    fireEvent.click(screen.getByText("Submit Form"));
    await waitFor(() => {
      expect(mockFns.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test" })
      );
    });
    expect(screen.queryByText("Submit Form")).not.toBeInTheDocument();
  });
});

describe("DashboardPage — Edit / Delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows edit form when Edit clicked", () => {
    setup({ expenses: [mockExpense] });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByText("Submit Form")).toBeInTheDocument();
  });

  it("calls updateExpense and closes edit form on submit", async () => {
    setup({ expenses: [mockExpense] });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByText("Submit Form"));
    await waitFor(() => {
      expect(mockFns.updateExpense).toHaveBeenCalledWith(
        "exp-1",
        expect.objectContaining({ title: "Test" })
      );
    });
    expect(screen.queryByText("Submit Form")).not.toBeInTheDocument();
  });

  it("closes edit form on cancel", () => {
    setup({ expenses: [mockExpense] });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByText("Cancel Form"));
    expect(screen.queryByText("Submit Form")).not.toBeInTheDocument();
  });

  it("calls deleteExpense when Delete confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    setup({ expenses: [mockExpense] });
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() => {
      expect(mockFns.deleteExpense).toHaveBeenCalledWith("exp-1");
    });
  });

  it("does not call deleteExpense when Delete cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    setup({ expenses: [mockExpense] });
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() => {
      expect(mockFns.deleteExpense).not.toHaveBeenCalled();
    });
  });
});

describe("DashboardPage — Filters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders filter panel with category select and date inputs", () => {
    setup();
    expect(screen.getByText(/filter expenses/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls setFilters when Apply clicked", () => {
    setup();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "food" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(mockFns.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ category: "food" })
    );
  });

  it("updates startDate draft on input change", () => {
    setup();
    const inputs = screen.getAllByDisplayValue("");
    // First date input is startDate
    fireEvent.change(inputs[0], { target: { value: "2024-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(mockFns.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: "2024-01-01" })
    );
  });

  it("updates endDate draft on input change", () => {
    setup();
    const inputs = screen.getAllByDisplayValue("");
    // Second date input is endDate
    fireEvent.change(inputs[1], { target: { value: "2024-01-31" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(mockFns.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: "2024-01-31" })
    );
  });

  it("shows Clear button and active filter note when filters active", () => {
    setup({ filters: { category: "food", startDate: "2024-01-01", endDate: "2024-01-31" } });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    expect(screen.getByText(/filters active/i)).toBeInTheDocument();
    expect(screen.getByText(/· food/)).toBeInTheDocument();
    expect(screen.getByText(/· from 2024-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/· to 2024-01-31/)).toBeInTheDocument();
  });

  it("calls setFilters with empty values when Clear clicked", () => {
    setup({ filters: { category: "food", startDate: "", endDate: "" } });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(mockFns.setFilters).toHaveBeenCalledWith({ category: "", startDate: "", endDate: "" });
  });
});

describe("DashboardPage — Pagination", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not render pagination when only 1 page", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 5, page: 1, limit: 5, totalPages: 1 },
    });
    expect(screen.queryByRole("button", { name: /prev/i })).not.toBeInTheDocument();
  });

  it("renders pagination controls when totalPages > 1", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 25, page: 1, limit: 5, totalPages: 5 },
    });
    expect(screen.getByRole("button", { name: /← prev/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next →/i })).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
  });

  it("Prev button is disabled on page 1", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 25, page: 1, limit: 5, totalPages: 5 },
      currentPage: 1, // component uses currentPage for disabled check
    });
    expect(screen.getByRole("button", { name: /← prev/i })).toBeDisabled();
  });

  it("Next button is disabled on last page", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 25, page: 5, limit: 5, totalPages: 5 },
      currentPage: 5, // must match totalPages for disabled check
    });
    expect(screen.getByRole("button", { name: /next →/i })).toBeDisabled();
  });

  it("calls setCurrentPage with next page when Next clicked", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 25, page: 1, limit: 5, totalPages: 5 },
      currentPage: 1
    });
    fireEvent.click(screen.getByRole("button", { name: /next →/i }));
    expect(mockFns.setCurrentPage).toHaveBeenCalledWith(2);
  });

  it("calls setCurrentPage with prev page when Prev clicked", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 25, page: 2, limit: 5, totalPages: 5 },
      currentPage: 2, // must be > 1 so Prev isn't disabled
    });
    fireEvent.click(screen.getByRole("button", { name: /← prev/i }));
    expect(mockFns.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("calls setCurrentPage when a page number button clicked", () => {
    setup({
      expenses: [mockExpense],
      pagination: { total: 25, page: 1, limit: 5, totalPages: 5 },
      currentPage: 1
    });
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(mockFns.setCurrentPage).toHaveBeenCalledWith(2);
  });
});