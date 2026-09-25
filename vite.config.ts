import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          // Motion study page for the deck menu, so the motion can be judged on
          // the deployed site rather than only on a local dev server.
          deck: 'deck-demo.html',
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      tailwindcss(),
      svelte()
    ],
    define: {
      // Legacy Gemini vars (kept for compatibility with the legacy_react reference)
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // OpenRouter / DeepSeek (OpenAI-compatible) — set in .env locally or Railway vars in prod
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY ?? env.DEEPSEEK_API_KEY),
      'process.env.OPENROUTER_MODEL': JSON.stringify(env.OPENROUTER_MODEL || 'mistralai/mistral-small-24b-instruct-2501'),
      'process.env.OPENROUTER_BASE_URL': JSON.stringify(env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'),
      // Direct Mistral. When MISTRAL_API_KEY is set the app talks to
      // api.mistral.ai and ignores the OpenRouter variables entirely.
      'process.env.MISTRAL_API_KEY': JSON.stringify(env.MISTRAL_API_KEY || ''),
      'process.env.MISTRAL_BASE_URL': JSON.stringify(env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1'),
      'process.env.MISTRAL_MODEL': JSON.stringify(env.MISTRAL_MODEL || 'mistral-small-2603')
    }
  }
})
