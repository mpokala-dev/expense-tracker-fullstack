import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock axios so no real HTTP calls are made in frontend tests.
// Individual tests override these mocks as needed.
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));
