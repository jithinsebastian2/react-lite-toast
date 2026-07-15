import { useSyncExternalStore, useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { getEngineRegistry, PORTAL_ROOT_ID } from '@react-lite-toast/core';
import type {
  ToastPosition,
  ToastTheme,
  ToastAnimation,
  ToastStackOrder,
} from '@react-lite-toast/core';

export interface ToastContainerProps {
  id?: string;
  position?: ToastPosition;
  limit?: number | false;
  theme?: ToastTheme;
  animation?: ToastAnimation;
  stackOrder?: ToastStackOrder;
  className?: string;
  zIndex?: number;
}

/**
 * ToastContainer (React Renderer & Portal)
 *
 * This is the central rendering component of react-lite-toast. It can be:
 * 1. Auto-bootstrapped (provider-less mounting via Renderer.bootstrap()).
 * 2. Manually mounted in the React tree (allowing context inheritance).
 *
 * It subscribes to the store, registers container options dynamically,
 * and portals the visual elements to document.body for layout isolation.
 */
export function ToastContainer({
  id = 'default',
  position,
  limit,
  theme,
  animation,
  stackOrder,
  className,
  zIndex,
}: ToastContainerProps = {}): ReactElement | null {
  const { store } = getEngineRegistry();

  // SSR hydration safety state
  const [mounted, setMounted] = useState(false);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

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

  useEffect(() => {
    setMounted(true);

    // Find or create portal target element in the DOM
    const targetId = id === 'default' ? PORTAL_ROOT_ID : `react-lite-toast-container-${id}`;
    let el = document.getElementById(targetId);
    if (!el) {
      el = document.createElement('div');
      el.id = targetId;
      document.body.appendChild(el);
    }
    setContainerEl(el);

    // Dynamic container registration with the core store
    const payload = {
      id,
      ...(position !== undefined ? { position } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(animation !== undefined ? { animation } : {}),
      ...(stackOrder !== undefined ? { stackOrder } : {}),
      ...(className !== undefined ? { className } : {}),
      ...(zIndex !== undefined ? { zIndex } : {}),
    };

    store.dispatch({
      type: 'CONTAINER_ADD',
      payload,
    });

    return () => {
      store.dispatch({
        type: 'CONTAINER_REMOVE',
        payload: { id },
      });
      // Clean up DOM node on manual container unmount (unless it is the main portal root)
      if (id !== 'default') {
        const domNode = document.getElementById(targetId);
        if (domNode) {
          domNode.remove();
        }
      }
    };
  }, [store, id, position, limit, theme, animation, stackOrder, className, zIndex]);

  // Prevent SSR hydration mismatch warning by rendering nothing on server
  if (!mounted || !containerEl) {
    return null;
  }

  // Filter to only render toasts owned by this container instance
  const activeToasts = Array.from(state.toasts.values()).filter(
    (toast) => toast.containerId === id && toast.state !== 'REMOVED',
  );

  const content = (
    <div
      className={className}
      style={{
        position: 'fixed',
        zIndex: zIndex ?? 9999,
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

  return createPortal(content, containerEl);
}

export default ToastContainer;
