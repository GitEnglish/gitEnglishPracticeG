<script lang="ts">
  import type { IListeningSpecificInfoExercise } from '../../lib/types';
  import FeedbackSection from './FeedbackSection.svelte';
  import SpeakerWaveIcon from '../icons/SpeakerWaveIcon.svelte';
  import { checkAnswerWithAI } from '../../services/aiService';

  let { exercise, colors } = $props<{
    exercise: IListeningSpecificInfoExercise;
    colors: any;
  }>();

  let answers = $state<Record<number, string>>({});
  let feedback = $state<string | null>(null);
  let loading = $state(false);

  const handleCheck = async () => {
      loading = true;
      const result = await checkAnswerWithAI('Listening for Specific Info', exercise, answers);
      feedback = result || null;
      loading = false;
  };
</script>

<div class="text-base font-casual {colors.textOnLight}">
    <h4 class="font-playful text-xl mb-2">{exercise.title}</h4>
    <div class="mb-6 p-4 rounded-2xl bg-slate-800 text-slate-200 shadow-lg relative overflow-hidden">
        <div class="absolute top-0 right-0 p-2 opacity-10"><SpeakerWaveIcon class="w-24 h-24" /></div>
        <p class="font-bold text-xs uppercase text-slate-400 mb-2">Transcript</p>
        <p class="italic text-lg font-playful leading-relaxed">"{exercise.audioText}"</p>
    </div>
    <div class="space-y-4">
        {#each exercise.questions as q, i}
            <div>
                <label class="block text-sm font-bold mb-2 text-slate-700">{q.question}</label>
                <input
                    type="text"
                    class="w-full p-2 rounded-xl border-2 {colors.chip.border} bg-white text-slate-900 focus:ring-2 focus:ring-slate-300 outline-none"
                    placeholder="Answer..."
                    value={answers[i] || ''}
                    oninput={(e) => {
                        answers[i] = e.currentTarget.value;
                        feedback = null;
                    }}
                />
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
