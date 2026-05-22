import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../../src/services/authService";

// Mock the User model — we test the service logic, not Mongoose internals
vi.mock("../../src/models/User", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

import { User } from "../../src/models/User";
import bcrypt from "bcryptjs";

const mockUser = {
  _id: { toString: () => "user-id-123" },
  name: "Test User",
  email: "test@example.com",
  password: "hashed-password",
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("creates a user and returns a token", async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);

      const result = await authService.registerUser({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
    });

    it("throws DUPLICATE_EMAIL if email already exists", async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

      await expect(
        authService.registerUser({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow("DUPLICATE_EMAIL");
    });
  });

  describe("loginUser", () => {
    it("returns token and user on valid credentials", async () => {
      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.loginUser({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
    });

    it("throws INVALID_CREDENTIALS if user not found", async () => {
      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        authService.loginUser({ email: "nobody@example.com", password: "pw" })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("throws INVALID_CREDENTIALS if password does not match", async () => {
      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.loginUser({ email: "test@example.com", password: "wrong" })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });
  });
});
