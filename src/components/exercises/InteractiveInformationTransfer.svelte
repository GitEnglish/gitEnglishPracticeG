<script lang="ts">
  import type { IInformationTransferExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';
  import Field from '../../lib/components/Field.svelte';

  let { exercise, colors } = $props<{
    exercise: IInformationTransferExercise;
    colors: any;
  }>();

  let answers = $state<Record<number, string>>({});
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Information Transfer', exercise, answers);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-sm font-casual {colors.textOnLight}">
    <h4 class="font-playful text-xl mb-2">{exercise.title}</h4>
    <p class="text-sm p-3 rounded-xl bg-fossil-50 border border-fossil-200 mb-4 whitespace-pre-wrap shadow-sm">{exercise.text}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each exercise.formFields as field, i}
            <div class="bg-fossil-50 p-3 rounded-xl border border-fossil-100">
                <Field label={field} class="normal-case tracking-normal font-sans">
                    {#snippet children(fid)}
                        <input
                            id={fid}
                            type="text"
                            class="w-full p-2 rounded-lg border-2 {colors.chip.border} bg-fossil-50 text-fossil-900 focus:ring-2 focus:ring-accent outline-none"
                            value={answers[i] || ''}
                            oninput={(e) => {
                                answers[i] = e.currentTarget.value;
                                feedback = null;
                            }}
                        />
                    {/snippet}
                </Field>
            </div>
        {/each}
    </div>
    <div class="mt-4">
        <FeedbackSection
            onCheck={handleCheck}
            {feedback}
            {loading}
            buttonColor={colors}
        />
    </div>
</div>
