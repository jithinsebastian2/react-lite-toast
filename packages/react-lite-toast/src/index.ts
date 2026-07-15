/**
 * react-lite-toast
 *
 * Zero-config, provider-less React notification library.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { toast } from 'react-lite-toast';
 * // Optional: import styles (or let the library inject them)
 * import 'react-lite-toast/styles';
 *
 * toast.success('Saved successfully!');
 * toast.error('Something went wrong.');
 * toast.promise(saveData(), {
 *   messages: { loading: 'Saving...', success: 'Saved!', error: 'Failed.' }
 * });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * react-lite-toast (this file)
 *   └── @react-lite-toast/react   (React renderer + components + hooks)
 *         └── @react-lite-toast/core (framework-agnostic engine + types)
 *
 * This umbrella package re-exports everything from @react-lite-toast/react
 * for consumer convenience. Advanced users can import from scoped packages
 * directly for finer-grained control.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Re-export everything from the React package.
// This is the ONLY content of the umbrella package.
export * from '@react-lite-toast/react';
