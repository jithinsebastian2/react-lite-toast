/**
 * @react-lite-toast/core
 *
 * Framework-agnostic engine for react-lite-toast.
 *
 * This package contains ZERO React dependencies. It can theoretically power
 * any renderer (React, Vue, Svelte, vanilla JS). The React-specific rendering
 * layer lives in @react-lite-toast/react.
 *
 * What this package exports:
 *   - The complete TypeScript type system
 *   - Constants and utilities
 *
 * What gets added in subsequent phases:
 *   - Phase 3: Observable Store
 *   - Phase 4: Bootstrap Engine + Singleton
 *   - Phase 5: Toast Engine (public API dispatcher)
 *   - Phase 6: Queue System
 *   - Phase 7: Timer + Lifecycle state machine
 */

// ─── Type System (complete, available from Phase 1) ──────────────────────────
export type {
  ToastId,
  ToastType,
  ToastPosition,
  ToastAnimation,
  ToastTheme,
  ToastStackOrder,
  ToastLifecycleState,
  ToastStateTransition,
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
} from './types/index';

// ─── Utilities (available from Phase 1) ──────────────────────────────────────
export { toToastId } from './types/index';
export { ObservableStore } from './core/Store';

// ─── Constants ───────────────────────────────────────────────────────────────
export { CORE_VERSION } from './types/index';

/**
 * The unique global symbol used to store the engine singleton on globalThis.
 *
 * WHY Symbol.for() instead of Symbol()?
 * Symbol.for(key) always returns the same symbol for a given key across ALL
 * module instances in the same JavaScript runtime. This is critical for:
 *
 * 1. Module Federation / micro-frontends — multiple copies of the bundle
 *    may be loaded. Symbol.for() ensures they share one engine instance.
 *
 * 2. Duplicate package installs — if react-lite-toast appears in multiple
 *    node_modules (version conflicts), Symbol.for() still bridges them.
 *
 * 3. HMR (Hot Module Replacement) — dev server re-evaluates modules but
 *    the global symbol persists, preserving toast state during hot reloads.
 *
 * The version suffix (`_v1`) allows future breaking changes to the engine
 * contract without conflicting with older instances.
 */
export const ENGINE_SINGLETON_KEY = Symbol.for(
  '__REACT_LITE_TOAST_ENGINE_v1__',
);

/**
 * The default container ID used when no containerId is specified.
 */
export const DEFAULT_CONTAINER_ID = 'default' as const;

/**
 * The DOM element ID created by the bootstrap process.
 */
export const PORTAL_ROOT_ID = 'react-lite-toast-root' as const;

/**
 * Fallback auto-dismiss duration when no duration is configured.
 */
export const DEFAULT_DURATION_MS = 4000 as const;

/**
 * Default toast position.
 */
export const DEFAULT_POSITION: ToastPosition = 'top-right';

/**
 * The default global configuration applied to every toast.
 * Consumers can override any field via `toast.defaults()`.
 */
export const DEFAULT_TOAST_DEFAULTS: ToastDefaults = {
  position: DEFAULT_POSITION,
  duration: DEFAULT_DURATION_MS,
  animation: 'slide',
  theme: 'light',
  progressBar: true,
  closeButton: true,
  closeOnClick: false,
  pauseOnHover: true,
  pauseOnWindowBlur: true,
  stackOrder: 'newestOnTop',
  limit: false,
} as const;

// Re-export type alias for convenience
import type { ToastPosition, ToastDefaults } from './types/index';
