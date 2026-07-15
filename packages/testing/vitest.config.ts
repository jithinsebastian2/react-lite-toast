/**
 * vitest.config.ts — @react-lite-toast/testing
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@react-lite-toast/testing',
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
