import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  getEngineRegistry,
  isBrowser,
  PORTAL_ROOT_ID,
} from '@react-lite-toast/core';
import { ToastContainer } from '../components/ToastContainer';

/**
 * Mount Controller
 *
 * Handles the lazy, zero-configuration bootstrap process in the browser.
 * Safe to be imported and called in SSR/Next.js environments.
 */

/**
 * Dynamically mounts the react-lite-toast root and renders the ToastContainer.
 * Guarantees that only one container is mounted on the page, even if multiple
 * applications or bundles invoke toast simultaneously.
 *
 * @returns true if bootstrapped successfully, false if skipped or on server.
 */
export function bootstrap(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const registry = getEngineRegistry();

  // If already mounted, skip to ensure it only happens once.
  if (registry.mounted) {
    return true;
  }

  try {
    // 1. Find or create the portal root container in the DOM
    let portalRoot = document.getElementById(PORTAL_ROOT_ID);
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = PORTAL_ROOT_ID;
      document.body.appendChild(portalRoot);
    }

    // 2. Mount the React root
    const root = createRoot(portalRoot);
    root.render(React.createElement(ToastContainer));

    // 3. Cache the root in the global registry
    registry.root = root;
    registry.mounted = true;

    // 4. Update the observable store state
    registry.store.dispatch({ type: 'BOOTSTRAP_COMPLETE' });

    return true;
  } catch (error) {
    console.error('Failed to bootstrap react-lite-toast:', error);
    return false;
  }
}

/**
 * Programmatically unmounts the react-lite-toast root container from the DOM.
 * Primarily used in test cleanups or micro-frontend teardown lifecycle methods.
 */
export function unmount(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const registry = getEngineRegistry();

  if (!registry.mounted || !registry.root) {
    return false;
  }

  try {
    const root = registry.root as { unmount: () => void };
    root.unmount();

    // Remove the portal root container from DOM
    const portalRoot = document.getElementById(PORTAL_ROOT_ID);
    if (portalRoot) {
      portalRoot.remove();
    }

    // Reset global registry status
    registry.root = null;
    registry.mounted = false;
    registry.store.setState({ bootstrapped: false });

    return true;
  } catch (error) {
    console.error('Failed to unmount react-lite-toast root:', error);
    return false;
  }
}
