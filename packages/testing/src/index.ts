/**
 * @react-lite-toast/testing
 *
 * Testing utilities for react-lite-toast.
 *
 * Provides:
 *   - Custom Vitest/Jest matchers (toBeToast, toHaveToastMessage, etc.)
 *   - Preconfigured render helpers (renderWithToast)
 *   - Store mocking utilities (createMockStore, createMockToast)
 *   - Timer helpers (fastForwardTimers, drainQueue)
 *   - Accessibility testing helpers (checkToastA11y)
 *
 * Usage:
 *   import { createMockToast, renderWithToast } from '@react-lite-toast/testing';
 *
 * Full implementation in Phase 17 (Testing Package + Test Suite).
 */

export const TESTING_VERSION = '0.1.0' as const;

/**
 * Placeholder for the mock store factory.
 * Implementation comes in Phase 17.
 */
export type MockStoreOptions = {
  readonly initialToasts?: unknown[];
};
