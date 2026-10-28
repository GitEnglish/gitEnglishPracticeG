<script lang="ts">
  import type { IFITBExercise, ICollocationExercise, IPhrasalVerbGapFillExercise } from '../../lib/types';
  import Chip from './Chip.svelte';

  let { exercise, colors, onAnswer } = $props<{
    exercise: IFITBExercise | ICollocationExercise | IPhrasalVerbGapFillExercise;
    colors: any;
    onAnswer?: (attempt: { concept?: string; category?: 'Vocabulary' | 'Grammar'; isCorrect: boolean; studentAnswer: any; questionText?: string }) => void;
  }>();

  let droppedWord = $state<string | null>(null);
  let status = $state<'correct' | 'incorrect' | 'neutral'>('neutral');

  let questionParts = $derived((exercise?.question || '').split(/\[BLANK\]|_{2,}/));
  let wordBank = $derived(Array.isArray(exercise?.wordBank) ? exercise.wordBank : []);

  const selectWord = (word: string) => {
      if (!word) return;
      droppedWord = word;
      const isCorrect = word === exercise.answer;
      status = isCorrect ? 'correct' : 'incorrect';
      const concept =
        ('collocation' in exercise && exercise.collocation) ||
        ('phrasalVerb' in exercise && exercise.phrasalVerb) ||
        exercise.answer ||
        word;
      onAnswer?.({
        concept,
        category: 'Vocabulary',
        isCorrect,
        studentAnswer: word,
        questionText: exercise.question
      });
  };

  const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const word = e.dataTransfer?.getData('text/plain');
      if (word) selectWord(word);
  };
</script>

<div class="text-sm font-casual {colors.textOnLight}">
  {#if 'collocation' in exercise}
      <p class="text-sm italic opacity-70 mb-2 font-playful">Collocation: {exercise.collocation}</p>
  {/if}
  {#if 'phrasalVerb' in exercise}
      <p class="text-sm italic opacity-70 mb-2 font-playful">Phrasal Verb: {exercise.phrasalVerb}</p>
  {/if}
  <p class="leading-loose">
      {questionParts[0] ?? ''}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span
          ondrop={handleDrop}
          ondragover={(e) => e.preventDefault()}
          class="inline-flex items-center justify-center min-w-[100px] h-8 mx-1 px-2 border-b-2 border-dashed rounded-lg text-center align-baseline transition-all font-semibold {status === 'correct' ? 'bg-malachite-100 border-malachite-500 text-malachite-900 ring-2 ring-malachite-200' : status === 'incorrect' ? 'bg-cinnabar-100 border-cinnabar-500 text-cinnabar-900 ring-2 ring-cinnabar-200' : `${colors.chip.bg} ${colors.chip.border}`}"
      >
          {#if droppedWord}
              {droppedWord}
          {:else}
              <span class="opacity-30 text-xs font-normal">drop or tap</span>
          {/if}
      </span>
      {#if questionParts.length > 1}
          {questionParts.slice(1).join(' ')}
      {/if}
  </p>
  <div class="mt-4 flex flex-wrap gap-3">
      {#each wordBank as word}
          <Chip
              text={word}
              draggable={true}
              onclick={() => selectWord(word)}
              ondragstart={(e: DragEvent) => {
                  if (e.dataTransfer) {
                      e.dataTransfer.setData('text/plain', word);
                  }
              }}
              chipColors={colors.chip}
          />
      {/each}
  </div>
</div>
