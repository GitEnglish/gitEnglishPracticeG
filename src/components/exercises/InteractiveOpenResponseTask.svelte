<script lang="ts">
  import type { IMoralDilemmaExercise, IFunctionalWritingExercise, IProblemSolvingScenarioExercise, IRolePlayScenarioExercise, IStorytellingFromPromptsExercise, IJustifyYourOpinionExercise, IPictureComparisonExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';

  let { exercise, colors } = $props<{
    exercise: IMoralDilemmaExercise | IFunctionalWritingExercise | IProblemSolvingScenarioExercise | IRolePlayScenarioExercise | IStorytellingFromPromptsExercise | IJustifyYourOpinionExercise | IPictureComparisonExercise;
    colors: any;
  }>();

  let response = $state('');
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  let promptText = $derived.by(() => {
      if ('dilemma' in exercise) return exercise.dilemma;
      if ('scenario' in exercise && 'task' in exercise) return exercise.scenario;
      if ('scenario' in exercise) return exercise.scenario;
      if ('situation' in exercise) return `You are: ${exercise.character}.\nSituation: ${exercise.situation}`;
      if ('prompts' in exercise) return `Includes: ${exercise.prompts.map((p: string) => `"${p}"`).join(', ')}`;
      if ('statement' in exercise) return `"${exercise.statement}"`;
      return '';
  });

  let instruction = $derived.by(() => {
      if ('dilemma' in exercise) return 'What would you do? Explain.';
      if ('task' in exercise) return exercise.task;
      if ('scenario' in exercise && !('task' in exercise)) return 'Your Solution:';
      return '';
  });

  let exType = $derived.by(() => {
      if ('dilemma' in exercise) return 'Moral Dilemma';
      if ('scenario' in exercise && 'task' in exercise) return 'Functional Writing';
      if ('scenario' in exercise) return 'Problem Solving';
      if ('situation' in exercise) return 'Role Play';
      if ('prompts' in exercise) return 'Storytelling';
      if ('statement' in exercise) return 'Justify Opinion';
      if ('promptA' in exercise) return 'Picture Comparison';
      return 'Writing Task';
  });

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI(exType, exercise, response);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-base font-casual {colors.textOnLight} flex flex-col h-full">
    {#if 'title' in exercise}
        <h4 class="font-playful text-xl mb-3">{exercise.title}</h4>
    {/if}

    <div class="bg-white/50 p-4 rounded-xl border border-slate-200 mb-4 text-sm whitespace-pre-wrap text-slate-800 shadow-sm flex-shrink-0">
        {#if 'promptA' in exercise}
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-lg border shadow-sm"><strong>A:</strong> {exercise.promptA}</div>
                <div class="bg-white p-3 rounded-lg border shadow-sm"><strong>B:</strong> {exercise.promptB}</div>
            </div>
        {:else}
            {promptText}
        {/if}
    </div>

    <p class="font-bold mb-2 opacity-80 uppercase text-xs tracking-wider">{instruction}</p>

    <textarea
        class="w-full flex-grow min-h-[150px] p-4 rounded-xl border-2 {colors.chip.border} bg-white text-slate-900 focus:ring-2 focus:ring-slate-300 outline-none transition-all resize-none shadow-inner"
        placeholder="Type your response here..."
        value={response}
        oninput={(e) => {
            response = e.currentTarget.value;
            feedback = null;
        }}
    ></textarea>

    <div class="mt-4 flex-shrink-0">
        <FeedbackSection
            onCheck={handleCheck}
            {feedback}
            {loading}
            buttonColor={colors}
        />
    </div>
</div>
