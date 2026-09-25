<script lang="ts">
  import type { IReadingDetailExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';
  import Field from '../../lib/components/Field.svelte';

  let { exercise, colors } = $props<{
    exercise: IReadingDetailExercise;
    colors: any;
  }>();

  let answers = $state<Record<number, string>>({});
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Reading for Detail', exercise, answers);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-sm font-casual {colors.textOnLight}">
    <h4 class="font-playful text-2xl mb-2">{exercise.title}</h4>
    <div class="p-4 rounded-2xl bg-fossil-50 border-2 {colors.chip.border} mb-6 shadow-inner leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
        {exercise.text}
    </div>
    <div class="space-y-4">
        {#each exercise.questions as q, i}
            <div class="bg-fossil-50 p-3 rounded-xl border border-fossil-200">
                <Field label={q.question} class="normal-case tracking-normal font-sans">
                    {#snippet children(fid)}
                        <input
                            id={fid}
                            type="text"
                            class="w-full p-2 rounded-xl border-2 {colors.chip.border} bg-fossil-50 text-fossil-900 focus:ring-2 focus:ring-accent outline-none transition-all"
                            placeholder="Answer here..."
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
