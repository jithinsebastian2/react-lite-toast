/**
 * vitest.config.ts — @react-lite-toast/react
 *
 * Uses 'jsdom' environment to simulate browser APIs needed for:
 * - ReactDOM.createRoot()
 * - document.createElement()
 * - MutationObserver
 * - ResizeObserver
 * - window events (focus, blur)
 *
 * Setup file imports @testing-library/jest-dom for custom matchers
 * like toBeInTheDocument(), toHaveTextContent(), etc.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    name: '@react-lite-toast/react',

    // jsdom provides browser-like DOM APIs needed for React rendering
    environment: 'jsdom',

    // Enable globals so describe/it/expect work without imports
    globals: true,

    // Setup file runs before each test file
    setupFiles: ['./src/tests/setup.ts'],

    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/tests/**',
        'src/index.ts',
        'src/**/*.stories.{ts,tsx}',
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
