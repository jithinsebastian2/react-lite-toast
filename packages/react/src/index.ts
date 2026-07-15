/**
 * @react-lite-toast/react
 *
 * React renderer, components, and hooks for react-lite-toast.
 *
 * This package provides everything needed to render toasts in a React
 * application. It depends on @react-lite-toast/core for the state engine
 * and extends it with:
 *
 * - Bootstrap: auto-mounting via ReactDOM.createRoot (Phase 4)
 * - Renderer: React root management (Phase 7)
 * - Portal: DOM portal for overlay rendering (Phase 7)
 * - Hooks: useToast, useToastQueue (Phase 14)
 * - Components: Toast, ToastContainer, ProgressBar, etc. (Phase 8)
 * - Styles: CSS variables + animation system (Phase 9)
 * - Accessibility: ARIA, keyboard nav (Phase 10)
 *
 * All types from @react-lite-toast/core are re-exported here so consumers
 * only need to import from @react-lite-toast/react (or react-lite-toast).
 */

// ─── Re-export all core types for consumer convenience ────────────────────────
export type {
  ToastId,
  ToastType,
  ToastPosition,
  ToastAnimation,
  ToastTheme,
  ToastStackOrder,
  ToastLifecycleState,
  ToastOptions,
  ToastDefaults,
  ContainerConfig,
  CoreToast,
  CoreToastUpdate,
  StoreState,
  StoreSubscriber,
  StoreSelector,
  Subscription,
  StoreAction,
  PromiseMessages,
  PromiseToastOptions,
} from '@react-lite-toast/core';

// ─── Re-export core constants ─────────────────────────────────────────────────
export {
  CORE_VERSION,
  ENGINE_SINGLETON_KEY,
  DEFAULT_CONTAINER_ID,
  PORTAL_ROOT_ID,
  DEFAULT_DURATION_MS,
  DEFAULT_POSITION,
  DEFAULT_TOAST_DEFAULTS,
  toToastId,
} from '@react-lite-toast/core';

// ─── Package version ──────────────────────────────────────────────────────────
export const REACT_PACKAGE_VERSION = '0.1.0' as const;

/**
 * Placeholder: The `toast` API object will be exported here in Phase 5.
 *
 * Final API (for reference):
 *
 * ```typescript
 * import { toast } from '@react-lite-toast/react';
 *
 * toast.success('Saved!');
 * toast.error('Something went wrong');
 * toast.promise(fetch('/api'), { messages: { loading: '...', success: 'Done', error: 'Failed' } });
 * toast.dismiss(id);
 * toast.dismissAll();
 * ```
 */
// ─── Re-export toast dispatcher API ──────────────────────────────────────────
export { toast } from '@react-lite-toast/core';

// ─── Renderer Management (Phase 4) ───────────────────────────────────────────
export { Renderer } from './core/Renderer';
import { bootstrap, unmount } from './core/Mount';
export { bootstrap, unmount };

// ─── Zero-Config Auto-Registration ───────────────────────────────────────────
import { getEngineRegistry, isBrowser } from '@react-lite-toast/core';

if (isBrowser()) {
  const registry = getEngineRegistry();
  if (!registry.bootstrap) {
    registry.bootstrap = bootstrap;
  }
}

// ─── Component Exports (Phase 8) ─────────────────────────────────────────────
export { ToastContainer } from './components/ToastContainer';
export { Toast } from './components/Toast';
export { CloseButton } from './components/CloseButton';
export { ProgressBar } from './components/ProgressBar';
export type { ToastContainerProps } from './components/ToastContainer';
export type { ToastProps } from './components/Toast';
export type { CloseButtonProps } from './components/CloseButton';
export type { ProgressBarProps } from './components/ProgressBar';

