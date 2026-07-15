import { describe, it, expect, vi } from 'vitest';
import { ObservableStore } from './Store';
import { toToastId } from '../types/index';
import type { CoreToast, ContainerConfig } from '../types/index';

describe('ObservableStore', () => {
  const createMockToast = (id: string, overrides?: Partial<CoreToast>): CoreToast => ({
    id: toToastId(id),
    type: 'success',
    content: 'Test content',
    state: 'CREATED',
    position: 'top-right',
    duration: 4000,
    containerId: 'default',
    priority: 0,
    createdAt: Date.now(),
    visibleAt: null,
    remainingTime: 4000,
    progressBar: true,
    closeButton: true,
    closeOnClick: false,
    pauseOnHover: true,
    pauseOnWindowBlur: true,
    animation: 'slide',
    theme: 'light',
    data: {},
    onOpen: null,
    onClose: null,
    ...overrides,
  });

  it('should initialize with default state', () => {
    const store = new ObservableStore();
    const state = store.getState();

    expect(state.toasts).toBeInstanceOf(Map);
    expect(state.toasts.size).toBe(0);
    expect(state.containers).toBeInstanceOf(Map);
    expect(state.containers.size).toBe(0);
    expect(state.defaults.duration).toBe(4000);
    expect(state.bootstrapped).toBe(false);
  });

  it('should support custom initial state', () => {
    const customToasts = new Map([[toToastId('1'), createMockToast('1')]]);
    const store = new ObservableStore({ toasts: customToasts, bootstrapped: true });

    expect(store.getState().toasts.size).toBe(1);
    expect(store.getState().bootstrapped).toBe(true);
  });

  it('should set state and notify subscribers', () => {
    const store = new ObservableStore();
    const subscriber = vi.fn();
    store.subscribe(subscriber);

    store.setState({ bootstrapped: true });

    expect(store.getState().bootstrapped).toBe(true);
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(store.getState());
  });

  it('should support updating state with a function', () => {
    const store = new ObservableStore();
    store.setState((prev) => ({ bootstrapped: !prev.bootstrapped }));
    expect(store.getState().bootstrapped).toBe(true);
  });

  it('should allow unsubscribing', () => {
    const store = new ObservableStore();
    const subscriber = vi.fn();
    const sub = store.subscribe(subscriber);

    sub.unsubscribe();
    store.setState({ bootstrapped: true });

    expect(subscriber).not.toHaveBeenCalled();
  });

  it('should support selector subscriptions that only trigger on slice changes', () => {
    const store = new ObservableStore();
    const subscriber = vi.fn();

    // Subscribe only to 'bootstrapped' slice
    store.selector((state) => state.bootstrapped, subscriber);

    // This update does not change bootstrapped, so subscriber should NOT trigger
    store.setState({ toasts: new Map() });
    expect(subscriber).not.toHaveBeenCalled();

    // This update changes bootstrapped, so subscriber should trigger
    store.setState({ bootstrapped: true });
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(true);
  });

  it('should batch multiple updates and notify subscribers only once at the end', () => {
    const store = new ObservableStore();
    const subscriber = vi.fn();
    store.subscribe(subscriber);

    store.batch(() => {
      store.setState({ bootstrapped: true });
      store.setState({ defaults: { ...store.getState().defaults, duration: 5000 } });
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(store.getState().bootstrapped).toBe(true);
    expect(store.getState().defaults.duration).toBe(5000);
  });

  describe('dispatch action handling', () => {
    it('should add a toast on TOAST_ADD', () => {
      const store = new ObservableStore();
      const toast = createMockToast('1');

      store.dispatch({ type: 'TOAST_ADD', payload: toast });

      const toasts = store.getState().toasts;
      expect(toasts.size).toBe(1);
      expect(toasts.get(toToastId('1'))).toEqual(toast);
    });

    it('should update a toast on TOAST_UPDATE but preserve ID and createdAt', () => {
      const store = new ObservableStore();
      const initialCreatedAt = Date.now() - 1000;
      const toast = createMockToast('1', { createdAt: initialCreatedAt, state: 'CREATED' });

      store.dispatch({ type: 'TOAST_ADD', payload: toast });
      store.dispatch({
        type: 'TOAST_UPDATE',
        payload: {
          id: toToastId('1'),
          state: 'VISIBLE',
          content: 'Updated content',
          createdAt: Date.now(), // should be ignored at runtime
        } as any,
      });

      const updated = store.getState().toasts.get(toToastId('1'))!;
      expect(updated.state).toBe('VISIBLE');
      expect(updated.content).toBe('Updated content');
      expect(updated.createdAt).toBe(initialCreatedAt);
    });

    it('should set toast state to DISMISSING on TOAST_DISMISS', () => {
      const store = new ObservableStore();
      const toast = createMockToast('1', { state: 'VISIBLE' });

      store.dispatch({ type: 'TOAST_ADD', payload: toast });
      store.dispatch({ type: 'TOAST_DISMISS', payload: { id: toToastId('1') } });

      const updated = store.getState().toasts.get(toToastId('1'))!;
      expect(updated.state).toBe('DISMISSING');
    });

    it('should set all matching toasts to DISMISSING on TOAST_DISMISS_ALL', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('1', { containerId: 'default', state: 'VISIBLE' }) });
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('2', { containerId: 'custom', state: 'VISIBLE' }) });

      // Dismiss default container only
      store.dispatch({ type: 'TOAST_DISMISS_ALL', payload: { containerId: 'default' } });

      expect(store.getState().toasts.get(toToastId('1'))!.state).toBe('DISMISSING');
      expect(store.getState().toasts.get(toToastId('2'))!.state).toBe('VISIBLE');

      // Dismiss all
      store.dispatch({ type: 'TOAST_DISMISS_ALL', payload: {} });
      expect(store.getState().toasts.get(toToastId('2'))!.state).toBe('DISMISSING');
    });

    it('should transition toast state on TOAST_TRANSITION', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('1', { state: 'VISIBLE' }) });

      store.dispatch({
        type: 'TOAST_TRANSITION',
        payload: { id: toToastId('1'), state: 'QUEUED' },
      });

      expect(store.getState().toasts.get(toToastId('1'))!.state).toBe('QUEUED');
    });

    it('should delete toast on TOAST_REMOVE', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('1') });

      expect(store.getState().toasts.size).toBe(1);

      store.dispatch({ type: 'TOAST_REMOVE', payload: { id: toToastId('1') } });
      expect(store.getState().toasts.size).toBe(0);
    });

    it('should transition visible toast to PAUSED on TOAST_PAUSE', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('1', { state: 'VISIBLE' }) });
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('2', { state: 'QUEUED' }) }); // should be ignored

      store.dispatch({ type: 'TOAST_PAUSE', payload: { id: toToastId('1') } });
      store.dispatch({ type: 'TOAST_PAUSE', payload: { id: toToastId('2') } });

      expect(store.getState().toasts.get(toToastId('1'))!.state).toBe('PAUSED');
      expect(store.getState().toasts.get(toToastId('2'))!.state).toBe('QUEUED');
    });

    it('should transition paused toast to RESUMED on TOAST_RESUME', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('1', { state: 'PAUSED', remainingTime: 2000 }) });
      store.dispatch({ type: 'TOAST_ADD', payload: createMockToast('2', { state: 'PAUSED', remainingTime: 3000 }) });

      // Case 1: remainingTime is specified
      store.dispatch({
        type: 'TOAST_RESUME',
        payload: { id: toToastId('1'), remainingTime: 1500 },
      });

      // Case 2: remainingTime is omitted
      store.dispatch({
        type: 'TOAST_RESUME',
        payload: { id: toToastId('2') },
      });

      const updated1 = store.getState().toasts.get(toToastId('1'))!;
      expect(updated1.state).toBe('RESUMED');
      expect(updated1.remainingTime).toBe(1500);

      const updated2 = store.getState().toasts.get(toToastId('2'))!;
      expect(updated2.state).toBe('RESUMED');
      expect(updated2.remainingTime).toBe(3000);
    });

    it('should manage containers on CONTAINER_ADD and CONTAINER_REMOVE', () => {
      const store = new ObservableStore();
      const container: ContainerConfig = { id: 'dashboard', position: 'top-left' };

      store.dispatch({ type: 'CONTAINER_ADD', payload: container });
      expect(store.getState().containers.get('dashboard')).toEqual(container);

      store.dispatch({ type: 'CONTAINER_REMOVE', payload: { id: 'dashboard' } });
      expect(store.getState().containers.has('dashboard')).toBe(false);
    });

    it('should merge defaults on DEFAULTS_UPDATE', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'DEFAULTS_UPDATE', payload: { theme: 'dark', duration: 1000 } });

      expect(store.getState().defaults.theme).toBe('dark');
      expect(store.getState().defaults.duration).toBe(1000);
      expect(store.getState().defaults.animation).toBe('slide'); // remains unchanged
    });

    it('should set bootstrapped on BOOTSTRAP_COMPLETE', () => {
      const store = new ObservableStore();
      store.dispatch({ type: 'BOOTSTRAP_COMPLETE' });

      expect(store.getState().bootstrapped).toBe(true);
    });
  });
});
