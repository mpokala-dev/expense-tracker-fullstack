import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "../pages/DashboardPage";

vi.mock("../hooks/useExpenses", () => ({
  useExpenses: vi.fn(),
}));

vi.mock("../components/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("../components/ExpenseForm", () => ({
  ExpenseForm: () => <div>ExpenseForm</div>,
}));

import { useExpenses } from "../hooks/useExpenses";

function renderDashboardPage() {
  return render(<DashboardPage />);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the summary and empty expenses state", () => {
    vi.mocked(useExpenses).mockReturnValue({
      expenses: [],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      refetch: vi.fn(),
    });

    renderDashboardPage();

    expect(screen.getByText(/total expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ add expense/i })).toBeInTheDocument();
  });

  it("shows a loading state when expenses are loading", () => {
    vi.mocked(useExpenses).mockReturnValue({
      expenses: [],
      isLoading: true,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      refetch: vi.fn(),
    });

    renderDashboardPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
