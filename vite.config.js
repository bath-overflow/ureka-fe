import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Node의 내장 http-proxy 로깅을 활성화할 수 있게 핸들링
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ureka.cspc.me',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        rewrite: path => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`🛰️ [PROXY] ${req.method} ${req.url} → ${proxyReq.getHeader('host')}${proxyReq.path}`);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`✅ [PROXY RES] ${req.method} ${req.url} → ${proxyRes.statusCode}`);
          });

          proxy.on('error', (err, req, res) => {
            console.error(`❌ [PROXY ERROR] ${req.method} ${req.url}:`, err.message);
          });
        },
      },
    },
  },
});
