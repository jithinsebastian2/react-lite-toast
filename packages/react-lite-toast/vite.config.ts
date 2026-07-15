/**
 * vite.config.ts — react-lite-toast (umbrella)
 *
 * The umbrella package is a thin re-export layer over @react-lite-toast/react.
 * It adds zero additional code — just re-exports for consumer convenience.
 *
 * Both @react-lite-toast/core and @react-lite-toast/react are externalized
 * to prevent duplication. The umbrella package dist is tiny (~100 bytes).
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true, rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactLiteToast',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@react-lite-toast/core',
        '@react-lite-toast/react',
      ],
      output: { exports: 'named' },
    },
    sourcemap: true,
    minify: false,
    target: 'ES2020',
  },
});
