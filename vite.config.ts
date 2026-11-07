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
  const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
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
      allowedHosts: [publicDomain].filter((host): host is string => Boolean(host)),
      hmr: publicDomain
        ? { protocol: 'wss', host: publicDomain, clientPort: 443 }
        : undefined,
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
      // OpenRouter (OpenAI-compatible) — set in .env locally or Railway vars in prod.
      // VITE_* names are accepted as fallbacks so a Railway variable added with
      // the Vite prefix still gets baked into the existing process.env reads.
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || env.VITE_API_KEY || ''),
      'process.env.OPENROUTER_MODEL': JSON.stringify(env.OPENROUTER_MODEL || env.VITE_OPENROUTER_MODEL || 'xiaomi/mimo-v2.6-flash'),
      'process.env.OPENROUTER_BASE_URL': JSON.stringify(env.OPENROUTER_BASE_URL || env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'),
    }
  }
})
