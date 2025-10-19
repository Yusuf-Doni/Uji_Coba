import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Get backend URLs from environment variables with fallbacks

  // const apiBaseUrl = env.VITE_API_BASE_URL || 'http://192.168.20.71:8085';
  // const oauthBaseUrl = env.VITE_OAUTH_BASE_URL || apiBaseUrl;
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://139.180.140.143:13010';
  const oauthBaseUrl = env.VITE_OAUTH_BASE_URL || 'http://139.180.140.143:13010';
  // const apiBaseUrl = env.VITE_API_BASE_URL || 'http://192.168.1.236:8085';
  // const oauthBaseUrl = env.VITE_OAUTH_BASE_URL || 'http://192.168.1.236:8085';


  console.log('Environment Configuration:');
  console.log('  API Base URL:', apiBaseUrl);
  console.log('  OAuth Base URL:', oauthBaseUrl);

  return {
    plugins: [
      vue(),
      Components({
        resolvers: [PrimeVueResolver()]
      })
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    
    server: {
      host: '0.0.0.0', // penting agar bisa diakses dari perangkat lain dalam jaringan
      port: 5173,      // ganti sesuai kebutuhan (default Vite)
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('→ Sending Request to Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('← Response from Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/oauth/sendUrl': {
          target: oauthBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('OAuth proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('→ Sending OAuth Request:', req.method, req.url);
              // Remove sensitive headers
              proxyReq.removeHeader('authorization');
              proxyReq.removeHeader('Authorization');
              proxyReq.removeHeader('cookie');
              proxyReq.removeHeader('Cookie');
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('← OAuth Response:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/oauth/azureuri': {
          target: oauthBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('OAuth proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('→ Sending Azure OAuth Request:', req.method, req.url);
              proxyReq.removeHeader('authorization');
              proxyReq.removeHeader('Authorization');
              proxyReq.removeHeader('cookie');
              proxyReq.removeHeader('Cookie');
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('← Azure OAuth Response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  };
});
