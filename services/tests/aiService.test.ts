import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises, checkAnswerWithAI } from '../aiService';
import * as mistral from '../deepseekService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

vi.mock('../deepseekService');

describe('aiService Routing', () => {
    it('should route generateExercises to DeepSeek', async () => {
        await generateExercises(
            ExerciseType.FITB, Difficulty.A1, Tone.Casual, 'test', 1, [], 0, [], 0
        );
        expect(mistral.generateExercises).toHaveBeenCalled();
    });

    it('should route checkAnswerWithAI to DeepSeek', async () => {
        await checkAnswerWithAI('type', {}, 'response');
        expect(mistral.checkAnswerWithAI).toHaveBeenCalled();
        // DeepSeek doesn't have checkAnswer exported/mocked in this context but logically we check mistral was called
    });
});
