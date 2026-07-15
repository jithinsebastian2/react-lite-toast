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

  it('should catch and log errors thrown in onOpen and onClose callbacks', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Try throwing error in onOpen
    const id = toast('Hello', {
      onOpen: () => {
        throw new Error('onOpen crash');
      },
      onClose: () => {
        throw new Error('onClose crash');
      },
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error in toast onOpen callback:'), expect.any(Error));

    // Try throwing error in onClose
    toast.dismiss(id);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error in toast onClose callback:'), expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should catch and log errors thrown in bootstrap callback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const registry = getEngineRegistry();
    registry.bootstrap = () => {
      throw new Error('bootstrap crash');
    };

    toast('Trigger bootstrap error');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to trigger bootstrap from toast dispatcher:'), expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle promise resolves and rejects with static string messages', async () => {
    const promise1 = Promise.resolve('data');
    const id1 = toast.promise(promise1, {
      loading: 'Loading...',
      success: 'Resolved static message',
      error: 'Error static message',
    });

    await promise1;
    await new Promise((resolve) => setTimeout(resolve, 0));
    const registry = getEngineRegistry();
    expect(registry.store.getState().toasts.get(id1)?.content).toBe('Resolved static message');

    const promise2 = Promise.reject('some-error');
    const id2 = toast.promise(promise2, {
      loading: 'Loading...',
      success: 'Resolved static message',
      error: 'Error static message',
    });

    try {
      await promise2;
    } catch {
      // Ignored
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(registry.store.getState().toasts.get(id2)?.content).toBe('Error static message');
  });

  it('should catch and log errors thrown in onClose callbacks during dismissAll', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    toast('One', {
      onClose: () => {
        throw new Error('dismissAll crash');
      },
    });

    toast.dismissAll();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error in toast onClose callback:'), expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should cover fallback branches for nextId and option fields', () => {
    const registry = getEngineRegistry();
    // Force nextId to undefined to hit fallback branch (?? 0)
    registry.nextId = undefined;

    const id = toast('Test', {
      progressBar: false,
      closeButton: false,
      closeOnClick: true,
      pauseOnHover: false,
      pauseOnWindowBlur: false,
    });

    expect(id).toBe(toToastId('toast-1'));

    // Second toast to hit true branches of the option checks
    toast('Test 2', {
      progressBar: true,
      closeButton: true,
      closeOnClick: false,
      pauseOnHover: true,
      pauseOnWindowBlur: true,
    });
  });

  it('should support promise function arguments and custom durations in toast.promise()', async () => {
    const promiseFn = () => Promise.resolve('fn-data');
    const id = toast.promise(promiseFn, {
      loading: 'Loading...',
      success: 'Resolved',
      error: 'Rejected',
    }, {
      successDuration: 1234,
      errorDuration: 5678,
    });

    const registry = getEngineRegistry();
    await promiseFn();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const successToast = registry.store.getState().toasts.get(id);
    expect(successToast?.content).toBe('Resolved');
    expect(successToast?.duration).toBe(1234);

    // Reject path with custom error duration
    const promiseFnReject = () => Promise.reject('err');
    const id2 = toast.promise(promiseFnReject, {
      loading: 'Loading...',
      success: 'Resolved',
      error: 'Rejected',
    }, {
      successDuration: 1234,
      errorDuration: 5678,
    });

    try {
      await promiseFnReject();
    } catch {
      // Ignored
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorToast = registry.store.getState().toasts.get(id2);
    expect(errorToast?.content).toBe('Rejected');
    expect(errorToast?.duration).toBe(5678);
  });
});
