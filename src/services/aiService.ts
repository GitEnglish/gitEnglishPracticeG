// aiService.ts
// ============
// AI entry point for the app. All AI features (exercise generation and
// answer feedback) are served by openrouterService via direct OpenRouter calls.
export { generateExercise, generateExercises, checkAnswerWithAI, ACTIVE_MODEL, OPENROUTER_ENDPOINT } from './openrouterService';
