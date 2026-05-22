import { vi } from "vitest";

// Mock mongoose entirely so tests run without a real MongoDB connection.
// Each test that needs model behaviour mocks it individually.
vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
});

// Set required env vars for all tests
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.JWT_SECRET = "test-secret-key-for-testing-only";
process.env.JWT_EXPIRES_IN = "1h";
