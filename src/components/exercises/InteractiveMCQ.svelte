<script lang="ts">
  import type { IMultipleChoiceExercise, IRuleDiscoveryExercise, ISpotTheDifferenceExercise, IPredictionExercise, IReadingGistExercise, IPolitenessScenariosExercise, IInferringMeaningExercise } from '../../lib/types';

  let { exercise, colors } = $props<{
    exercise: IMultipleChoiceExercise | IRuleDiscoveryExercise | ISpotTheDifferenceExercise | IPredictionExercise | IReadingGistExercise | IPolitenessScenariosExercise | IInferringMeaningExercise;
    colors: any;
  }>();

  let selectedOption = $state<string | null>(null);
  let status = $state<'correct' | 'incorrect' | 'neutral'>('neutral');

  const handleSelect = (option: string) => {
      selectedOption = option;
      status = option === exercise.correctAnswer ? 'correct' : 'incorrect';
  };
</script>

<div class="space-y-4 font-casual">
    <!-- Context/Setup fields based on exercise type -->
    {#if 'sentences' in exercise}
        <div class="bg-fossil-50/50 p-3 rounded-xl border border-fossil-200 mb-3 text-sm">
            {#each exercise.sentences as sentence}
                <p class="mb-1 last:mb-0 text-fossil-700">{sentence}</p>
            {/each}
        </div>
    {/if}
    {#if 'sentenceA' in exercise}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
            <div class="bg-fossil-50/50 p-3 rounded-xl border border-fossil-200"><span class="font-bold text-fossil-500 mr-2">A:</span><span class="text-fossil-800">{exercise.sentenceA}</span></div>
            <div class="bg-fossil-50/50 p-3 rounded-xl border border-fossil-200"><span class="font-bold text-fossil-500 mr-2">B:</span><span class="text-fossil-800">{exercise.sentenceB}</span></div>
        </div>
    {/if}
    {#if 'storyStart' in exercise}
        <div class="bg-fossil-50/50 p-4 rounded-xl border-l-4 border-l-blue-400 italic mb-4 text-fossil-700">"{exercise.storyStart}"</div>
    {/if}
    {#if 'text' in exercise}
        <div class="bg-fossil-50/50 p-4 rounded-xl text-sm leading-relaxed mb-4 max-h-48 overflow-y-auto text-fossil-700 custom-scrollbar">{exercise.text}</div>
    {/if}
    {#if 'scenario' in exercise}
        <div class="bg-fossil-50/50 p-3 rounded-xl border border-fossil-200 mb-3 text-fossil-700">{exercise.scenario}</div>
    {/if}
    {#if 'dialogue' in exercise}
        <div class="bg-fossil-50/50 p-3 rounded-xl border-l-4 border-l-purple-400 italic mb-4 whitespace-pre-wrap text-fossil-700">{exercise.dialogue}</div>
    {/if}

    <!-- The actual Question -->
    {#if 'question' in exercise}
         <p class="font-bold text-lg mb-3 {colors.textOnLight} font-playful">{exercise.question}</p>
    {/if}

    <div class="flex flex-col gap-2">
        {#each exercise.options as option}
            <button
                onclick={() => handleSelect(option)}
                class="text-left px-4 py-3 rounded-xl border-2 transition-all font-medium {selectedOption === option ? (status === 'correct' ? 'bg-malachite-100 border-malachite-500 text-malachite-900 shadow-sm' : 'bg-cinnabar-100 border-cinnabar-500 text-cinnabar-900 shadow-sm') : `bg-fossil-50 border-fossil-200 text-fossil-700 hover:border-fossil-300 hover:bg-fossil-50`}"
            >
                <div class="flex items-center">
                    <div class="w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center {selectedOption === option ? (status === 'correct' ? 'border-malachite-500 bg-malachite-500' : 'border-cinnabar-500 bg-cinnabar-500') : 'border-fossil-300'}">
                        {#if selectedOption === option}
                            <div class="w-2 h-2 bg-fossil-50 rounded-full"></div>
                        {/if}
                    </div>
                    {option}
                </div>
            </button>
        {/each}
    </div>
</div>
