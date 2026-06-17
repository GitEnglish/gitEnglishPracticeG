import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../deepseekService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

describe('deepseekService', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        global.fetch = vi.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('should use dummy data when DEEPSEEK_API_KEY is missing', async () => {
        import.meta.env.VITE_DEEPSEEK_API_KEY = '';
         const result = await generateExercises(
            ExerciseType.FITB,
            Difficulty.A1,
            Tone.Casual,
            'test theme',
            1,
            [],
            0,
            [],
            0
        );
        expect(result).toHaveLength(1);
        expect(result[0].question).toContain('This is a [BLANK] sentence');
    });

    it('should call DeepSeek API when key is present', async () => {
        import.meta.env.VITE_DEEPSEEK_API_KEY = 'deepseek-key';

        const mockResponse = {
            ok: true,
            json: async () => ({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            result: [{ question: 'DeepSeek Q?', answer: 'A', wordBank: ['A', 'B'] }]
                        })
                    }
                }]
            })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await generateExercises(
            ExerciseType.FITB,
            Difficulty.A1,
            Tone.Casual,
            'test theme',
            1,
            [],
            0,
            [],
            0
        );

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.deepseek.com/chat/completions",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "Authorization": "Bearer deepseek-key"
                })
            })
        );
        expect(result).toHaveLength(1);
        expect(result[0].question).toBe('DeepSeek Q?');
    });

    it('should generate PicturePrompt exercises using Pollinations.ai without calling DeepSeek API', async () => {
        import.meta.env.VITE_DEEPSEEK_API_KEY = 'deepseek-key';

        // ExerciseType.PicturePrompt is special and handled locally
        // We do NOT mock fetch here because we expect it NOT to be called for PicturePrompt
        // (unless checking answer, but generateExercises is synchronous regarding API calls for PicturePrompt now)
        // Wait, generateExercises is async.

        const result: any = await generateExercises(
            ExerciseType.PicturePrompt,
            Difficulty.B1,
            Tone.Professional,
            'office meeting',
            2,
            [],
            0,
            [],
            0
        );

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result[0].title).toBe('Picture Prompt #1');
        expect(result[0].imageUrl).toContain('https://image.pollinations.ai/prompt/');
        expect(result[0].imageUrl).toContain('office%20meeting'); // Encoded

    });
});
