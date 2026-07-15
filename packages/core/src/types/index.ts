/**
 * @react-lite-toast/core — Public Type System
 *
 * This file is the single source of truth for ALL types in the library.
 * Every type is carefully designed for:
 *
 * 1. TypeScript strict mode compatibility
 * 2. Excellent IntelliSense (JSDoc comments on every type)
 * 3. Forward-compatibility (optional fields, extensible unions)
 * 4. No `any` — full type safety throughout
 *
 * Types are organised into logical groups:
 *   - Primitives (ID, type literals, position literals)
 *   - State machine (toast lifecycle states + transitions)
 *   - Configuration (options, defaults, container config)
 *   - Data models (CoreToast, ContainerState, StoreState)
 *   - Store contract (subscriber, selector, dispatch types)
 *   - Engine contract (public API surface types)
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unique identifier for a toast notification.
 * Branded as a string to prevent accidental coercion from numeric IDs.
 */
export type ToastId = string & { readonly __brand: 'ToastId' };

/**
 * Creates a typed ToastId from a plain string.
 * Used internally to create IDs; consumers receive ToastId from the engine.
 *
 * @internal
 */
export function toToastId(id: string): ToastId {
  return id as ToastId;
}

/**
 * All available toast notification types.
 * Each type maps to a default icon, color, and ARIA role.
 *
 * - `success` → green, checkmark, role="status"
 * - `error`   → red, X mark, role="alert"
 * - `warning` → amber, triangle, role="alert"
 * - `info`    → blue, info circle, role="status"
 * - `loading` → spinner (animated), role="status"
 * - `custom`  → no default icon, role="status"
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';

/**
 * Supported positions for toast containers.
 * `center` renders in the absolute center of the viewport.
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center';

/**
 * Available animation variants.
 * Each variant is implemented as a pure CSS animation.
 * `none` disables animation (useful for reduced-motion fallback).
 */
export type ToastAnimation = 'slide' | 'fade' | 'zoom' | 'flip' | 'bounce' | 'none';

/**
 * Available built-in themes.
 * Custom themes are applied via CSS variables.
 */
export type ToastTheme = 'light' | 'dark' | 'colored' | 'glass' | 'minimal' | 'custom';

/**
 * Stacking order for multiple toasts in a container.
 * - `newestOnTop` — new toasts appear above older ones (default)
 * - `oldestOnTop` — new toasts appear below older ones
 */
export type ToastStackOrder = 'newestOnTop' | 'oldestOnTop';

// ─────────────────────────────────────────────────────────────────────────────
// STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The complete set of states a toast notification can occupy.
 *
 * Lifecycle:
 *
 *   CREATED → QUEUED → VISIBLE → PAUSED → RESUMED → DISMISSING → REMOVED
 *
 * - CREATED   : Toast object has been constructed; not yet added to active list.
 * - QUEUED    : Waiting for a slot (queue limit reached); not yet visible.
 * - VISIBLE   : Currently displayed on screen; timer is running.
 * - PAUSED    : Timer suspended (user hover or programmatic pause).
 * - RESUMED   : Timer restarted after a pause; briefly in this state.
 * - DISMISSING: Exit animation running; about to be removed from DOM.
 * - REMOVED   : Fully removed; store entry will be purged on next cycle.
 *
 * Invalid transitions are silently rejected by the state machine.
 */
export type ToastLifecycleState =
  | 'CREATED'
  | 'QUEUED'
  | 'VISIBLE'
  | 'PAUSED'
  | 'RESUMED'
  | 'DISMISSING'
  | 'REMOVED';

/**
 * A valid transition between two lifecycle states.
 * Used by the state machine to validate state changes.
 *
 * @internal
 */
export type ToastStateTransition = {
  readonly from: ToastLifecycleState;
  readonly to: ToastLifecycleState;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options accepted by every toast call.
 * All fields are optional — the engine applies defaults for missing values.
 *
 * @example
 * ```typescript
 * toast.success('Saved!', {
 *   id: 'save-toast',
 *   duration: 3000,
 *   position: 'bottom-right',
 *   priority: 10,
 * });
 * ```
 */
export interface ToastOptions {
  /**
   * Explicit ID for deduplication or programmatic access.
   * If omitted, a unique ID is auto-generated.
   * Providing an existing ID replaces the existing toast (upsert behaviour).
   */
  readonly id?: ToastId | string;

  /** Toast type — controls icon, colour, and ARIA semantics. */
  readonly type?: ToastType;

  /** Where on the screen this toast appears. Default: 'top-right'. */
  readonly position?: ToastPosition;

  /**
   * Auto-dismiss duration in milliseconds.
   * Pass `false` to create a persistent toast that never auto-dismisses.
   * Default: 4000.
   */
  readonly duration?: number | false;

  /**
   * ID of the container this toast should render into.
   * Enables multiple independent toast regions on one page.
   * Default: uses the default container.
   */
  readonly containerId?: string;

  /**
   * Priority value for queue ordering.
   * Higher numbers appear earlier in the queue.
   * Default: 0.
   */
  readonly priority?: number;

  /**
   * Whether to show the countdown progress bar.
   * Default: true (when duration is not false).
   */
  readonly progressBar?: boolean;

  /**
   * Whether to show the close button.
   * Default: true.
   */
  readonly closeButton?: boolean;

  /**
   * Whether clicking the toast itself dismisses it.
   * Default: false.
   */
  readonly closeOnClick?: boolean;

  /**
   * Whether hovering over the toast pauses the auto-dismiss timer.
   * Default: true.
   */
  readonly pauseOnHover?: boolean;

  /**
   * Whether the toast pauses when the browser window loses focus.
   * Default: true.
   */
  readonly pauseOnWindowBlur?: boolean;

  /** Entry / exit animation variant. Default: 'slide'. */
  readonly animation?: ToastAnimation;

  /** Visual theme. Default: 'light'. */
  readonly theme?: ToastTheme;

  /**
   * Arbitrary metadata attached to the toast.
   * Not rendered — available in event callbacks and custom renderers.
   */
  readonly data?: Record<string, unknown>;

  /** Called when the toast becomes visible. */
  readonly onOpen?: (toast: CoreToast) => void;

  /** Called when the toast starts its dismiss animation. */
  readonly onClose?: (toast: CoreToast) => void;
}

/**
 * Global defaults applied to every toast unless overridden per-call.
 * Wraps a subset of ToastOptions that make sense as global configuration.
 */
export interface ToastDefaults {
  readonly position: ToastPosition;
  readonly duration: number | false;
  readonly animation: ToastAnimation;
  readonly theme: ToastTheme;
  readonly progressBar: boolean;
  readonly closeButton: boolean;
  readonly closeOnClick: boolean;
  readonly pauseOnHover: boolean;
  readonly pauseOnWindowBlur: boolean;
  readonly stackOrder: ToastStackOrder;
  /** Maximum number of toasts visible at one time per container. */
  readonly limit: number | false;
}

/**
 * Configuration for a toast container instance.
 * Each container is an independent viewport that can have its own
 * position, limit, theme, and queue.
 */
export interface ContainerConfig {
  /** Unique identifier for this container. Default container has id 'default'. */
  readonly id: string;
  readonly position?: ToastPosition;
  readonly limit?: number | false;
  readonly theme?: ToastTheme;
  readonly animation?: ToastAnimation;
  readonly stackOrder?: ToastStackOrder;
  /** Custom CSS class applied to the container root element. */
  readonly className?: string;
  /** Custom z-index override. */
  readonly zIndex?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE DATA MODELS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A fully resolved toast notification in the store.
 * All optional fields from ToastOptions have been resolved to concrete values.
 *
 * Immutable by convention — mutations happen via the store's dispatch mechanism.
 * Use `Readonly<CoreToast>` in consumers to enforce this.
 */
export interface CoreToast {
  /** Unique identifier — auto-generated or provided by consumer. */
  readonly id: ToastId;

  /** Resolved toast type. */
  readonly type: ToastType;

  /**
   * The toast message content.
   * Stored as unknown to remain framework-agnostic — React renders this
   * as ReactNode, but the core engine never imports React.
   */
  readonly content: unknown;

  /** Current lifecycle state. */
  readonly state: ToastLifecycleState;

  /** Resolved position. */
  readonly position: ToastPosition;

  /** Resolved auto-dismiss duration (ms) or false for persistent. */
  readonly duration: number | false;

  /** ID of the container that owns this toast. */
  readonly containerId: string;

  /** Resolved priority for queue ordering. */
  readonly priority: number;

  /** Unix timestamp (ms) when this toast was created. */
  readonly createdAt: number;

  /** Unix timestamp (ms) when this toast became visible. null if not yet visible. */
  readonly visibleAt: number | null;

  /** Remaining auto-dismiss time in ms. Used to resume after pause. */
  readonly remainingTime: number | false;

  /** Whether to show the progress bar. */
  readonly progressBar: boolean;

  /** Whether to show the close button. */
  readonly closeButton: boolean;

  /** Whether clicking dismisses the toast. */
  readonly closeOnClick: boolean;

  /** Whether hovering pauses the timer. */
  readonly pauseOnHover: boolean;

  /** Whether window blur pauses the timer. */
  readonly pauseOnWindowBlur: boolean;

  /** Entry/exit animation variant. */
  readonly animation: ToastAnimation;

  /** Visual theme. */
  readonly theme: ToastTheme;

  /** Arbitrary consumer-provided metadata. */
  readonly data: Record<string, unknown>;

  /** Called when the toast becomes visible. */
  readonly onOpen: ((toast: CoreToast) => void) | null;

  /** Called when the toast begins dismissing. */
  readonly onClose: ((toast: CoreToast) => void) | null;
}

/**
 * Partial update applied to an existing toast via toast.update().
 * All fields except `id` are optional — only specified fields change.
 */
export type CoreToastUpdate = Partial<Omit<CoreToast, 'id' | 'createdAt'>> & {
  readonly id: ToastId;
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE CONTRACT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The complete observable store state.
 * This is what `store.getState()` returns.
 */
export interface StoreState {
  /**
   * All active toasts, keyed by ToastId.
   * Includes toasts in QUEUED, VISIBLE, PAUSED, RESUMED, and DISMISSING states.
   * REMOVED toasts are purged from this map.
   */
  readonly toasts: ReadonlyMap<ToastId, CoreToast>;

  /**
   * All registered containers.
   * The 'default' container is always present.
   */
  readonly containers: ReadonlyMap<string, ContainerConfig>;

  /** The active global defaults. */
  readonly defaults: ToastDefaults;

  /** Whether the engine has been bootstrapped. */
  readonly bootstrapped: boolean;
}

/**
 * A subscriber function called whenever the selected slice of state changes.
 * Receives the new state snapshot.
 */
export type StoreSubscriber<T = StoreState> = (state: T) => void;

/**
 * A selector function that extracts a slice of state.
 * Used to prevent unnecessary re-renders when irrelevant state changes.
 *
 * @example
 * ```typescript
 * const selector = (state: StoreState) =>
 *   Array.from(state.toasts.values()).filter(t => t.position === 'top-right');
 * ```
 */
export type StoreSelector<T> = (state: StoreState) => T;

/**
 * A subscription handle returned by `store.subscribe()`.
 * Calling `unsubscribe()` removes the listener.
 */
export interface Subscription {
  readonly unsubscribe: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCH ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All actions that can be dispatched to the store.
 * Discriminated union — every action has a `type` field.
 *
 * This pattern (similar to Redux) makes state transitions predictable,
 * testable, and traceable (e.g. in devtools).
 */
export type StoreAction =
  | { readonly type: 'TOAST_ADD'; readonly payload: CoreToast }
  | { readonly type: 'TOAST_UPDATE'; readonly payload: CoreToastUpdate }
  | { readonly type: 'TOAST_DISMISS'; readonly payload: { readonly id: ToastId } }
  | { readonly type: 'TOAST_DISMISS_ALL'; readonly payload: { readonly containerId?: string } }
  | {
      readonly type: 'TOAST_TRANSITION';
      readonly payload: { readonly id: ToastId; readonly state: ToastLifecycleState };
    }
  | { readonly type: 'TOAST_REMOVE'; readonly payload: { readonly id: ToastId } }
  | { readonly type: 'TOAST_PAUSE'; readonly payload: { readonly id: ToastId } }
  | {
      readonly type: 'TOAST_RESUME';
      readonly payload: { readonly id: ToastId; readonly remainingTime?: number };
    }
  | { readonly type: 'CONTAINER_ADD'; readonly payload: ContainerConfig }
  | { readonly type: 'CONTAINER_REMOVE'; readonly payload: { readonly id: string } }
  | { readonly type: 'DEFAULTS_UPDATE'; readonly payload: Partial<ToastDefaults> }
  | { readonly type: 'BOOTSTRAP_COMPLETE' };

// ─────────────────────────────────────────────────────────────────────────────
// PROMISE API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Messages shown during each phase of a promise toast.
 * Each value can be a string, or a function that receives the result/error.
 */
export interface PromiseMessages<TData = unknown, TError = unknown> {
  readonly loading: string;
  readonly success: string | ((data: TData) => string);
  readonly error: string | ((error: TError) => string);
}

/**
 * Options specific to toast.promise().
 * Extends base ToastOptions — any base option applies to all three phases.
 */
export interface PromiseToastOptions<TData = unknown, TError = unknown>
  extends Omit<ToastOptions, 'type' | 'duration'> {
  readonly messages: PromiseMessages<TData, TError>;
  /** Duration of the success toast. Default: 3000ms. */
  readonly successDuration?: number | false;
  /** Duration of the error toast. Default: 4000ms. */
  readonly errorDuration?: number | false;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERSION
// ─────────────────────────────────────────────────────────────────────────────

/** The current version of the core package. Kept in sync with package.json. */
export const CORE_VERSION = '0.1.0' as const;
