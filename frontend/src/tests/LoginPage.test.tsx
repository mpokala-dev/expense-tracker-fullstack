import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";

// Mock auth API and context
vi.mock("../api/auth", () => ({
  login: vi.fn(),
}));

vi.mock("../store/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn(),
    isAuthenticated: false,
    user: null,
    token: null,
    logout: vi.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import * as authApi from "../api/auth";
import { useAuth } from "../store/AuthContext";

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the login form", () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors when form is submitted empty", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("calls login API and navigates to dashboard on success", async () => {
    const user = userEvent.setup();
    const mockAuthResult = {
      token: "test-token",
      user: { _id: "1", name: "Test", email: "test@test.com" },
    };
    vi.mocked(authApi.login).mockResolvedValue(mockAuthResult);
    const mockLogin = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
      token: null,
      logout: vi.fn(),
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
      expect(mockLogin).toHaveBeenCalledWith(mockAuthResult);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error message on failed login", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockRejectedValue(new Error("Invalid credentials"));

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("has a link to the register page", () => {
    renderLoginPage();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });
});
