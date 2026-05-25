import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authApi from "../api/auth";

// Import the mocked axios instance
import api from "../api/axios";

const mockAuthResult = {
  token: "test-token-123",
  user: { _id: "1", name: "Test User", email: "test@test.com" },
};

describe("auth API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("register", () => {
    it("calls POST /auth/register with correct payload", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: mockAuthResult },
      });

      const result = await authApi.register({
        name: "Test User",
        email: "test@test.com",
        password: "password123",
      });

      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        name: "Test User",
        email: "test@test.com",
        password: "password123",
      });
      expect(result).toEqual(mockAuthResult);
    });

    it("throws when API returns an error", async () => {
      vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

      await expect(
        authApi.register({ name: "Test", email: "t@t.com", password: "pass" })
      ).rejects.toThrow("Network error");
    });
  });

  describe("login", () => {
    it("calls POST /auth/login with correct payload", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: mockAuthResult },
      });

      const result = await authApi.login({
        email: "test@test.com",
        password: "password123",
      });

      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password123",
      });
      expect(result).toEqual(mockAuthResult);
    });

    it("throws on invalid credentials", async () => {
      vi.mocked(api.post).mockRejectedValue({ response: { status: 401 } });

      await expect(
        authApi.login({ email: "wrong@test.com", password: "wrong" })
      ).rejects.toBeDefined();
    });
  });
});
