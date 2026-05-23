import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../store/AuthContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockAuthResult = {
  token: "test-token-123",
  user: { _id: "user-1", name: "Test User", email: "test@example.com" },
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unauthenticated with no user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it("login sets user and token, persists to localStorage", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockAuthResult);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe("Test User");
    expect(result.current.token).toBe("test-token-123");
    expect(localStorage.getItem("token")).toBe("test-token-123");
  });

  it("logout clears user and token from state and localStorage", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockAuthResult);
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("restores auth state from localStorage on mount", () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("user", JSON.stringify(mockAuthResult.user));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe("stored-token");
    expect(result.current.user?.email).toBe("test@example.com");
  });
});
