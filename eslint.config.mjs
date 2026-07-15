/**
 * eslint.config.mjs
 *
 * ESLint 9 flat configuration for the react-lite-toast monorepo.
 *
 * Uses the new "flat config" format (no .eslintrc). Every rule set is
 * explicit — no magic extends chains.
 *
 * Rule philosophy:
 * - TypeScript strict-type-checked: catches runtime errors at lint time
 * - react-hooks: enforces correct hook dependencies (prevents stale closures)
 * - react-refresh: ensures HMR works in the playground app
 * - No stylistic rules — Prettier handles formatting
 */

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
  // ─── Base JS recommended rules ───────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript source files ──────────────────────────────────────────────
  {
    files: ['packages/*/src/**/*.{ts,tsx}', 'apps/*/src/**/*.{ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // projectService enables type-aware rules across all tsconfig.json files
        // without manually specifying each one.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Browser globals (window, document, etc.) are available in library code
        // but must be guarded for SSR. SSR guards are enforced in code, not lint.
        window: 'readonly',
        document: 'readonly',
        globalThis: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },

    rules: {
      // TypeScript: strict type-checked rules catch the most bugs
      ...tsPlugin.configs['strict-type-checked'].rules,
      ...tsPlugin.configs['stylistic-type-checked'].rules,

      // React: modern JSX transform — no need for React in scope
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // TypeScript handles prop types

      // React Hooks: strict enforcement of hook rules
      ...reactHooksPlugin.configs.recommended.rules,

      // React Refresh: warn when non-component exports mix with components
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript overrides for library code
      // We use function overloads extensively in the public API
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Allow empty interfaces (useful for extensibility in public API)
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // ─── Test files (relaxed rules) ───────────────────────────────────────────
  {
    files: ['**/*.test.{ts,tsx}', '**/tests/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      // Tests often use non-null assertions and type casts intentionally
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ─── Config files ─────────────────────────────────────────────────────────
  {
    files: ['*.config.{ts,mjs,cjs}', '.storybook/**/*.ts'],
    rules: {
      // Config files may use dynamic requires or devDependency imports
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ─── Global ignores ───────────────────────────────────────────────────────
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.storybook/storybook-static/**',
      '**/storybook-static/**',
    ],
  },
];
