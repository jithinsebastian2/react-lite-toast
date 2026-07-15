import type {
  StoreState,
  StoreSubscriber,
  StoreSelector,
  Subscription,
  StoreAction,
  CoreToast,
} from '../types/index';
import { DEFAULT_TOAST_DEFAULTS } from '../index';

/**
 * ObservableStore
 *
 * A high-performance, framework-agnostic observable store.
 * Implements the core state management for react-lite-toast.
 *
 * Design Decisions:
 * - Map for toasts: O(1) insertion, deletion, and lookup.
 * - Map for containers: supports multiple viewports out-of-the-box.
 * - Selection/Slice subscriptions: prevents unnecessary React rerenders by only
 *   calling subscribers when their selected slice changes.
 * - Batching: coalesces multiple state changes (e.g., dismissing all toasts)
 *   into a single notify commit, avoiding layout thrashing in the UI.
 * - Deep immutability: returns new Map references on updates to trigger
 *   React's shallow equality check (e.g. useSyncExternalStore).
 */
export class ObservableStore {
  private state: StoreState;
  private subscribers = new Set<StoreSubscriber>();
  private batchDepth = 0;
  private hasPendingNotifications = false;

  constructor(initialState?: Partial<StoreState>) {
    this.state = {
      toasts: initialState?.toasts ?? new Map(),
      containers: initialState?.containers ?? new Map(),
      defaults: initialState?.defaults ?? { ...DEFAULT_TOAST_DEFAULTS },
      bootstrapped: initialState?.bootstrapped ?? false,
    };
  }

  /**
   * Returns the current state snapshot.
   */
  public getState = (): StoreState => {
    return this.state;
  };

  /**
   * Directly sets the state and notifies subscribers unless batched.
   */
  public setState = (
    nextStateOrUpdater:
      | Partial<StoreState>
      | ((state: StoreState) => Partial<StoreState>),
  ): void => {
    const nextPartial =
      typeof nextStateOrUpdater === 'function'
        ? nextStateOrUpdater(this.state)
        : nextStateOrUpdater;

    this.state = {
      toasts: nextPartial.toasts ?? this.state.toasts,
      containers: nextPartial.containers ?? this.state.containers,
      defaults: nextPartial.defaults ?? this.state.defaults,
      bootstrapped: nextPartial.bootstrapped ?? this.state.bootstrapped,
    };

    if (this.batchDepth > 0) {
      this.hasPendingNotifications = true;
    } else {
      this.notify();
    }
  };

  /**
   * Subscribes a callback to all store state changes.
   */
  public subscribe = (subscriber: StoreSubscriber): Subscription => {
    this.subscribers.add(subscriber);
    return {
      unsubscribe: () => {
        this.unsubscribe(subscriber);
      },
    };
  };

  /**
   * Unsubscribes a callback from store state changes.
   */
  public unsubscribe = (subscriber: StoreSubscriber): void => {
    this.subscribers.delete(subscriber);
  };

  /**
   * Subscribes to a specific slice of the store state.
   * Subscriber is only notified if the selected slice changes (reference equality check).
   */
  public selector = <T>(
    selectFn: StoreSelector<T>,
    subscriber: StoreSubscriber<T>,
  ): Subscription => {
    let lastSelectedValue = selectFn(this.state);

    const checkUpdate = (newState: StoreState) => {
      const nextSelectedValue = selectFn(newState);
      if (!Object.is(lastSelectedValue, nextSelectedValue)) {
        lastSelectedValue = nextSelectedValue;
        subscriber(nextSelectedValue);
      }
    };

    return this.subscribe(checkUpdate);
  };

  /**
   * Coalesces multiple state updates into a single notification.
   */
  public batch = (cb: () => void): void => {
    this.batchDepth++;
    try {
      cb();
    } finally {
      this.batchDepth--;
      if (this.batchDepth === 0 && this.hasPendingNotifications) {
        this.hasPendingNotifications = false;
        this.notify();
      }
    }
  };

  /**
   * Triggers all subscribed callbacks with the current state.
   */
  public notify = (): void => {
    const currentState = this.state;
    for (const subscriber of this.subscribers) {
      subscriber(currentState);
    }
  };

  /**
   * Dispatches an action to mutate state in a predictable way.
   */
  public dispatch = (action: StoreAction): void => {
    switch (action.type) {
      case 'TOAST_ADD': {
        const newToasts = new Map(this.state.toasts);
        newToasts.set(action.payload.id, action.payload);
        this.setState({ toasts: newToasts });
        break;
      }

      case 'TOAST_UPDATE': {
        const newToasts = new Map(this.state.toasts);
        const existing = newToasts.get(action.payload.id);
        if (existing) {
          const updated: CoreToast = {
            ...existing,
            ...action.payload,
            // ID, createdAt cannot be mutated
            id: existing.id,
            createdAt: existing.createdAt,
          };
          newToasts.set(action.payload.id, updated);
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'TOAST_DISMISS': {
        const newToasts = new Map(this.state.toasts);
        const existing = newToasts.get(action.payload.id);
        if (existing && existing.state !== 'DISMISSING' && existing.state !== 'REMOVED') {
          newToasts.set(action.payload.id, {
            ...existing,
            state: 'DISMISSING',
          });
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'TOAST_DISMISS_ALL': {
        const containerId = action.payload.containerId;
        const newToasts = new Map(this.state.toasts);
        let updated = false;

        for (const [id, toast] of newToasts) {
          if (!containerId || toast.containerId === containerId) {
            if (toast.state !== 'DISMISSING' && toast.state !== 'REMOVED') {
              newToasts.set(id, {
                ...toast,
                state: 'DISMISSING',
              });
              updated = true;
            }
          }
        }

        if (updated) {
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'TOAST_TRANSITION': {
        const newToasts = new Map(this.state.toasts);
        const existing = newToasts.get(action.payload.id);
        if (existing) {
          const visibleAt =
            action.payload.state === 'VISIBLE' && existing.visibleAt === null
              ? Date.now()
              : existing.visibleAt;
          newToasts.set(action.payload.id, {
            ...existing,
            state: action.payload.state,
            visibleAt,
          });
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'TOAST_REMOVE': {
        const newToasts = new Map(this.state.toasts);
        if (newToasts.delete(action.payload.id)) {
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'TOAST_PAUSE': {
        const newToasts = new Map(this.state.toasts);
        const existing = newToasts.get(action.payload.id);
        if (existing?.state === 'VISIBLE') {
          newToasts.set(action.payload.id, {
            ...existing,
            state: 'PAUSED',
          });
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'TOAST_RESUME': {
        const newToasts = new Map(this.state.toasts);
        const existing = newToasts.get(action.payload.id);
        if (existing?.state === 'PAUSED') {
          newToasts.set(action.payload.id, {
            ...existing,
            state: 'RESUMED',
            remainingTime: action.payload.remainingTime ?? existing.remainingTime,
          });
          this.setState({ toasts: newToasts });
        }
        break;
      }

      case 'CONTAINER_ADD': {
        const newContainers = new Map(this.state.containers);
        newContainers.set(action.payload.id, action.payload);
        this.setState({ containers: newContainers });
        break;
      }

      case 'CONTAINER_REMOVE': {
        const newContainers = new Map(this.state.containers);
        if (newContainers.delete(action.payload.id)) {
          this.setState({ containers: newContainers });
        }
        break;
      }

      case 'DEFAULTS_UPDATE': {
        this.setState({
          defaults: {
            ...this.state.defaults,
            ...action.payload,
          },
        });
        break;
      }

      case 'BOOTSTRAP_COMPLETE': {
        this.setState({ bootstrapped: true });
        break;
      }
    }
  };
}
