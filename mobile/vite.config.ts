import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), legacy()],
  // Vitest resolves packages with the Node condition by default, which loads the
  // SSR build of @lit/react and drops Ionic custom-element event listeners.
  resolve: mode === 'test' ? { conditions: ['browser', 'development', 'module'] } : undefined,
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Playwright e2e specs live in e2e/.
    include: ['src/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: ['@ionic/react', '@stencil/react-output-target', '@lit/react'],
      },
    },
  },
}));
