<script lang="ts">
  import type { IClozeParagraphExercise, IDialogueCompletionExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';

  let { exercise, colors } = $props<{
    exercise: IClozeParagraphExercise | IDialogueCompletionExercise;
    colors: any;
  }>();

  let text = $derived('paragraph' in exercise ? exercise.paragraph : exercise.dialogue);
  let textParts = $derived(text.split('[BLANK]'));

  let answers = $state<Record<number, string>>({});
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  // Clear answers if exercise changes
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    exercise;
    answers = {};
    feedback = null;
  });

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Cloze/Dialogue', exercise, answers);
      feedback = result || null;
      loading = false;
  };

  const handleChange = (index: number, value: string) => {
      answers[index] = value;
      feedback = null;
  };
</script>

<div class="text-base leading-loose font-casual {colors.textOnLight}">
    {#each textParts as part, index}
        {#each part.split('\n') as line, lineIndex}
            {#if lineIndex > 0}
                <br />
            {/if}
            <span>{line}</span>
        {/each}
        {#if index < textParts.length - 1}
            <select
                value={answers[index] || ''}
                onchange={(e) => handleChange(index, e.currentTarget.value)}
                class="mx-1 px-2 py-1 rounded-lg border-2 {colors.chip.border} {colors.chip.bg} {colors.chip.text} text-sm font-bold align-middle focus:ring-2 focus:ring-slate-300 outline-none cursor-pointer appearance-none"
            >
                <option value="">...</option>
                {#each exercise.wordBank as word}
                    <option value={word}>{word}</option>
                {/each}
            </select>
        {/if}
    {/each}
    <FeedbackSection
        onCheck={handleCheck}
        {feedback}
        {loading}
        buttonColor={colors}
    />
</div>
