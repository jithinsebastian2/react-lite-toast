import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';
import { getEngineRegistry } from '@react-lite-toast/core';

/**
 * ToastContainer (Stub / Core Binding)
 *
 * This is the central component of react-lite-toast. It is automatically mounted
 * inside the portal root. It subscribes to the ObservableStore and renders active toasts.
 *
 * In Phase 8 (Components), this component will be fully implemented with viewport
 * positioning, transitions, and accessibility features.
 */
export function ToastContainer(): ReactElement | null {
  const { store } = getEngineRegistry();

  // Subscribe to the store. Only rerenders when the store state changes.
  const state = useSyncExternalStore(
    (onStoreChange) => {
      const subscription = store.subscribe(onStoreChange);
      return () => subscription.unsubscribe();
    },
    store.getState,
    // Server snapshot for SSR hydration compatibility
    store.getState,
  );

  const activeToasts = Array.from(state.toasts.values());

  if (activeToasts.length === 0 && !state.bootstrapped) {
    return null;
  }

  return (
    <div
      id="react-lite-toast-container-root"
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        inset: 0,
      }}
    >
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          style={{
            pointerEvents: 'auto',
            background: 'white',
            color: 'black',
            padding: '12px 24px',
            margin: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {String(toast.content)}
        </div>
      ))}
    </div>
  );
}
export default ToastContainer;
