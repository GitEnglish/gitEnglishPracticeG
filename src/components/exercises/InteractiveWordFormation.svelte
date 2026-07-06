<script lang="ts">
  import type { IWordFormationExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService'; // Ensure this export exists or port it

  let { exercise, colors } = $props<{
    exercise: IWordFormationExercise;
    colors: any;
  }>();

  let userInput = $state('');
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Word Formation', exercise, userInput);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <p class="mb-2 font-bold text-sm uppercase tracking-wide opacity-70">Task</p>
    <p class="mb-3 leading-relaxed">
        {exercise.question.replace('[BLANK]', '______')} <span class="font-bold italic text-lg ml-2 font-playful">({exercise.rootWord})</span>
    </p>
    <div class="flex gap-2">
        <input
            type="text"
            value={userInput}
            oninput={(e) => {
                userInput = e.currentTarget.value;
                feedback = null;
            }}
            class="flex-grow p-2 rounded-xl border-2 {colors.chip.border} bg-white text-slate-900 focus:ring-2 focus:ring-slate-300 outline-none transition-all font-bold"
            placeholder="Type correct form..."
        />
    </div>
    <!-- Note: FeedbackSection was ported to not need hasInput, we rely on disabled state handled by consumers or itself based on loading. -->
    <div class="mt-4">
        {#if userInput.length > 0}
            <FeedbackSection
                onCheck={handleCheck}
                {feedback}
                {loading}
                buttonColor={colors}
            />
        {/if}
    </div>
</div>
