<script lang="ts">
  import type { IStorySequencingExercise } from '../../lib/types';
  import { shuffleArray } from './utils';

  let { exercise, colors } = $props<{
    exercise: IStorySequencingExercise;
    colors: any;
  }>();

  let parts = $state<string[]>([]);
  let status = $state<'correct' | 'incorrect' | 'neutral'>('neutral');

  let dragItemIndex = $state<number | null>(null);
  let dragOverItemIndex = $state<number | null>(null);

  $effect(() => {
    parts = shuffleArray(exercise.storyParts);
    status = 'neutral';
  });

  const handleDragStart = (e: DragEvent, index: number) => {
      dragItemIndex = index;
  };

  const handleDragEnter = (e: DragEvent, index: number) => {
      dragOverItemIndex = index;
  };

  const handleDragEnd = () => {
      if (dragItemIndex !== null && dragOverItemIndex !== null) {
          const newParts = [...parts];
          const draggedItemContent = newParts.splice(dragItemIndex, 1)[0];
          newParts.splice(dragOverItemIndex, 0, draggedItemContent);
          parts = newParts;
      }
      dragItemIndex = null;
      dragOverItemIndex = null;
      status = 'neutral';
  };

  const checkAnswer = () => {
      const isCorrect = parts.join('') === exercise.storyParts.join('');
      status = isCorrect ? 'correct' : 'incorrect';
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <h4 class="font-playful text-xl mb-2">{exercise.title}</h4>
    <ul class="space-y-2 border-4 border-dashed p-2 rounded-2xl transition-colors {status === 'correct' ? 'border-green-500 bg-green-50' : status === 'incorrect' ? 'border-red-500 bg-red-50' : 'border-transparent'}">
        {#each parts as part, i}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                draggable="true"
                ondragstart={(e) => handleDragStart(e, i)}
                ondragenter={(e) => handleDragEnter(e, i)}
                ondragend={handleDragEnd}
                ondragover={(e) => e.preventDefault()}
                class="p-3 rounded-xl cursor-grab active:cursor-grabbing bg-white border-2 {colors.chip.border} shadow-sm hover:shadow-md transition-all"
            >
               <span class="font-bold mr-2 text-slate-500">{i+1}.</span> {part}
            </li>
        {/each}
    </ul>
     <button onclick={checkAnswer} class="w-full mt-3 p-2.5 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 bg-slate-700">Check Order</button>
</div>
