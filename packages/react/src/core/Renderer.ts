import { bootstrap, unmount } from './Mount';
import { getEngineRegistry } from '@react-lite-toast/core';

/**
 * Renderer Manager
 *
 * Exposes status checks and control functions for the dynamic mounting system.
 * Serves as the interface between the Toast Engine and the React rendering tree.
 */
export const Renderer = {
  /**
   * Triggers the dynamic mounting and rendering of the ToastContainer.
   * Safe to call repeatedly; initialization runs exactly once.
   */
  bootstrap,

  /**
   * Programmatically tears down the container and destroys the React root.
   */
  unmount,

  /**
   * Returns whether the container is currently mounted in the DOM.
   */
  isMounted: (): boolean => {
    return getEngineRegistry().mounted;
  },
} as const;
