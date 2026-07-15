/**
 * vitest.workspace.ts
 *
 * Defines the Vitest "workspace" — a collection of projects, each with their
 * own vitest.config.ts. This allows `vitest run` from the repo root to run
 * ALL tests across ALL packages in parallel, while respecting each package's
 * environment (e.g., core uses "node", react uses "jsdom").
 *
 * The root `vitest` CLI is installed in the monorepo root so it can be used
 * without a per-package install.
 */
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Framework-agnostic core engine — runs in Node environment
  'packages/core/vitest.config.ts',

  // React renderer — runs in jsdom to simulate browser APIs
  'packages/react/vitest.config.ts',

  // Testing utilities package
  'packages/testing/vitest.config.ts',
]);
