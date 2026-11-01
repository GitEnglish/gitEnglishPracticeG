<script lang="ts">
  import { ChevronDown, SlidersHorizontal } from 'lucide-svelte';
  import { type Difficulty, type Tone } from '../lib/types';
  import { DIFFICULTY_LEVELS, TONES, DIFFICULTY_LABELS } from '../lib/constants';
  import DifficultyIcon from './icons/DifficultyIcon.svelte';
  import ToneIcon from './icons/ToneIcon.svelte';
  import ThemeIcon from './icons/ThemeIcon.svelte';

  let {
    difficulty,
    setDifficulty,
    tone,
    setTone,
    theme,
    setTheme,
    totalTime,
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
    makerTemperature: number;
    setMakerTemperature: (t: number) => void;
    checkerTemperature: number;
    setCheckerTemperature: (t: number) => void;
  }>();

  let isSettingsOpen = $state(false);
  let isAISettingsOpen = $state(false);
</script>

<section class="rounded-xl border border-hairline/80 bg-chrome-raised/50 p-3" data-purpose="lesson-configuration">
        <button type="button" class="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-fossil-50 hover:text-accent" aria-expanded={isSettingsOpen} aria-controls="lesson-configuration-panel" onclick={() => isSettingsOpen = !isSettingsOpen}>
            <span class="flex items-center gap-2">
                <SlidersHorizontal class="h-4 w-4 text-accent" />
                Lesson Configuration
            </span>
            <ChevronDown class={`h-4 w-4 text-fossil-400 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
        </button>
        <div id="lesson-configuration-panel" class={isSettingsOpen ? 'pt-3' : 'hidden'}>
        <p class="mb-4 text-xs leading-relaxed text-fossil-400">Defaults for new exercises. You can still adjust an exercise individually.</p>

        <div class="space-y-4">
            <div class="space-y-2">
                <label for="global-difficulty" class="flex items-center text-xs font-semibold uppercase tracking-wide text-fossil-300">
                    <DifficultyIcon class="mr-2 h-4 w-4 text-accent" />
                    Default difficulty
                </label>
                <select
                    id="global-difficulty"
                    value={difficulty}
                    onchange={(e) => setDifficulty(e.currentTarget.value as Difficulty)}
                    class="w-full rounded-lg border border-hairline bg-chrome px-3 py-2 text-sm text-fossil-50 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/40"
                >
                    {#each DIFFICULTY_LEVELS as opt}
                        <option value={opt}>
                            {DIFFICULTY_LABELS[opt] || opt}
                        </option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                 <label for="global-tone" class="flex items-center text-xs font-semibold uppercase tracking-wide text-fossil-300">
                    <ToneIcon class="mr-2 h-4 w-4 text-accent" />
                    Tone &amp; style
                </label>
                <select
                    id="global-tone"
                    value={tone}
                    onchange={(e) => setTone(e.currentTarget.value as Tone)}
                    class="w-full rounded-lg border border-hairline bg-chrome px-3 py-2 text-sm text-fossil-50 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/40"
                >
                    {#each TONES as opt}
                        <option value={opt}>{opt}</option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                <label for="global-theme" class="flex items-center text-xs font-semibold uppercase tracking-wide text-fossil-300">
                    <ThemeIcon class="mr-2 h-4 w-4 text-malachite-400" />
                    Content theme
                </label>
                <input
                    id="global-theme"
                    type="text"
                    value={theme}
                    oninput={(e) => setTheme(e.currentTarget.value)}
                    placeholder="e.g. Travel, Business, Sci-Fi..."
                    class="w-full rounded-lg border border-hairline bg-chrome px-3 py-2 text-sm text-fossil-50 outline-none transition-all placeholder:text-fossil-500 focus:border-malachite-400 focus:ring-2 focus:ring-malachite-400/40"
                />
            </div>

            <div class="rounded-lg border border-hairline/70 bg-chrome/70">
                <button type="button" class="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold text-fossil-200 hover:text-fossil-50" aria-expanded={isAISettingsOpen} aria-controls="ai-variation-settings" onclick={() => isAISettingsOpen = !isAISettingsOpen}>
                    <span>AI variation (advanced)</span>
                    <ChevronDown class={`h-3.5 w-3.5 transition-transform ${isAISettingsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div id="ai-variation-settings" class={isAISettingsOpen ? 'space-y-4 border-t border-hairline/70 px-3 py-3' : 'hidden'}>
                    <p class="text-xs leading-relaxed text-fossil-400">Temperature changes how varied the AI responses are; it does not make them more accurate. Lower is more consistent, higher is more varied. Accuracy still depends on the model and prompt.</p>
                    <div class="space-y-4">
                        <div class="space-y-1.5">
                            <label for="maker-temp" class="flex items-center justify-between text-xs font-semibold text-fossil-300">
                                <span>Exercise generation</span>
                                <span class="font-mono text-fossil-400">{makerTemperature.toFixed(1)}</span>
                            </label>
                            <input
                                id="maker-temp"
                                type="range"
                                min="0" max="2" step="0.1"
                                value={makerTemperature}
                                oninput={(e) => setMakerTemperature(parseFloat(e.currentTarget.value))}
                                aria-describedby="temperature-help"
                                class="w-full accent-[var(--color-accent)]"
                            />
                        </div>
                        <div class="space-y-1.5">
                            <label for="checker-temp" class="flex items-center justify-between text-xs font-semibold text-fossil-300">
                                <span>Answer feedback</span>
                                <span class="font-mono text-fossil-400">{checkerTemperature.toFixed(1)}</span>
                            </label>
                            <input
                                id="checker-temp"
                                type="range"
                                min="0" max="2" step="0.1"
                                value={checkerTemperature}
                                oninput={(e) => setCheckerTemperature(parseFloat(e.currentTarget.value))}
                                aria-describedby="temperature-help"
                                class="w-full accent-[var(--color-accent)]"
                            />
                        </div>
                    </div>
                    <p id="temperature-help" class="sr-only">Lower values make AI responses more consistent; higher values allow more variation. Temperature does not guarantee accuracy.</p>
                </div>
            </div>

            <div class="flex items-center justify-between border-t border-hairline/70 pt-3">
                <span class="text-xs font-semibold uppercase tracking-wide text-fossil-400">Est. lesson time</span>
                <span class="rounded-md border border-malachite-500/30 bg-malachite-500/10 px-2.5 py-1 text-sm font-semibold text-malachite-300">~{totalTime} min</span>
            </div>
        </div>
        </div>
</section>
