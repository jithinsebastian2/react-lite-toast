import { describe, it, expect } from 'vitest';
import { getEngineRegistry, isBrowser } from './Bootstrap';
import { ENGINE_SINGLETON_KEY } from '../index';
import { ObservableStore } from './Store';

describe('Bootstrap core', () => {
  it('should initialize the global engine registry exactly once', () => {
    // Clear any existing registry to start clean
    const globalObj = globalThis as any;
    delete globalObj[ENGINE_SINGLETON_KEY];

    const registry1 = getEngineRegistry();
    expect(registry1).toBeDefined();
    expect(registry1.store).toBeInstanceOf(ObservableStore);
    expect(registry1.mounted).toBe(false);
    expect(registry1.root).toBeNull();

    // Verify registry is cached on globalThis
    expect(globalObj[ENGINE_SINGLETON_KEY]).toBe(registry1);

    // Verify second call gets the identical object reference
    const registry2 = getEngineRegistry();
    expect(registry2).toBe(registry1);
  });

  it('should detect env as non-browser in Vitest node environment', () => {
    // Core package uses Node environment in vitest.config.ts
    expect(isBrowser()).toBe(false);
  });
});
