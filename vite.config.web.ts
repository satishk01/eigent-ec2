// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========
// Web-only configuration for EC2 deployment (without Electron)
// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========

import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      exclude: ['@stackframe/react'],
      force: true,
    },
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    },
  };
});
