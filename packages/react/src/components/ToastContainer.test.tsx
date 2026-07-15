import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { getEngineRegistry, PORTAL_ROOT_ID, toToastId } from '@react-lite-toast/core';
import { ToastContainer } from './ToastContainer';

describe('ToastContainer Component', () => {
  beforeEach(() => {
    // Reset global registry and DOM
    const registry = getEngineRegistry();
    registry.mounted = false;
    registry.root = null;
    registry.store.setState({
      toasts: new Map(),
      containers: new Map(),
      bootstrapped: false,
    });

    const portalRoot = document.getElementById(PORTAL_ROOT_ID);
    if (portalRoot) {
      portalRoot.remove();
    }
  });

  afterEach(() => {
    cleanup();
    // Clean up any remaining container elements
    const defaultEl = document.getElementById(PORTAL_ROOT_ID);
    if (defaultEl) defaultEl.remove();

    const sidebarEl = document.getElementById('react-lite-toast-container-sidebar');
    if (sidebarEl) sidebarEl.remove();
  });

  it('should register container on mount and remove on unmount', () => {
    const registry = getEngineRegistry();
    expect(registry.store.getState().containers.has('default')).toBe(false);

    const { unmount } = render(<ToastContainer />);

    // Should register default container config in the store
    const containersAfterMount = registry.store.getState().containers;
    expect(containersAfterMount.has('default')).toBe(true);
    expect(containersAfterMount.get('default')?.id).toBe('default');

    // Portal container should be created in the DOM
    const portalTarget = document.getElementById(PORTAL_ROOT_ID);
    expect(portalTarget).not.toBeNull();

    unmount();

    // Should remove default container config from the store
    expect(registry.store.getState().containers.has('default')).toBe(false);
  });

  it('should support custom container props and update store config', () => {
    const registry = getEngineRegistry();

    const { rerender, unmount } = render(
      <ToastContainer
        id="sidebar"
        position="bottom-left"
        limit={5}
        theme="dark"
        zIndex={100}
        animation="slide"
        stackOrder="above"
        className="test-sidebar"
      />
    );

    const config = registry.store.getState().containers.get('sidebar');
    expect(config).toBeDefined();
    expect(config?.position).toBe('bottom-left');
    expect(config?.limit).toBe(5);
    expect(config?.theme).toBe('dark');
    expect(config?.zIndex).toBe(100);
    expect(config?.animation).toBe('slide');
    expect(config?.stackOrder).toBe('above');
    expect(config?.className).toBe('test-sidebar');

    // Update props
    rerender(
      <ToastContainer
        id="sidebar"
        position="top-center"
        limit={10}
        theme="light"
        zIndex={200}
      />
    );

    const updatedConfig = registry.store.getState().containers.get('sidebar');
    expect(updatedConfig?.position).toBe('top-center');
    expect(updatedConfig?.limit).toBe(10);
    expect(updatedConfig?.theme).toBe('light');
    expect(updatedConfig?.zIndex).toBe(200);

    // Unmount and verify DOM node cleanup
    unmount();
    expect(document.getElementById('react-lite-toast-container-sidebar')).toBeNull();
  });

  it('should portal toasts to the body portal container element', () => {
    const registry = getEngineRegistry();

    render(<ToastContainer id="default" />);

    // Add a toast to the store
    const toastId = toToastId('toast-portal-test');
    act(() => {
      registry.store.dispatch({
        type: 'TOAST_ADD',
        payload: {
          id: toastId,
          type: 'success',
          content: 'Portaled Toast Message',
          state: 'VISIBLE',
          position: 'top-right',
          duration: 4000,
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
          animation: 'slide',
          theme: 'light',
          data: {},
          onOpen: null,
          onClose: null,
        },
      });
    });

    // Toast should be in the DOM
    const toastElement = screen.getByText('Portaled Toast Message');
    expect(toastElement).toBeInTheDocument();

    // Verify it is a child of the portal target element
    const portalTarget = document.getElementById(PORTAL_ROOT_ID);
    expect(portalTarget).toContainElement(toastElement);
  });

  it('should isolate and render toasts only to their respective containers', () => {
    const registry = getEngineRegistry();

    // Render both container instances
    render(<ToastContainer id="default" />);
    render(<ToastContainer id="sidebar" />);

    // Add toast to default container
    const defaultToastId = toToastId('default-toast');
    act(() => {
      registry.store.dispatch({
        type: 'TOAST_ADD',
        payload: {
          id: defaultToastId,
          type: 'info',
          content: 'Default Container Message',
          state: 'VISIBLE',
          position: 'top-right',
          duration: 4000,
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
          animation: 'slide',
          theme: 'light',
          data: {},
          onOpen: null,
          onClose: null,
        },
      });
    });

    // Add toast to sidebar container
    const sidebarToastId = toToastId('sidebar-toast');
    act(() => {
      registry.store.dispatch({
        type: 'TOAST_ADD',
        payload: {
          id: sidebarToastId,
          type: 'success',
          content: 'Sidebar Container Message',
          state: 'VISIBLE',
          position: 'bottom-left',
          duration: 4000,
          containerId: 'sidebar',
          priority: 0,
          createdAt: Date.now(),
          visibleAt: Date.now(),
          remainingTime: 4000,
          progressBar: true,
          closeButton: true,
          closeOnClick: false,
          pauseOnHover: true,
          pauseOnWindowBlur: true,
          animation: 'slide',
          theme: 'dark',
          data: {},
          onOpen: null,
          onClose: null,
        },
      });
    });

    const defaultMsg = screen.getByText('Default Container Message');
    const sidebarMsg = screen.getByText('Sidebar Container Message');

    const defaultPortal = document.getElementById(PORTAL_ROOT_ID);
    const sidebarPortal = document.getElementById('react-lite-toast-container-sidebar');

    expect(defaultPortal).toContainElement(defaultMsg);
    expect(defaultPortal).not.toContainElement(sidebarMsg);

    expect(sidebarPortal).toContainElement(sidebarMsg);
    expect(sidebarPortal).not.toContainElement(defaultMsg);
  });
});
