/**
 * vite.config.ts — @react-lite-toast/react
 *
 * Builds the React renderer as a dual ESM/CJS library.
 *
 * Key decisions:
 *
 * - @vitejs/plugin-react — enables JSX transform and React Fast Refresh
 *   in dev mode. In build mode, it applies the React Babel plugin for
 *   optimal JSX output.
 *
 * - external: ['react', 'react-dom', '@react-lite-toast/core'] — these
 *   MUST be externalized. Bundling react would cause multiple React instances
 *   which breaks hooks. Bundling core would duplicate the singleton.
 *
 * - CSS is handled separately — Vite extracts CSS into dist/styles/*.css
 *   files that consumers import explicitly (opt-in, SSR-safe).
 *
 * - vite-plugin-dts generates type declarations for all components and hooks.
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/**/*'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/tests/**',
      ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactLiteToastReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Critical: React and core must be external to avoid duplicates.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@react-lite-toast/core',
      ],
      output: {
        exports: 'named',
        // Provide React globals for UMD consumers (not used but good practice)
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@react-lite-toast/core': 'ReactLiteToastCore',
        },
        // Preserve CSS asset file names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'styles/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    sourcemap: true,
    minify: false,
    target: 'ES2020',
    // Extract CSS to separate files for opt-in import
    cssCodeSplit: true,
  },
});
