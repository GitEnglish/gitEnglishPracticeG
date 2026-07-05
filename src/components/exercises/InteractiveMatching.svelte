<script lang="ts">
  import type { IMatchingExercise, IFunctionMatchingExercise } from '../../lib/types';
  import { shuffleArray } from './utils';

  let { exercise, colors } = $props<{
    exercise: IMatchingExercise | IFunctionMatchingExercise;
    colors: any;
  }>();

  type MatchInfo = { answerIndex: number; isCorrect: boolean };

  let shuffledAnswers = $state<string[]>([]);
  let selectedPrompt = $state<number | null>(null);
  let matches = $state<Record<number, MatchInfo>>({});

  $effect(() => {
    // Reset state when exercise changes
    shuffledAnswers = shuffleArray(exercise.answers);
    selectedPrompt = null;
    matches = {};
  });

  const handleSelectPrompt = (promptIndex: number) => {
      if (matches[promptIndex]) return;
      selectedPrompt = promptIndex;
  };

  const handleSelectAnswer = (answerIndex: number) => {
      if (selectedPrompt === null || Object.values(matches).some(m => m.answerIndex === answerIndex)) {
          return;
      }

      const isCorrect = exercise.answers[selectedPrompt] === shuffledAnswers[answerIndex];
      matches[selectedPrompt] = { answerIndex, isCorrect };
      selectedPrompt = null;
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <p class="mb-3 font-bold text-sm opacity-70 uppercase">Connect the pairs</p>
    <div class="flex gap-4 md:gap-8">
        <div class="flex-1 space-y-2">
            {#each exercise.prompts as prompt, promptIndex}
                {@const match = matches[promptIndex]}
                {@const isSelected = selectedPrompt === promptIndex}
                {@const buttonClass = match
                    ? (match.isCorrect ? 'bg-green-100 text-green-900 border-green-500' : 'bg-red-100 text-red-900 border-red-500')
                    : isSelected
                        ? `bg-slate-700 text-white border-transparent scale-105 shadow-md`
                        : `bg-white border-2 ${colors.chip.border} ${colors.chip.text}`}

                <button
                    onclick={() => handleSelectPrompt(promptIndex)}
                    disabled={!!match}
                    class="w-full p-3 rounded-xl text-sm font-medium text-left transition-all {buttonClass}"
                >
                    {prompt}
                </button>
            {/each}
        </div>
        <div class="flex-1 space-y-2">
            {#each shuffledAnswers as answer, answerIndex}
                {@const isMatched = Object.values(matches).some(m => m.answerIndex === answerIndex)}
                <button
                    onclick={() => handleSelectAnswer(answerIndex)}
                    disabled={isMatched || selectedPrompt === null}
                    class="w-full p-3 rounded-xl text-sm font-medium border-2 transition-all {isMatched ? 'opacity-30 bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400' : selectedPrompt !== null ? 'hover:scale-105 hover:shadow-md hover:border-slate-400 cursor-pointer bg-white border-dashed border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-500 cursor-not-allowed'}"
                >
                    {answer}
                </button>
            {/each}
        </div>
    </div>
</div>
