import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEngineRegistry, PORTAL_ROOT_ID, toToastId } from '@react-lite-toast/core';
import { bootstrap, unmount } from './Mount';
import { Renderer } from './Renderer';

describe('React Bootstrap & Mount', () => {
  beforeEach(() => {
    // Reset global registry and DOM before each test
    const registry = getEngineRegistry();
    registry.mounted = false;
    registry.root = null;
    registry.store.setState({
      toasts: new Map(),
      bootstrapped: false,
    });

    const portalRoot = document.getElementById(PORTAL_ROOT_ID);
    if (portalRoot) {
      portalRoot.remove();
    }
  });

  afterEach(() => {
    // Teardown after tests
    unmount();
  });

  it('should dynamically bootstrap React root in browser environment', () => {
    expect(Renderer.isMounted()).toBe(false);
    expect(document.getElementById(PORTAL_ROOT_ID)).toBeNull();

    const success = bootstrap();
    expect(success).toBe(true);
    expect(Renderer.isMounted()).toBe(true);

    // Verify DOM node created
    const portalRoot = document.getElementById(PORTAL_ROOT_ID);
    expect(portalRoot).not.toBeNull();
    expect(portalRoot?.tagName).toBe('DIV');

    // Verify store state updated
    const registry = getEngineRegistry();
    expect(registry.store.getState().bootstrapped).toBe(true);
  });

  it('should skip duplicate bootstrap calls', () => {
    const success1 = bootstrap();
    expect(success1).toBe(true);

    const success2 = bootstrap();
    expect(success2).toBe(true);

    // Verify it is still mounted exactly once
    expect(Renderer.isMounted()).toBe(true);
  });

  it('should correctly unmount and clean up resources', () => {
    bootstrap();
    expect(Renderer.isMounted()).toBe(true);
    expect(document.getElementById(PORTAL_ROOT_ID)).not.toBeNull();

    const success = unmount();
    expect(success).toBe(true);
    expect(Renderer.isMounted()).toBe(false);
    expect(document.getElementById(PORTAL_ROOT_ID)).toBeNull();
    expect(getEngineRegistry().store.getState().bootstrapped).toBe(false);
  });

  it('should safely return false when unmounting an unmounted container', () => {
    expect(Renderer.isMounted()).toBe(false);
    const success = unmount();
    expect(success).toBe(false);
  });

  it('should render toasts dynamically into the mounted container', async () => {
    bootstrap();

    const registry = getEngineRegistry();
    const mockToast = {
      id: toToastId('test-toast-1'),
      type: 'success' as const,
      content: 'Hello, testing mount!',
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: 4000 as const,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      remainingTime: 4000,
      progressBar: true,
      closeButton: true,
      closeOnClick: false,
      pauseOnHover: true,
      pauseOnWindowBlur: true,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: null,
    };

    // Add toast to store
    registry.store.dispatch({ type: 'TOAST_ADD', payload: mockToast });

    // Wait a brief tick for React async render to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify rendered content is in the container DOM
    const toastElement = document.getElementById('toast-test-toast-1');
    expect(toastElement).not.toBeNull();
    expect(toastElement?.textContent).toBe('Hello, testing mount!');
  });
});
