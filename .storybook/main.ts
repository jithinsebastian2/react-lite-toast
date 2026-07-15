/**
 * .storybook/main.ts
 *
 * Storybook 8 configuration for react-lite-toast.
 *
 * Uses @storybook/react-vite framework — zero webpack, pure Vite.
 * Resolves component stories from the react package src directory.
 *
 * Stories are written alongside components:
 *   packages/react/src/components/Toast.stories.tsx
 */
import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: [
    // All stories in the react package
    '../packages/react/src/**/*.stories.@(ts|tsx)',
    // MDX documentation pages
    '../packages/react/src/**/*.mdx',
    // Playground demos exposed as stories
    '../apps/playground/src/**/*.stories.@(ts|tsx)',
  ],

  addons: [
    '@storybook/addon-essentials',  // Controls, Actions, Viewport, Backgrounds
    '@storybook/addon-a11y',        // Accessibility panel
    '@storybook/addon-interactions', // Interaction testing
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  viteFinal: (config) => {
    // Resolve workspace packages to their TypeScript source
    // for the best Storybook development experience
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-lite-toast/core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@react-lite-toast/react': resolve(__dirname, '../packages/react/src/index.ts'),
      'react-lite-toast': resolve(__dirname, '../packages/react-lite-toast/src/index.ts'),
    };

    return config;
  },
};

export default config;
