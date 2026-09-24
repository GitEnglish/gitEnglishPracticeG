<script lang="ts">
  import type { IErrorCorrectionExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';

  let { exercise, colors } = $props<{
    exercise: IErrorCorrectionExercise;
    colors: any;
  }>();

  let userInput = $state('');
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Error Correction', exercise, userInput);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <p class="mb-2 font-playful text-lg text-cinnabar-600">Incorrect:</p>
    <div class="mb-4 p-3 bg-cinnabar-50 rounded-xl border-l-4 border-cinnabar-300 italic text-cinnabar-900">"{exercise.incorrectSentence}"</div>
    <p class="mb-2 font-playful text-lg text-malachite-600">Correct:</p>
    <input
        type="text"
        value={userInput}
        oninput={(e) => {
            userInput = e.currentTarget.value;
            feedback = null;
        }}
        class="w-full p-3 rounded-xl border-2 {colors.chip.border} bg-fossil-50 text-fossil-900 focus:ring-2 focus:ring-fossil-300 outline-none transition-all font-medium"
        placeholder="Type corrected sentence..."
    />
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
