/**
 * Test setup — @react-lite-toast/react
 *
 * Runs before every test file in this package.
 *
 * 1. @testing-library/jest-dom — extends Vitest's `expect` with DOM matchers:
 *    toBeInTheDocument(), toHaveTextContent(), toBeVisible(), etc.
 *
 * 2. Cleanup — React Testing Library automatically cleans up after each test
 *    when `afterEach(cleanup)` is called. With globals: true in vitest config,
 *    RTL auto-detects the test framework and registers cleanup automatically.
 *
 * 3. ResizeObserver mock — jsdom does not implement ResizeObserver.
 *    Some layout-related tests may need it; we provide a minimal no-op mock.
 *
 * 4. matchMedia mock — jsdom does not implement window.matchMedia.
 *    Required for reduced-motion detection in animation tests.
 */
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically clean up React renders after each test
afterEach(() => {
  cleanup();
});

// ─── Browser API Mocks ────────────────────────────────────────────────────────

/**
 * ResizeObserver mock
 * jsdom does not implement ResizeObserver. This no-op mock prevents
 * "ResizeObserver is not defined" errors in component tests.
 */
class ResizeObserverMock {
  observe(): void {
    // no-op
  }
  unobserve(): void {
    // no-op
  }
  disconnect(): void {
    // no-op
  }
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

/**
 * matchMedia mock
 * jsdom does not implement window.matchMedia. We return a mock that
 * defaults to not matching (prefers-reduced-motion: no-preference).
 *
 * Individual tests can override this via vi.spyOn() to test reduced-motion.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
