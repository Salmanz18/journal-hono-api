import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/', 'drizzle/', '**/*.config.*', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@config': resolve(__dirname, './src/config'),
      '@modules': resolve(__dirname, './src/modules'),
      '@middleware': resolve(__dirname, './src/middleware'),
      '@lib': resolve(__dirname, './src/lib'),
      '@utils': resolve(__dirname, './src/utils'),
      '@db': resolve(__dirname, './src/db'),
    },
  },
});
