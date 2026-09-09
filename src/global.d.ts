// global.d.ts
// ===========
// vite.config.ts replaces `process.env.*` expressions with literal values at
// build time (see the `define` option), so these never exist at runtime.
// This declaration just keeps TypeScript happy for those references.
declare const process: {
  env: {
    OPENROUTER_API_KEY?: string;
    DEEPSEEK_API_KEY?: string;
    OPENROUTER_MODEL?: string;
    OPENROUTER_BASE_URL?: string;
    API_KEY?: string;
    GEMINI_API_KEY?: string;
  };
};
