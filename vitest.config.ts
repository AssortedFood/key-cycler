import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include all test files in tests/ directory
    include: ['tests/**/*.test.ts'],
  },
});