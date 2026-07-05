<script lang="ts">
  import type { ISentenceScrambleExercise } from '../../lib/types';
  import Chip from './Chip.svelte';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';

  let { exercise, colors } = $props<{
    exercise: ISentenceScrambleExercise;
    colors: any;
  }>();

  type ScrambledWord = { word: string; id: number };

  let solution = $state<ScrambledWord[]>([]);
  let bank = $state<ScrambledWord[]>([]);
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  $effect(() => {
      // Setup initial state when exercise changes
      bank = exercise.scrambledWords.map((word: string, index: number) => ({ word, id: index }));
      solution = [];
      feedback = null;
  });

  const addToSolution = (wordToAdd: ScrambledWord) => {
      solution = [...solution, wordToAdd];
      bank = bank.filter(w => w.id !== wordToAdd.id);
      feedback = null;
  };

  const removeFromSolution = (wordToRemove: ScrambledWord) => {
      solution = solution.filter(w => w.id !== wordToRemove.id);
      bank = [...bank, wordToRemove];
      feedback = null;
  };

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Sentence Scramble', exercise, solution.map(w => w.word).join(' '));
      feedback = result || null;
      loading = false;
  };

</script>

<div class="text-base font-casual {colors.textOnLight}">
    <p class="mb-2 font-bold opacity-70 text-sm uppercase">Build the sentence</p>
    <div class="min-h-[4rem] p-3 rounded-2xl border-4 flex flex-wrap gap-2 items-center transition-colors mb-4 border-dashed border-slate-300 bg-slate-50">
        {#if solution.length === 0}
            <span class="text-slate-400 italic text-sm w-full text-center">Click words below...</span>
        {/if}
        {#each solution as w (w.id)}
             <Chip
                text={w.word}
                onclick={() => removeFromSolution(w)}
                chipColors={colors.chip}
            />
        {/each}
    </div>

    <div class="flex flex-wrap gap-2 p-3 bg-slate-100 rounded-2xl border-2 border-slate-200">
        {#if bank.length === 0}
             <span class="text-slate-400 italic text-sm w-full text-center">All words used.</span>
        {/if}
        {#each bank as w (w.id)}
             <Chip
                text={w.word}
                onclick={() => addToSolution(w)}
                chipColors={{ bg: 'bg-white', text: 'text-slate-800', border: 'border-slate-300' }}
            />
        {/each}
    </div>

    {#if solution.length > 0}
        <FeedbackSection
            onCheck={handleCheck}
            {feedback}
            {loading}
            buttonColor={colors}
        />
    {/if}
</div>
