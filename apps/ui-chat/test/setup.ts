import { vi } from "vitest";

// Mock crypto.randomUUID for consistent test results
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid-1234"),
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
