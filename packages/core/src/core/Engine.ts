import { getEngineRegistry } from './Bootstrap';
import {
  DEFAULT_CONTAINER_ID,
} from '../index';
import { toToastId } from '../types/index';
import type {
  ToastId,
  ToastOptions,
  ToastDefaults,
  CoreToast,
  CoreToastUpdate,
  PromiseMessages,
  PromiseToastOptions,
} from '../types/index';

/**
 * Toast Dispatcher Engine
 *
 * This file implements the core dispatcher that users interact with.
 * It is completely framework-agnostic.
 */

// Global counter fallback if not set
function generateId(): ToastId {
  const registry = getEngineRegistry();
  const nextId = (registry.nextId ?? 0) + 1;
  registry.nextId = nextId;
  return toToastId(`toast-${nextId}`);
}

/**
 * Main toast dispatcher function.
 */
function createToast(content: unknown, options?: ToastOptions): ToastId {
  const registry = getEngineRegistry();
  const defaults = registry.store.getState().defaults;
  const containerId = options?.containerId ?? DEFAULT_CONTAINER_ID;
  const containerConfig = registry.store.getState().containers.get(containerId);

  // Merge options with defaults and container-specific configurations
  const id = options?.id ? toToastId(String(options.id)) : generateId();
  const position = options?.position ?? containerConfig?.position ?? defaults.position;
  const theme = options?.theme ?? containerConfig?.theme ?? defaults.theme;
  const animation = options?.animation ?? containerConfig?.animation ?? defaults.animation;
  const duration = options?.duration !== undefined ? options.duration : defaults.duration;

  const progressBar = options?.progressBar !== undefined ? options.progressBar : defaults.progressBar;
  const closeButton = options?.closeButton !== undefined ? options.closeButton : defaults.closeButton;
  const closeOnClick = options?.closeOnClick !== undefined ? options.closeOnClick : defaults.closeOnClick;
  const pauseOnHover = options?.pauseOnHover !== undefined ? options.pauseOnHover : defaults.pauseOnHover;
  const pauseOnWindowBlur = options?.pauseOnWindowBlur !== undefined ? options.pauseOnWindowBlur : defaults.pauseOnWindowBlur;

  const priority = options?.priority ?? 0;

  // Determine existing state if any, or compute based on limit constraints
  const existing = registry.store.getState().toasts.get(id);
  let resolvedState: 'VISIBLE' | 'QUEUED' = 'VISIBLE';
  let visibleAt: number | null = null;

  if (existing) {
    resolvedState = existing.state as 'VISIBLE' | 'QUEUED';
    visibleAt = existing.visibleAt;
  } else {
    const limit = containerConfig?.limit ?? defaults.limit;
    if (limit !== false) {
      const activeCount = Array.from(registry.store.getState().toasts.values()).filter(
        (t) =>
          t.containerId === containerId &&
          (t.state === 'VISIBLE' || t.state === 'PAUSED' || t.state === 'RESUMED'),
      ).length;

      if (activeCount >= limit) {
        resolvedState = 'QUEUED';
      }
    }
    visibleAt = resolvedState === 'VISIBLE' ? Date.now() : null;
  }

  const newToast: CoreToast = {
    id,
    type: options?.type ?? 'info',
    content,
    state: resolvedState,
    position,
    duration,
    containerId,
    priority,
    createdAt: existing ? existing.createdAt : Date.now(),
    visibleAt,
    remainingTime: duration,
    progressBar,
    closeButton,
    closeOnClick,
    pauseOnHover,
    pauseOnWindowBlur,
    animation,
    theme,
    data: options?.data ?? {},
    onOpen: options?.onOpen ?? null,
    onClose: options?.onClose ?? null,
  };

  // If there's an existing toast with this ID, update it instead of adding
  if (existing) {
    const updatePayload: CoreToastUpdate = {
      ...newToast,
      id,
    };
    registry.store.dispatch({ type: 'TOAST_UPDATE', payload: updatePayload });
  } else {
    registry.store.dispatch({ type: 'TOAST_ADD', payload: newToast });
  }

  // Trigger lazy bootstrap if registered and running in a browser
  if (registry.bootstrap) {
    try {
      registry.bootstrap();
    } catch (err) {
      console.error('Failed to trigger bootstrap from toast dispatcher:', err);
    }
  }

  // Trigger onOpen callback
  if (newToast.onOpen) {
    try {
      newToast.onOpen(newToast);
    } catch (err) {
      console.error('Error in toast onOpen callback:', err);
    }
  }

  return id;
}

/**
 * Public dispatch interface.
 */
export const toast = Object.assign(
  (content: unknown, options?: ToastOptions): ToastId => {
    return createToast(content, options);
  },
  {
    success(content: unknown, options?: Omit<ToastOptions, 'type'>): ToastId {
      return createToast(content, { ...options, type: 'success' });
    },

    error(content: unknown, options?: Omit<ToastOptions, 'type'>): ToastId {
      return createToast(content, { ...options, type: 'error' });
    },

    warning(content: unknown, options?: Omit<ToastOptions, 'type'>): ToastId {
      return createToast(content, { ...options, type: 'warning' });
    },

    info(content: unknown, options?: Omit<ToastOptions, 'type'>): ToastId {
      return createToast(content, { ...options, type: 'info' });
    },

    loading(
      content: unknown,
      options?: Omit<ToastOptions, 'type' | 'duration' | 'progressBar'>,
    ): ToastId {
      return createToast(content, {
        ...options,
        type: 'loading',
        duration: false,
        progressBar: false,
      });
    },

    custom(content: unknown, options?: Omit<ToastOptions, 'type'>): ToastId {
      return createToast(content, { ...options, type: 'custom' });
    },

    dismiss(id: ToastId | string): void {
      const registry = getEngineRegistry();
      const typedId = toToastId(String(id));
      const toastItem = registry.store.getState().toasts.get(typedId);

      if (toastItem) {
        if (toastItem.state === 'DISMISSING' || toastItem.state === 'REMOVED') {
          return;
        }

        registry.store.dispatch({ type: 'TOAST_DISMISS', payload: { id: typedId } });

        if (toastItem.onClose) {
          try {
            toastItem.onClose(toastItem);
          } catch (err) {
            console.error('Error in toast onClose callback:', err);
          }
        }
      }
    },

    dismissAll(containerId?: string): void {
      const registry = getEngineRegistry();
      const toasts = registry.store.getState().toasts;

      registry.store.batch(() => {
        for (const [id, toastItem] of toasts) {
          if (!containerId || toastItem.containerId === containerId) {
            if (toastItem.state !== 'DISMISSING' && toastItem.state !== 'REMOVED') {
              registry.store.dispatch({ type: 'TOAST_DISMISS', payload: { id } });

              if (toastItem.onClose) {
                try {
                  toastItem.onClose(toastItem);
                } catch (err) {
                  console.error('Error in toast onClose callback:', err);
                }
              }
            }
          }
        }
      });
    },

    update(
      id: ToastId | string,
      options: Partial<Omit<ToastOptions, 'id' | 'createdAt'>> & { content?: unknown },
    ): void {
      const registry = getEngineRegistry();
      const typedId = toToastId(String(id));

      const existing = registry.store.getState().toasts.get(typedId);
      if (existing) {
        const payload: CoreToastUpdate = {
          ...options,
          id: typedId,
        };
        registry.store.dispatch({ type: 'TOAST_UPDATE', payload });
      }
    },

    defaults(options: Partial<ToastDefaults>): void {
      const registry = getEngineRegistry();
      registry.store.dispatch({ type: 'DEFAULTS_UPDATE', payload: options });
    },

    promise<TData = unknown, TError = unknown>(
      promiseOrFn: Promise<TData> | (() => Promise<TData>),
      messages: PromiseMessages<TData, TError>,
      options?: PromiseToastOptions<TData, TError>,
    ): ToastId {
      const resolvedPromise =
        typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;

      const id = toast.loading(messages.loading, {
        ...options,
      });

      resolvedPromise
        .then((data) => {
          const content =
            typeof messages.success === 'function'
              ? messages.success(data)
              : messages.success;

          const updateOpts = {
            type: 'success' as const,
            content,
            progressBar: true,
            ...(options?.successDuration !== undefined ? { duration: options.successDuration } : {}),
          };

          toast.update(id, updateOpts);
        })
        .catch((error) => {
          const content =
            typeof messages.error === 'function'
              ? messages.error(error)
              : messages.error;

          const updateOpts = {
            type: 'error' as const,
            content,
            progressBar: true,
            ...(options?.errorDuration !== undefined ? { duration: options.errorDuration } : {}),
          };

          toast.update(id, updateOpts);
        });

      return id;
    },
  },
);
