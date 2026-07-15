import { describe, it, expect, beforeEach } from 'vitest';
import { getEngineRegistry, toToastId } from './Bootstrap';
import { toast } from './Engine';
import { ENGINE_SINGLETON_KEY } from '../index';
import { setupQueueScheduler } from './Queue';

describe('Queue System', () => {
  beforeEach(() => {
    // Clear registry to reset store and queue scheduler
    const globalObj = globalThis as any;
    delete globalObj[ENGINE_SINGLETON_KEY];
  });

  it('should queue toasts when container limit is reached', () => {
    const registry = getEngineRegistry();

    // Set container limit to 2
    toast.defaults({ limit: 2 });

    const id1 = toast('Toast 1');
    const id2 = toast('Toast 2');
    const id3 = toast('Toast 3'); // Should exceed limit and be queued

    const state = registry.store.getState();
    expect(state.toasts.get(id1)?.state).toBe('VISIBLE');
    expect(state.toasts.get(id2)?.state).toBe('VISIBLE');
    expect(state.toasts.get(id3)?.state).toBe('QUEUED');
    expect(state.toasts.get(id3)?.visibleAt).toBeNull();
  });

  it('should promote queued toasts in FIFO order if priority is identical', async () => {
    const registry = getEngineRegistry();
    toast.defaults({ limit: 1 });

    const id1 = toast('Toast 1');
    const id2 = toast('Toast 2'); // Queued (first in)
    const id3 = toast('Toast 3'); // Queued (second in)

    expect(registry.store.getState().toasts.get(id1)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('QUEUED');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('QUEUED');

    // Dismiss first toast, freeing slot
    toast.dismiss(id1);
    // Remove it to simulate exit animation completion / removal
    registry.store.dispatch({ type: 'TOAST_REMOVE', payload: { id: id1 } });

    // Toast 2 should be promoted first (FIFO)
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.visibleAt).toBeTypeOf('number');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('QUEUED');
  });

  it('should promote queued toasts with higher priority first', () => {
    const registry = getEngineRegistry();
    toast.defaults({ limit: 1 });

    const id1 = toast('Toast 1');
    const id2 = toast('Toast 2', { priority: 1 }); // Queued, low priority
    const id3 = toast('Toast 3', { priority: 10 }); // Queued, high priority

    expect(registry.store.getState().toasts.get(id1)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('QUEUED');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('QUEUED');

    // Remove first toast
    registry.store.dispatch({ type: 'TOAST_REMOVE', payload: { id: id1 } });

    // Toast 3 should be promoted because it has higher priority
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('QUEUED');
  });

  it('should handle queues independently for different container IDs', () => {
    const registry = getEngineRegistry();

    // Register a second container
    registry.store.dispatch({
      type: 'CONTAINER_ADD',
      payload: { id: 'sidebar', limit: 1 },
    });
    // Set default container limit to 1
    toast.defaults({ limit: 1 });

    const id1 = toast('Default Container Toast 1', { containerId: 'default' });
    const id2 = toast('Default Container Toast 2', { containerId: 'default' }); // Queued

    const sid1 = toast('Sidebar Toast 1', { containerId: 'sidebar' });
    const sid2 = toast('Sidebar Toast 2', { containerId: 'sidebar' }); // Queued

    const state = registry.store.getState();
    expect(state.toasts.get(id1)?.state).toBe('VISIBLE');
    expect(state.toasts.get(id2)?.state).toBe('QUEUED');

    expect(state.toasts.get(sid1)?.state).toBe('VISIBLE');
    expect(state.toasts.get(sid2)?.state).toBe('QUEUED');

    // Remove Sidebar 1
    registry.store.dispatch({ type: 'TOAST_REMOVE', payload: { id: sid1 } });

    // Sidebar 2 promoted, Default 2 remains queued
    expect(registry.store.getState().toasts.get(sid2)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('QUEUED');
  });

  it('should promote queued toasts dynamically when the limit is increased', () => {
    const registry = getEngineRegistry();
    toast.defaults({ limit: 1 });

    const id1 = toast('Toast 1');
    const id2 = toast('Toast 2');
    const id3 = toast('Toast 3');

    expect(registry.store.getState().toasts.get(id1)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('QUEUED');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('QUEUED');

    // Increase limit to 3
    toast.defaults({ limit: 3 });

    // Both should be promoted immediately
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('VISIBLE');
  });

  it('should promote all queued toasts if limit is set to false', () => {
    const registry = getEngineRegistry();
    toast.defaults({ limit: 1 });

    const id1 = toast('Toast 1');
    const id2 = toast('Toast 2');
    const id3 = toast('Toast 3');

    expect(registry.store.getState().toasts.get(id1)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('QUEUED');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('QUEUED');

    // Disable limit
    toast.defaults({ limit: false });

    // Both should be promoted immediately
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id3)?.state).toBe('VISIBLE');
  });

  it('should return early if already processing (isProcessing guard)', () => {
    let capturedListener: any = null;
    let guardHit = false;

    const mockStore = {
      getState: () => ({
        toasts: new Map([
          ['1', { id: '1', containerId: 'default', state: 'QUEUED', priority: 0, createdAt: Date.now() }]
        ]),
        containers: new Map(),
        defaults: { limit: 1 },
        bootstrapped: true,
      }),
      subscribe: (listener: any) => {
        capturedListener = listener;
        return { unsubscribe: () => {} };
      },
      batch: (cb: any) => {
        cb();
      },
      dispatch: () => {
        if (capturedListener && !guardHit) {
          guardHit = true;
          capturedListener(); // recursive call while isProcessing is true
        }
      },
    } as any;

    setupQueueScheduler(mockStore);

    // Call capturedListener to start the cycle
    capturedListener();

    expect(guardHit).toBe(true);
  });
});
