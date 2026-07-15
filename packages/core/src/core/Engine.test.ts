import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEngineRegistry } from './Bootstrap';
import { toToastId } from '../types/index';
import { toast } from './Engine';
import { ENGINE_SINGLETON_KEY } from '../index';

describe('Toast Engine & Dispatcher', () => {
  beforeEach(() => {
    // Clean global registry before each test
    const globalObj = globalThis as any;
    delete globalObj[ENGINE_SINGLETON_KEY];
  });

  it('should dispatch toast and merge options with defaults', () => {
    const id = toast('Hello World', {
      position: 'bottom-left',
      duration: 5000,
    });

    expect(id).toBeDefined();

    const registry = getEngineRegistry();
    const state = registry.store.getState();
    const storedToast = state.toasts.get(id);

    expect(storedToast).toBeDefined();
    expect(storedToast?.content).toBe('Hello World');
    expect(storedToast?.position).toBe('bottom-left');
    expect(storedToast?.duration).toBe(5000);
    // Verified that other options fall back to defaults
    expect(storedToast?.type).toBe('info');
    expect(storedToast?.progressBar).toBe(true);
    expect(storedToast?.closeButton).toBe(true);
  });

  it('should generate globally unique, sequential IDs using nextId', () => {
    const id1 = toast('First');
    const id2 = toast('Second');

    expect(id1).toBe(toToastId('toast-1'));
    expect(id2).toBe(toToastId('toast-2'));
    expect(id1).not.toBe(id2);
  });

  it('should reuse ID and update existing toast instead of creating new if ID is provided', () => {
    const customId = 'my-custom-id';
    const id1 = toast('Hello', { id: customId });
    expect(id1).toBe(toToastId(customId));

    const registry = getEngineRegistry();
    expect(registry.store.getState().toasts.size).toBe(1);

    const id2 = toast('World', { id: customId, position: 'bottom-center' });
    expect(id2).toBe(toToastId(customId));
    expect(registry.store.getState().toasts.size).toBe(1);

    const stored = registry.store.getState().toasts.get(toToastId(customId));
    expect(stored?.content).toBe('World');
    expect(stored?.position).toBe('bottom-center');
  });

  it('should execute onOpen callback when a toast is created', () => {
    const onOpenSpy = vi.fn();
    toast('Hello', { onOpen: onOpenSpy });

    expect(onOpenSpy).toHaveBeenCalledTimes(1);
    expect(onOpenSpy.mock.calls[0][0].content).toBe('Hello');
  });

  it('should trigger registered bootstrap callback on dispatch', () => {
    const bootstrapSpy = vi.fn(() => true);
    const registry = getEngineRegistry();
    registry.bootstrap = bootstrapSpy;

    toast('Hello bootstrap');
    expect(bootstrapSpy).toHaveBeenCalledTimes(1);
  });

  it('should support helper methods for all toast types', () => {
    const registry = getEngineRegistry();

    const successId = toast.success('Success message');
    expect(registry.store.getState().toasts.get(successId)?.type).toBe('success');

    const errorId = toast.error('Error message');
    expect(registry.store.getState().toasts.get(errorId)?.type).toBe('error');

    const warningId = toast.warning('Warning message');
    expect(registry.store.getState().toasts.get(warningId)?.type).toBe('warning');

    const infoId = toast.info('Info message');
    expect(registry.store.getState().toasts.get(infoId)?.type).toBe('info');

    const customId = toast.custom('Custom message');
    expect(registry.store.getState().toasts.get(customId)?.type).toBe('custom');

    const loadingId = toast.loading('Loading message');
    const loadingToast = registry.store.getState().toasts.get(loadingId);
    expect(loadingToast?.type).toBe('loading');
    expect(loadingToast?.duration).toBe(false);
    expect(loadingToast?.progressBar).toBe(false);
  });

  it('should dismiss toast and call onClose callback', () => {
    const onCloseSpy = vi.fn();
    const id = toast('Dismiss me', { onClose: onCloseSpy });

    const registry = getEngineRegistry();
    expect(registry.store.getState().toasts.get(id)?.state).toBe('VISIBLE');

    toast.dismiss(id);
    expect(registry.store.getState().toasts.get(id)?.state).toBe('DISMISSING');
    expect(onCloseSpy).toHaveBeenCalledTimes(1);

    // Call again, should not execute callback again
    toast.dismiss(id);
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('should dismiss all active toasts', () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();

    const id1 = toast('One', { onClose: onClose1 });
    const id2 = toast('Two', { onClose: onClose2, containerId: 'sidebar' });

    const registry = getEngineRegistry();
    expect(registry.store.getState().toasts.size).toBe(2);

    toast.dismissAll();

    expect(registry.store.getState().toasts.get(id1)?.state).toBe('DISMISSING');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('DISMISSING');
    expect(onClose1).toHaveBeenCalledTimes(1);
    expect(onClose2).toHaveBeenCalledTimes(1);
  });

  it('should dismiss only matching container when containerId filter is supplied', () => {
    const id1 = toast('One', { containerId: 'default' });
    const id2 = toast('Two', { containerId: 'sidebar' });

    toast.dismissAll('sidebar');

    const registry = getEngineRegistry();
    expect(registry.store.getState().toasts.get(id1)?.state).toBe('VISIBLE');
    expect(registry.store.getState().toasts.get(id2)?.state).toBe('DISMISSING');
  });

  it('should update an existing toast options', () => {
    const id = toast('Initial Message');
    toast.update(id, {
      content: 'Updated Message',
      theme: 'dark',
    });

    const registry = getEngineRegistry();
    const stored = registry.store.getState().toasts.get(id);
    expect(stored?.content).toBe('Updated Message');
    expect(stored?.theme).toBe('dark');
  });

  it('should update defaults configuration', () => {
    toast.defaults({
      duration: 8000,
      theme: 'colored',
    });

    const registry = getEngineRegistry();
    expect(registry.store.getState().defaults.duration).toBe(8000);
    expect(registry.store.getState().defaults.theme).toBe('colored');
  });

  it('should handle promise resolves in toast.promise()', async () => {
    const promise = Promise.resolve('Resolve data');
    const id = toast.promise(promise, {
      loading: 'Loading data...',
      success: (data) => `Loaded: ${data}`,
      error: 'Failed to load',
    });

    const registry = getEngineRegistry();
    const loadingToast = registry.store.getState().toasts.get(id);
    expect(loadingToast?.type).toBe('loading');
    expect(loadingToast?.content).toBe('Loading data...');

    await promise;
    // Tick to allow microtasks to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    const successToast = registry.store.getState().toasts.get(id);
    expect(successToast?.type).toBe('success');
    expect(successToast?.content).toBe('Loaded: Resolve data');
    expect(successToast?.progressBar).toBe(true);
  });

  it('should handle promise rejects in toast.promise()', async () => {
    const promise = Promise.reject(new Error('Some error'));
    const id = toast.promise(promise, {
      loading: 'Loading data...',
      success: 'Loaded successfully',
      error: (err: any) => `Error: ${err.message}`,
    });

    const registry = getEngineRegistry();
    const loadingToast = registry.store.getState().toasts.get(id);
    expect(loadingToast?.type).toBe('loading');

    try {
      await promise;
    } catch {
      // Ignored
    }

    // Tick to allow microtasks to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorToast = registry.store.getState().toasts.get(id);
    expect(errorToast?.type).toBe('error');
    expect(errorToast?.content).toBe('Error: Some error');
    expect(errorToast?.progressBar).toBe(true);
  });
});
