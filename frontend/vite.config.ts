import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Read ports from repo-root .env (and frontend/.env)
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const localEnv = loadEnv(mode, __dirname, '');
  const env = { ...rootEnv, ...localEnv };

  const apiPort = env.APP_PORT || env.API_PORT || '3000';
  const webPort = parseInt(env.WEB_PORT || env.VITE_PORT || '5173', 10);
  const apiProxy = env.VITE_API_PROXY || `http://localhost:${apiPort}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Bundle shared from source so Vite gets proper ESM named exports
        '@expenseflow/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      },
    },
    server: {
      host: true,
      port: webPort,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: apiProxy,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: webPort,
      strictPort: true,
    },
  };
});
