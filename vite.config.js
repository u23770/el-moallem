import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
  build: { outDir: 'dist', assetsInlineLimit: 8192 },
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
});
