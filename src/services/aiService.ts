// aiService.ts
// ============
// Single AI entry point for the app. All AI features (exercise generation and
// answer feedback) are served by the OpenRouter-backed deepseekService.
export { generateExercise, generateExercises, checkAnswerWithAI, OPENROUTER_MODEL, OPENROUTER_BASE_URL } from './deepseekService';
