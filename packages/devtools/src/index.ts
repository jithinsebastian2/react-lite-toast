/**
 * @react-lite-toast/devtools
 *
 * Development and debugging tools for react-lite-toast.
 *
 * NOT for production use — this package should be used only during
 * development. Add it to devDependencies in your project.
 *
 * Features (implemented in Phase 16):
 *   - DevPanel      — floating panel showing real-time store state
 *   - StoreInspector — deep inspection of individual toast properties
 *   - QueueVisualizer — visual representation of the active queue
 *   - TimerDebugger  — shows remaining time for each auto-dismiss timer
 *
 * Usage:
 *   import { DevPanel } from '@react-lite-toast/devtools';
 *   // Mount anywhere in your app during development
 *   <DevPanel position="bottom-right" />
 */

export const DEVTOOLS_VERSION = '0.1.0' as const;

/**
 * @internal Placeholder — implementations added in Phase 16.
 */
export type DevPanelPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
