import * as mistral from './deepseekService';
import { ExerciseType, Difficulty, Tone } from '../enums';

/**
 * Unified AI Service.
 * Currently routes all requests to DeepSeek.
 */

export const generateExercises = async (
  exerciseType: ExerciseType,
  difficulty: Difficulty,
  tone: Tone,
  theme: string,
  amount: number,
  focusVocabulary: string[],
  inclusionRate: number,
  focusGrammar: string[],
  grammarInclusionRate: number
) => {
  console.log("Routing generation task to DeepSeek.");
  return mistral.generateExercises(
    exerciseType,
    difficulty,
    tone,
    theme,
    amount,
    focusVocabulary,
    inclusionRate,
    focusGrammar,
    grammarInclusionRate
  );
};

export const checkAnswerWithAI = async (
  exerciseType: string,
  exerciseContext: any,
  userResponse: any
) => {
  console.log("Routing checkAnswer task to DeepSeek.");
  return mistral.checkAnswerWithAI(exerciseType, exerciseContext, userResponse);
};
