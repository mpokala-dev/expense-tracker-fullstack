import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "../pages/RegisterPage";

vi.mock("../api/auth", () => ({
  register: vi.fn(),
}));

vi.mock("../store/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    user: null,
    token: null,
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import * as authApi from "../api/auth";
import { useAuth } from "../store/AuthContext";

const mockAuthResult = {
  token: "test-token",
  user: { _id: "1", name: "Test User", email: "test@test.com" },
};

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      user: null,
      token: null,
    });
  });

  it("renders the registration form", () => {
    renderRegisterPage();

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows validation errors when the form is submitted empty", async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it("calls register, logs in, and navigates on success", async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      isAuthenticated: false,
      user: null,
      token: null,
    });
    vi.mocked(authApi.register).mockResolvedValue(mockAuthResult);

    const { container } = renderRegisterPage();
    const nameInput = container.querySelector<HTMLInputElement>("input[name='name']");
    const emailInput = container.querySelector<HTMLInputElement>("input[name='email']");
    const passwordInput = container.querySelector<HTMLInputElement>("input[name='password']");

    await user.type(nameInput as HTMLInputElement, "Test User");
    await user.type(emailInput as HTMLInputElement, "test@test.com");
    await user.type(passwordInput as HTMLInputElement, "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@test.com",
        password: "password123",
      });
      expect(mockLogin).toHaveBeenCalledWith(mockAuthResult);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows a server error message when registration fails", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockRejectedValue({
      response: { data: { message: "Email already exists" } },
    });

    const { container } = renderRegisterPage();
    const nameInput = container.querySelector<HTMLInputElement>("input[name='name']");
    const emailInput = container.querySelector<HTMLInputElement>("input[name='email']");
    const passwordInput = container.querySelector<HTMLInputElement>("input[name='password']");

    await user.type(nameInput as HTMLInputElement, "Test User");
    await user.type(emailInput as HTMLInputElement, "duplicate@test.com");
    await user.type(passwordInput as HTMLInputElement, "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
