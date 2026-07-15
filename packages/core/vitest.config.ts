/**
 * vitest.config.ts — @react-lite-toast/core
 *
 * Uses 'node' environment since the core engine is framework-agnostic
 * and must NOT import any browser APIs. Tests that rely on browser globals
 * (window, document) would indicate an architecture violation.
 *
 * Coverage thresholds are set to 95% — the enterprise standard for
 * production library code.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@react-lite-toast/core',

    // Node environment enforces no accidental browser API usage in core.
    environment: 'node',

    // Enable globals (describe, it, expect) without explicit imports.
    globals: true,

    // All test files in the core package
    include: ['src/**/*.{test,spec}.ts'],

    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/tests/**',
        'src/index.ts', // barrel exports — not meaningful to cover
      ],
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
