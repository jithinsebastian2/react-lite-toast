/**
 * .storybook/preview.ts
 *
 * Global Storybook preview configuration.
 * Sets up decorators, parameters, and global types that apply to all stories.
 */
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    // Controls addon configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
    },

    // Background options for testing different page backgrounds
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a0f' },
        { name: 'light', value: '#f8fafc' },
        { name: 'gray', value: '#1a1a24' },
      ],
    },

    // Viewport sizes for responsive testing
    viewport: {
      viewports: {
        mobile: { name: 'Mobile (375)', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet (768)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1280)', styles: { width: '1280px', height: '800px' } },
        wide: { name: 'Wide (1920)', styles: { width: '1920px', height: '1080px' } },
      },
    },

    // Accessibility addon defaults
    a11y: {
      config: {
        rules: [
          {
            // Ensure toasts have proper contrast
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },

    // Actions automatically matched from handler props
    actions: { argTypesRegex: '^on[A-Z].*' },
  },

  // Global story tags
  tags: ['autodocs'],
};

export default preview;
