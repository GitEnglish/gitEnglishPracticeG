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
    onClose,
    makerTemperature,
    setMakerTemperature,
    checkerTemperature,
    setCheckerTemperature
  } = $props<{
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    tone: Tone;
    setTone: (t: Tone) => void;
    theme: string;
    setTheme: (t: string) => void;
    totalTime: number;
    onClose: () => void;
    makerTemperature: number;
    setMakerTemperature: (t: number) => void;
    checkerTemperature: number;
    setCheckerTemperature: (t: number) => void;
  }>();
</script>

<div class="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
    <button
        class="absolute inset-0 bg-fossil-900/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200 border-none cursor-default"
        onclick={onClose}
        aria-label="Close settings">
    </button>

    <div class="bg-surface rounded-2xl shadow-2xl border border-rule p-6 w-full max-w-md pointer-events-auto transform transition-all animate-in fade-in zoom-in-95 duration-200 relative">
        <button onclick={onClose} class="absolute top-4 right-4 text-fossil-400 hover:text-fossil-600 transition-colors" aria-label="Close settings">
            <XMarkIcon class="w-5 h-5" />
        </button>

        <h2 class="text-2xl font-bold text-fossil-800 mb-1 flex items-center gap-3 font-playful">
            <SettingsIcon class="w-6 h-6 text-accent" />
            Lesson Configuration
        </h2>
        <p class="text-sm text-fossil-600 mb-6 font-casual">Set the default parameters for new exercises.</p>

        <div class="space-y-5">
            <div class="space-y-2">
                <label for="global-difficulty" class="flex items-center text-sm font-bold text-fossil-700 uppercase tracking-wide font-casual">
                    <DifficultyIcon class="w-4 h-4 mr-2 text-accent" />
                    Difficulty Level
                </label>
                <select
                    id="global-difficulty"
                    value={difficulty}
                    onchange={(e) => setDifficulty(e.currentTarget.value as Difficulty)}
                    class="w-full bg-fossil-50 text-fossil-900 font-medium border border-fossil-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all appearance-none font-casual"
                >
                    {#each DIFFICULTY_LEVELS as opt}
                        <option value={opt}>
                            {DIFFICULTY_LABELS[opt] || opt}
                        </option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                 <label for="global-tone" class="flex items-center text-sm font-bold text-fossil-700 uppercase tracking-wide font-casual">
                    <ToneIcon class="w-4 h-4 mr-2 text-accent" />
                    Tone & Style
                </label>
                <select
                    id="global-tone"
                    value={tone}
                    onchange={(e) => setTone(e.currentTarget.value as Tone)}
                    class="w-full bg-fossil-50 text-fossil-900 font-medium border border-fossil-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all appearance-none font-casual"
                >
                    {#each TONES as opt}
                        <option value={opt}>{opt}</option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                <label for="global-theme" class="flex items-center text-sm font-bold text-fossil-700 uppercase tracking-wide font-casual">
                    <ThemeIcon class="w-4 h-4 mr-2 text-malachite-500" />
                    Content Theme
                </label>
                <input
                    id="global-theme"
                    type="text"
                    value={theme}
                    oninput={(e) => setTheme(e.currentTarget.value)}
                    placeholder="e.g. Travel, Business, Sci-Fi..."
                    class="w-full bg-fossil-50 text-fossil-900 font-medium border border-fossil-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-malachite-500 focus:border-malachite-500 outline-none transition-all placeholder-fossil-500 font-casual"
                />
            </div>

            <!-- AI keys are backend-only (.env / Railway). No client-side key entry UI. -->

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label for="maker-temp" class="flex items-center justify-between text-xs font-bold text-fossil-700 uppercase tracking-wide font-casual">
                        <span>Maker Temp</span>
                        <span class="text-fossil-500">{makerTemperature}</span>
                    </label>
                    <input
                        id="maker-temp"
                        type="range"
                        min="0" max="2" step="0.1"
                        value={makerTemperature}
                        oninput={(e) => setMakerTemperature(parseFloat(e.currentTarget.value))}
                        class="w-full"
                    />
                </div>
                <div class="space-y-2">
                    <label for="checker-temp" class="flex items-center justify-between text-xs font-bold text-fossil-700 uppercase tracking-wide font-casual">
                        <span>Checker Temp</span>
                        <span class="text-fossil-500">{checkerTemperature}</span>
                    </label>
                    <input
                        id="checker-temp"
                        type="range"
                        min="0" max="2" step="0.1"
                        value={checkerTemperature}
                        oninput={(e) => setCheckerTemperature(parseFloat(e.currentTarget.value))}
                        class="w-full"
                    />
                </div>
            </div>



            <div class="pt-4 border-t border-fossil-100 flex justify-between items-center font-casual">
                <span class="text-xs font-bold text-fossil-500 uppercase tracking-wider">Est. Lesson Time</span>
                <span class="text-lg font-black text-malachite-600 bg-malachite-50 px-3 py-1 rounded-lg border border-malachite-100">~{totalTime} min</span>
            </div>
        </div>
    </div>
</div>
