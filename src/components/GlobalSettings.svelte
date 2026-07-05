<script lang="ts">
  import { type Difficulty, type Tone } from '../lib/types';
  import { DIFFICULTY_LEVELS, TONES, DIFFICULTY_LABELS } from '../lib/constants';
  import DifficultyIcon from './icons/DifficultyIcon.svelte';
  import ToneIcon from './icons/ToneIcon.svelte';
  import ThemeIcon from './icons/ThemeIcon.svelte';
  import XMarkIcon from './icons/XMarkIcon.svelte';
  import SettingsIcon from './icons/SettingsIcon.svelte';

  let {
    difficulty,
    setDifficulty,
    tone,
    setTone,
    theme,
    setTheme,
    totalTime,
    onClose
  } = $props<{
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    tone: Tone;
    setTone: (t: Tone) => void;
    theme: string;
    setTheme: (t: string) => void;
    totalTime: number;
    onClose: () => void;
  }>();
</script>

<div class="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
    <button
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200 border-none cursor-default"
        onclick={onClose}
        aria-label="Close settings">
    </button>

    <div class="bg-[#fffbf0] rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md pointer-events-auto transform transition-all animate-in fade-in zoom-in-95 duration-200 relative">
        <button onclick={onClose} class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close settings">
            <XMarkIcon class="w-5 h-5" />
        </button>

        <h2 class="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-3 font-playful">
            <SettingsIcon class="w-6 h-6 text-blue-600" />
            Lesson Configuration
        </h2>
        <p class="text-sm text-slate-600 mb-6 font-casual">Set the default parameters for new exercises.</p>

        <div class="space-y-5">
            <div class="space-y-2">
                <label for="global-difficulty" class="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide font-casual">
                    <DifficultyIcon class="w-4 h-4 mr-2 text-blue-500" />
                    Difficulty Level
                </label>
                <select
                    id="global-difficulty"
                    value={difficulty}
                    onchange={(e) => setDifficulty(e.currentTarget.value as Difficulty)}
                    class="w-full bg-slate-50 text-slate-900 font-medium border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none font-casual"
                >
                    {#each DIFFICULTY_LEVELS as opt}
                        <option value={opt}>
                            {DIFFICULTY_LABELS[opt] || opt}
                        </option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                 <label for="global-tone" class="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide font-casual">
                    <ToneIcon class="w-4 h-4 mr-2 text-purple-500" />
                    Tone & Style
                </label>
                <select
                    id="global-tone"
                    value={tone}
                    onchange={(e) => setTone(e.currentTarget.value as Tone)}
                    class="w-full bg-slate-50 text-slate-900 font-medium border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all appearance-none font-casual"
                >
                    {#each TONES as opt}
                        <option value={opt}>{opt}</option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                <label for="global-theme" class="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide font-casual">
                    <ThemeIcon class="w-4 h-4 mr-2 text-green-500" />
                    Content Theme
                </label>
                <input
                    id="global-theme"
                    type="text"
                    value={theme}
                    oninput={(e) => setTheme(e.currentTarget.value)}
                    placeholder="e.g. Travel, Business, Sci-Fi..."
                    class="w-full bg-slate-50 text-slate-900 font-medium border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-slate-500 font-casual"
                />
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-between items-center font-casual">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Lesson Time</span>
                <span class="text-lg font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">~{totalTime} min</span>
            </div>
        </div>
    </div>
</div>
