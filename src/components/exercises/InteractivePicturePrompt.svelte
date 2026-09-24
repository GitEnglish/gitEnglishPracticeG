<script lang="ts">
  import type { IPicturePromptExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';
  import Field from '../../lib/components/Field.svelte';

  let { exercise, colors } = $props<{
    exercise: IPicturePromptExercise;
    colors: any;
  }>();

  let response = $state('');
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Picture Prompt Questions', exercise, response);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
  <h4 class="font-playful text-xl mb-2">{exercise.title}</h4>
  <div class="bg-black/5 p-2 rounded-2xl border-2 border-dashed border-fossil-300 mb-4">
      <img src={exercise.imageUrl} alt={exercise.prompt} class="w-full h-auto max-h-[300px] rounded-xl object-contain shadow-sm mx-auto" />
  </div>
  <Field label="Your Questions" class="normal-case tracking-normal font-sans">
    {#snippet children(fid)}
      <textarea
        id={fid}
        rows={3}
        class="w-full p-3 rounded-xl border-2 {colors.chip.border} bg-fossil-50 text-fossil-900 focus:ring-2 focus:ring-accent outline-none transition-all resize-none shadow-inner"
        placeholder="Write 3-5 questions about the scene..."
        value={response}
        oninput={(e) => {
            response = e.currentTarget.value;
            feedback = null;
        }}
      ></textarea>
    {/snippet}
  </Field>
  <div class="mt-4">
    {#if response.length > 5}
        <FeedbackSection
          onCheck={handleCheck}
          {feedback}
          {loading}
          buttonColor={colors}
        />
    {/if}
  </div>
</div>
