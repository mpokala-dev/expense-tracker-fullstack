import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "../components/Navbar";

vi.mock("../store/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useAuth } from "../store/AuthContext";

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { _id: "1", name: "Madhuri", email: "madhuri@test.com" },
      token: "token",
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
    });
  });

  it("renders the app brand name", () => {
    renderNavbar();
    expect(screen.getByText(/expense tracker/i)).toBeInTheDocument();
  });

  it("displays the logged-in user's name", () => {
    renderNavbar();
    expect(screen.getByText(/hi, madhuri/i)).toBeInTheDocument();
  });

  it("calls logout and navigates to login when Logout is clicked", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(mockLogout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
