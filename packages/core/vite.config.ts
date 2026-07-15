/**
 * vite.config.ts — @react-lite-toast/core
 *
 * Builds the framework-agnostic engine as a dual ESM/CJS library.
 *
 * Key decisions:
 *
 * - formats: ['es', 'cjs'] — ESM for bundlers (Vite, webpack, Rollup),
 *   CJS for legacy Node.js require() consumers. No IIFE/UMD since this
 *   is not a browser script tag library.
 *
 * - external: [] — The core package has zero runtime dependencies, so
 *   nothing needs to be externalized.
 *
 * - minify: false — Libraries should NOT be minified. Consumers' bundlers
 *   perform minification with tree shaking. Pre-minified libraries break
 *   bundle analysis and source maps.
 *
 * - sourcemap: true — Essential for debugging in consuming projects.
 *
 * - vite-plugin-dts generates .d.ts files from TypeScript source.
 *   rollupTypes: true merges all type declarations into a single file,
 *   which is cleaner and prevents consumers from depending on internal
 *   module paths.
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/tests/**'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactLiteToastCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // No external dependencies — this package is self-contained.
      external: [],
      output: {
        // Preserve module structure in ESM output for better tree shaking.
        // This allows bundlers to eliminate unused exports at the file level.
        preserveModules: false,
        exports: 'named',
      },
    },
    sourcemap: true,
    // Do NOT minify — libraries ship unminified, consumers minify.
    minify: false,
    // Target modern environments. Users on legacy environments use their
    // own transpilation (e.g. Babel) via their bundler.
    target: 'ES2020',
  },
});
