import { ENGINE_SINGLETON_KEY } from '../index';
import { ObservableStore } from './Store';
import { setupQueueScheduler } from './Queue';

/**
 * Global registry structure stored on globalThis[ENGINE_SINGLETON_KEY].
 *
 * This ensures that even if multiple bundles are loaded, they all share:
 * 1. The same observable state store.
 * 2. The same mounted React root instance (avoiding duplicate containers).
 */
export interface GlobalEngineRegistry {
  store: ObservableStore;
  mounted: boolean;
  root: unknown | null;
  bootstrap?: () => boolean;
  nextId?: number;
}

/**
 * Returns the global engine registry, initializing it if it doesn't exist.
 * Safe to call in both browser and Server-Side Rendering (SSR) environments.
 */
export function getEngineRegistry(): GlobalEngineRegistry {
  const globalObj = globalThis as {
    [ENGINE_SINGLETON_KEY]?: GlobalEngineRegistry;
  };

  if (!globalObj[ENGINE_SINGLETON_KEY]) {
    const store = new ObservableStore();
    globalObj[ENGINE_SINGLETON_KEY] = {
      store,
      mounted: false,
      root: null,
      nextId: 0,
    };
    setupQueueScheduler(store);
  }

  return globalObj[ENGINE_SINGLETON_KEY];
}

/**
 * Checks if the code is running in a browser environment.
 * Safe for SSR environments.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
