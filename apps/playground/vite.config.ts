/**
 * vite.config.ts — playground
 *
 * Standard Vite React app config.
 * Resolves workspace packages from the local monorepo (not npm).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      // Alias workspace packages to their source for faster HMR
      // (skips the build step for library packages during playground dev)
      '@react-lite-toast/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@react-lite-toast/react': resolve(__dirname, '../../packages/react/src/index.ts'),
      'react-lite-toast': resolve(__dirname, '../../packages/react-lite-toast/src/index.ts'),
    },
  },
});
