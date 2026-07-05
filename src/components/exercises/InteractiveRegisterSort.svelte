<script lang="ts">
  import type { IRegisterSortExercise } from '../../lib/types';
  import Chip from './Chip.svelte';
  import { shuffleArray } from './utils';

  let { exercise, colors } = $props<{
    exercise: IRegisterSortExercise;
    colors: any;
  }>();

  let unclassified = $state<string[]>([]);
  let classified = $state<Record<string, string[]>>({});

  $effect(() => {
      unclassified = shuffleArray(exercise.phrases);
      const newClassified: Record<string, string[]> = {};
      exercise.categories.forEach((cat: string) => {
          newClassified[cat] = [];
      });
      classified = newClassified;
  });

  const handleDrop = (e: DragEvent, category: string) => {
      e.preventDefault();
      const phrase = e.dataTransfer?.getData('text/plain');
      if (!phrase) return;

      const newClassified = { ...classified };
      for(const cat in newClassified) {
          newClassified[cat] = newClassified[cat].filter(p => p !== phrase);
      }
      newClassified[category] = [...newClassified[category], phrase];
      classified = newClassified;
      unclassified = unclassified.filter(p => p !== phrase);
  };

  const handleDragStart = (e: DragEvent, phrase: string) => {
      e.dataTransfer?.setData('text/plain', phrase);
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <h4 class="font-playful text-xl mb-2">{exercise.title}</h4>

    {#if unclassified.length > 0}
         <div class="p-3 border-2 border-dashed border-slate-300 rounded-2xl mb-4 bg-slate-50">
            <h5 class="font-bold text-xs uppercase text-slate-400 mb-2">Bank</h5>
            <div class="flex flex-wrap gap-2">
                {#each unclassified as phrase}
                    <Chip
                        text={phrase}
                        draggable={true}
                        ondragstart={(e) => handleDragStart(e, phrase)}
                        chipColors={colors.chip}
                    />
                {/each}
            </div>
        </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each exercise.categories as category}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                ondrop={(e) => handleDrop(e, category)}
                ondragover={(e) => e.preventDefault()}
                class="min-h-[120px] p-4 rounded-xl border-2 transition-all border-slate-200 bg-white"
            >
                <h5 class="font-bold border-b border-slate-100 pb-2 mb-3 text-center">{category}</h5>
                <div class="flex flex-col gap-2">
                    {#each classified[category] || [] as phrase}
                        <div class="p-2 bg-slate-100 rounded-lg text-sm shadow-sm text-center font-medium border border-slate-200">
                            {phrase}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>
