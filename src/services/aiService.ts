// aiService.ts
// ============
// Single AI entry point for the app. All AI features (exercise generation and
// answer feedback) are served by openrouterService.
export { generateExercise, generateExercises, checkAnswerWithAI, OPENROUTER_MODEL, OPENROUTER_BASE_URL } from './openrouterService';
