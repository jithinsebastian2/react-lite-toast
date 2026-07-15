/**
 * vite.config.ts — @react-lite-toast/testing
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true, rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactLiteToastTesting',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@react-lite-toast/core',
        'vitest',
      ],
      output: { exports: 'named' },
    },
    sourcemap: true,
    minify: false,
    target: 'ES2020',
  },
});
