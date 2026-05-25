import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "../components/ExpenseForm";

const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
const mockOnCancel = vi.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
};

const mockExpense = {
  _id: "exp-1",
  userId: "user-1",
  title: "Coffee",
  amount: 3.5,
  category: "food" as const,
  date: "2024-01-15T00:00:00Z",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

describe("ExpenseForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders Add Expense heading in create mode", () => {
    render(<ExpenseForm {...defaultProps} />);
    expect(screen.getByTestId("form-heading")).toHaveTextContent("Add Expense");
  });

  it("renders Edit Expense heading in edit mode", () => {
    render(<ExpenseForm {...defaultProps} expense={mockExpense} />);
    expect(screen.getByTestId("form-heading")).toHaveTextContent("Edit Expense");
  });

  it("pre-fills fields when expense is provided", () => {
    render(<ExpenseForm {...defaultProps} expense={mockExpense} />);
    expect(screen.getByDisplayValue("Coffee")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3.5")).toBeInTheDocument();
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.click(screen.getByText("Cancel"));

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it("shows validation error when title is empty", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error when amount is 0", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/title/i), "Coffee");
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), "0");
    await user.click(screen.getByRole("button", { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least £0.01/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct data when form is valid", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/title/i), "Coffee");
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), "3.50");
    await user.selectOptions(screen.getByLabelText(/category/i), "food");

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Coffee", amount: 3.5, category: "food" }),
        expect.anything()
      );
    });
  });
});
