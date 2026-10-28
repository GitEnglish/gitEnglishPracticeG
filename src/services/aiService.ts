// aiService.ts
// ============
// Single AI entry point for the app. All AI features (exercise generation and
// answer feedback) are served by openrouterService.
export { generateExercise, generateExercises, checkAnswerWithAI, ACTIVE_MODEL, PROXY_ENDPOINT } from './openrouterService';
