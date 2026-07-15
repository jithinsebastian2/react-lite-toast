import type { ObservableStore } from './Store';
import type { Subscription } from '../types/index';

/**
 * setupQueueScheduler
 *
 * A reactive queue manager that subscribes to the ObservableStore.
 * Whenever the store state changes, it checks if any containers have available
 * slots and promotes the highest priority queued toasts into the VISIBLE state.
 */
export function setupQueueScheduler(store: ObservableStore): Subscription {
  let isProcessing = false;

  const checkAndPromote = (): void => {
    if (isProcessing) {
      return;
    }

    const state = store.getState();

    // 1. Gather all active container IDs in the store
    const containerIds = new Set<string>([
      ...Array.from(state.containers.keys()),
      ...Array.from(state.toasts.values()).map((t) => t.containerId),
    ]);

    store.batch(() => {
      isProcessing = true;
      try {
        for (const containerId of containerIds) {
          const containerConfig = state.containers.get(containerId);
          const limit = containerConfig?.limit ?? state.defaults.limit;

          // 2. Fetch all queued toasts for this container
          const queuedToasts = Array.from(state.toasts.values())
            .filter((t) => t.containerId === containerId && t.state === 'QUEUED')
            .sort((a, b) => {
              // Priority descending (higher number = higher priority)
              if (b.priority !== a.priority) {
                return b.priority - a.priority;
              }
              // FIFO ascending (older created time = promoted first)
              return a.createdAt - b.createdAt;
            });

          if (queuedToasts.length === 0) {
            continue;
          }

          if (limit === false) {
            // No limit: promote all queued toasts immediately
            for (const t of queuedToasts) {
              store.dispatch({
                type: 'TOAST_TRANSITION',
                payload: { id: t.id, state: 'VISIBLE' },
              });
            }
          } else {
            // 3. Count active visible toasts (VISIBLE, PAUSED, RESUMED)
            // Note: DISMISSING toasts are not counted, allowing next toast to immediately slide in
            const activeCount = Array.from(state.toasts.values()).filter(
              (t) =>
                t.containerId === containerId &&
                (t.state === 'VISIBLE' || t.state === 'PAUSED' || t.state === 'RESUMED'),
            ).length;

            const slotsAvailable = limit - activeCount;
            if (slotsAvailable > 0) {
              const toPromote = queuedToasts.slice(0, slotsAvailable);
              for (const t of toPromote) {
                store.dispatch({
                  type: 'TOAST_TRANSITION',
                  payload: { id: t.id, state: 'VISIBLE' },
                });
              }
            }
          }
        }
      } finally {
        isProcessing = false;
      }
    });
  };

  return store.subscribe(checkAndPromote);
}
