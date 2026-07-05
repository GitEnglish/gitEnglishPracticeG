<script lang="ts">
  import type { IDictoGlossExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';

  let { exercise, colors } = $props<{
    exercise: IDictoGlossExercise;
    colors: any;
  }>();

  let showText = $state(true);
  let response = $state('');
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Dicto-Gloss', exercise, response);
      feedback = result || null;
      loading = false;
  };

  let buttonBg = $derived(colors.textOnLight.replace('text-', 'bg-'));
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <h4 class="font-playful text-xl mb-2">{exercise.title}</h4>
    <div class="p-3 rounded-2xl transition-all duration-300 {colors.chip.bg} border-2 {colors.chip.border}">
        <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold uppercase opacity-60">Source Text</span>
            <button onclick={() => showText = !showText} class="px-3 py-1 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 {buttonBg}">
                {showText ? 'Hide' : 'Show'}
            </button>
        </div>
        {#if showText}
            <p class="text-lg italic p-3 bg-white/80 rounded-xl shadow-sm font-playful leading-relaxed">{exercise.text}</p>
        {:else}
            <div class="h-24 flex items-center justify-center italic opacity-50 bg-black/5 rounded-xl">Text Hidden</div>
        {/if}
    </div>
    <textarea
        rows={4}
        class="mt-4 w-full p-3 rounded-xl border-2 {colors.chip.border} bg-white text-slate-900 focus:ring-2 focus:ring-slate-300 outline-none transition-all resize-none shadow-inner"
        placeholder="Reconstruct the text here from memory..."
        value={response}
        oninput={(e) => {
            response = e.currentTarget.value;
            feedback = null;
        }}
    ></textarea>
    <div class="mt-4">
        <FeedbackSection
            onCheck={handleCheck}
            {feedback}
            {loading}
            buttonColor={colors}
        />
    </div>
</div>
