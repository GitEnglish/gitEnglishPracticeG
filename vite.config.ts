import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

function healthCheckPlugin() {
  const handler = (req: any, res: any, next: any) => {
    const url = req.url?.split('?')[0];
    if (url === '/api/health' || url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }
    next();
  };
  return {
    name: 'vite-plugin-health-check',
    configureServer(server: any) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      tailwindcss(),
      svelte(),
      healthCheckPlugin()
    ],
    define: {
      // Never embed secret API keys into the browser bundle.
      // AI requests are proxied through the gitEnglish server (/api/internal/practice-genie/ai).
      'process.env.PRACTICE_GENIE_AI_PROXY_URL': JSON.stringify(
        env.PRACTICE_GENIE_AI_PROXY_URL || 'https://gitenglish.com/api/internal/practice-genie/ai'
      ),
      'process.env.OPENROUTER_MODEL': JSON.stringify(env.OPENROUTER_MODEL || 'xiaomi/mimo-v2.6-flash')
    }
  }
})
