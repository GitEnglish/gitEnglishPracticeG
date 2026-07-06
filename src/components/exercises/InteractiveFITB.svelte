<script lang="ts">
  import type { IFITBExercise, ICollocationExercise, IPhrasalVerbGapFillExercise } from '../../lib/types';
  import Chip from './Chip.svelte';

  let { exercise, colors } = $props<{
    exercise: IFITBExercise | ICollocationExercise | IPhrasalVerbGapFillExercise;
    colors: any;
  }>();

  let droppedWord = $state<string | null>(null);
  let status = $state<'correct' | 'incorrect' | 'neutral'>('neutral');

  const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const word = e.dataTransfer?.getData('text/plain');
      if (word) {
          droppedWord = word;
          status = word === exercise.answer ? 'correct' : 'incorrect';
      }
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
  {#if 'collocation' in exercise}
      <p class="text-sm italic opacity-70 mb-2 font-playful">Collocation: {exercise.collocation}</p>
  {/if}
  {#if 'phrasalVerb' in exercise}
      <p class="text-sm italic opacity-70 mb-2 font-playful">Phrasal Verb: {exercise.phrasalVerb}</p>
  {/if}
  <p class="leading-loose">
      {exercise.question.split('[BLANK]')[0]}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span
          ondrop={handleDrop}
          ondragover={(e) => e.preventDefault()}
          class="inline-flex items-center justify-center min-w-[100px] h-8 mx-1 px-2 border-b-2 border-dashed rounded-lg text-center align-baseline transition-all font-semibold {status === 'correct' ? 'bg-green-100 border-green-500 text-green-900 ring-2 ring-green-200' : status === 'incorrect' ? 'bg-red-100 border-red-500 text-red-900 ring-2 ring-red-200' : `${colors.chip.bg} ${colors.chip.border}`}"
      >
          {#if droppedWord}
              {droppedWord}
          {:else}
              <span class="opacity-30 text-xs font-normal">drop here</span>
          {/if}
      </span>
      {exercise.question.split('[BLANK]')[1]}
  </p>
  <div class="mt-4 flex flex-wrap gap-3">
      {#each exercise.wordBank as word}
          <Chip
              text={word}
              draggable={true}
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
