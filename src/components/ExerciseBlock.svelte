<script lang="ts">
    import type { ExerciseBlockState } from '../lib/types';
  import { ExerciseType, Difficulty, Tone } from '../lib/types';
  import { EXERCISE_PEDAGOGY, PEDAGOGY_COLORS, calculateExerciseAmount, SINGLE_INSTANCE_TYPES, DIFFICULTY_LEVELS, DIFFICULTY_LABELS, TONES } from '../lib/constants';
  import { useDebounce } from '../hooks/useDebounce';
  import { useResponsiveScale } from '../hooks/useResponsiveScale';
  import { useAttentionTracker } from '../hooks/useAttentionTracker';
  import { getActivityLogger } from '../services/ActivityLogger';
  import { checkAnswerWithAI } from '../services/aiService'; // Reusing aiService to mock generation temporarily

  import ExerciseTemplate from './ExerciseTemplate.svelte';

  // Icon Imports
  import TrashIcon from './icons/TrashIcon.svelte';
  import SettingsIcon from './icons/SettingsIcon.svelte';
  import PlayIcon from './icons/PlayIcon.svelte';
  import XMarkIcon from './icons/XMarkIcon.svelte';
  import ChevronLeftIcon from './icons/ChevronLeftIcon.svelte';
  import ChevronRightIcon from './icons/ChevronRightIcon.svelte';
  import MagicWandIcon from './icons/MagicWandIcon.svelte';
  import DifficultyIcon from './icons/DifficultyIcon.svelte';
  import ToneIcon from './icons/ToneIcon.svelte';
  import ThemeIcon from './icons/ThemeIcon.svelte';
  import VocabularyIcon from './icons/VocabularyIcon.svelte';
  import GrammarIcon from './icons/GrammarIcon.svelte';

  // Exercise Components (Dynamically Rendered)
  import InteractiveFITB from './exercises/InteractiveFITB.svelte';
  import InteractiveWordFormation from './exercises/InteractiveWordFormation.svelte';
  import InteractiveMCQ from './exercises/InteractiveMCQ.svelte';
  import InteractiveSentenceScramble from './exercises/InteractiveSentenceScramble.svelte';
  import InteractiveClozeOrDialogue from './exercises/InteractiveClozeOrDialogue.svelte';
  import InteractiveMatching from './exercises/InteractiveMatching.svelte';
  import InteractiveErrorCorrection from './exercises/InteractiveErrorCorrection.svelte';
  import InteractiveStorySequencing from './exercises/InteractiveStorySequencing.svelte';
  import InteractiveReadingDetail from './exercises/InteractiveReadingDetail.svelte';
  import InteractivePicturePrompt from './exercises/InteractivePicturePrompt.svelte';
  import InteractiveOpenResponseTask from './exercises/InteractiveOpenResponseTask.svelte';
  import InteractiveDictoGloss from './exercises/InteractiveDictoGloss.svelte';
  import InteractiveInformationTransfer from './exercises/InteractiveInformationTransfer.svelte';
  import InteractiveListening from './exercises/InteractiveListening.svelte';
  import InteractiveRegisterSort from './exercises/InteractiveRegisterSort.svelte';

  let {
    blockState,
    onUpdate,
    onRemove,
    onFocus,
    bounds = "parent",
    isPresenting = false,
    onEnterPresentation,
    onExitPresentation,
    onNextSlide,
    onPrevSlide,
    scale = 1
  } = $props<{
    blockState: ExerciseBlockState;
    onUpdate: (id: number, updates: Partial<ExerciseBlockState>) => void;
    onRemove: (id: number) => void;
    onFocus: (id: number) => void;
    bounds?: string;
    isPresenting?: boolean;
    onEnterPresentation: () => void;
    onExitPresentation: () => void;
    onNextSlide: () => void;
    onPrevSlide: () => void;
    scale?: number;
  }>();

  let { id, x, y, width, height, zIndex, exerciseType, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, isGenerated, quantity } = $derived(blockState);

  let content = $state<any[] | { error: string }>([]);
  let isLoading = $state(false);
  let isSettingsOpen = $state(false);
  let currentSlide = $state(0);

  // Stub generation to use mock data for now
  const handleGenerate = async () => {
    isLoading = true;
    onFocus(id);
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Provide some dummy content for visual testing based on type
    if (exerciseType === ExerciseType.FITB) {
        content = [{ question: "The cat sat on the [BLANK].", answer: "mat", wordBank: ["mat", "dog", "car"] }];
    } else {
        content = [{ error: "Mock generated content for " + exerciseType }];
    }

    onUpdate(id, { isGenerated: true });
    isLoading = false;
  };

  const handleUpdateSetting = (updates: Partial<ExerciseBlockState>) => {
    onUpdate(id, updates);
  };

  let pedagogy = $derived((EXERCISE_PEDAGOGY as Record<string, string>)[exerciseType] || 'Default');
  let colors: any = $derived((PEDAGOGY_COLORS as Record<string, any>)[pedagogy] || (PEDAGOGY_COLORS as Record<string, any>)['Default']);
  let isSingleInstance = $derived(SINGLE_INSTANCE_TYPES.includes(exerciseType));

  const renderExercise = (item: any, idx: number) => {
      // In a real port, we'd map types. Here we map a few to show it works
      if (item.error) return `<div class="p-4 text-red-500">${item.error}</div>`;
      if (exerciseType === ExerciseType.FITB) {
          return `<InteractiveFITB exercise={item} colors={colors} />`;
      }
      return `<div class="p-4 bg-slate-100 rounded">Generic Content Render</div>`;
  };

  let dragControls = $state(null);

  // Calculate scaled positions for framer motion if whiteboard is zoomed
  let scaledX = $derived(x * scale);
  let scaledY = $derived(y * scale);
</script>

<!-- Simplified ExerciseBlock implementation for step 6, focusing on Svelte Motion mechanics -->
<!-- Simplified ExerciseBlock implementation -->
<div
    draggable={!isPresenting}
    ondragstart={(e) => {
        if (!isPresenting) {
            onFocus(id);
            // We'll calculate a basic drag offset
            if (e.dataTransfer) {
                e.dataTransfer.setData('block-id', String(id));
                // Set offset
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                e.dataTransfer.setData('offset-x', String((e.clientX - rect.left) / scale));
                e.dataTransfer.setData('offset-y', String((e.clientY - rect.top) / scale));
            }
        }
    }}
    onmousedown={() => onFocus(id)}
    class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col will-change-transform transition-transform {isPresenting ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] scale-150 shadow-2xl' : 'absolute cursor-grab active:cursor-grabbing'}"
    style="left: {x}px; top: {y}px; width: {isPresenting ? '900px' : width + 'px'}; min-height: {isPresenting ? 'auto' : height + 'px'}; z-index: {isPresenting ? 9999 : zIndex};"
>
    <!-- Header -->
    <div class="px-4 py-3 {colors.bg} {colors.border} border-b flex justify-between items-center" style="touch-action: none;">
        <div class="flex flex-col pointer-events-none">
            <span class="text-sm font-bold {colors.text} font-playful flex items-center gap-2">
                {exerciseType}
                {#if isLoading}
                    <span class="animate-spin text-xs">...</span>
                {/if}
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-70 {colors.text}">{pedagogy}</span>
        </div>

        <div class="flex items-center gap-1">
            {#if !isGenerated && !isLoading}
                <button onclick={handleGenerate} class="p-1.5 rounded-lg {colors.buttonBg} text-white hover:brightness-110 active:scale-95 transition-all shadow-sm" title="Generate">
                    <MagicWandIcon class="w-4 h-4" />
                </button>
            {/if}
            <button onclick={() => isSettingsOpen = !isSettingsOpen} class="p-1.5 rounded-lg hover:bg-black/5 {colors.text} transition-colors" title="Settings">
                <SettingsIcon class="w-4 h-4" />
            </button>
            <button onclick={() => onRemove(id)} class="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Remove">
                <TrashIcon class="w-4 h-4" />
            </button>
        </div>
    </div>

    <!-- Body -->
    <div class="flex-grow p-5 bg-white overflow-hidden relative">
        {#if isSettingsOpen}
            <div class="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-5 overflow-y-auto font-casual">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <SettingsIcon class="w-5 h-5 text-slate-500" />
                        Configuration
                    </h3>
                    <button onclick={() => isSettingsOpen = false} class="p-1 rounded hover:bg-slate-100 text-slate-500"><XMarkIcon class="w-5 h-5" /></button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Theme</label>
                        <input type="text" value={theme} oninput={(e) => handleUpdateSetting({theme: e.currentTarget.value})} class="w-full p-2 border border-slate-300 rounded focus:ring focus:ring-blue-200 outline-none" />
                    </div>
                </div>
            </div>
        {/if}

        {#if !isGenerated && !isLoading}
            <div class="h-full flex flex-col justify-center items-center text-center p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                 <p class="text-sm text-slate-500 mb-6 max-w-sm">
                    This <strong class="text-slate-700">{exerciseType}</strong> block is ready to generate. Configure settings using the gear icon, then click Generate.
                </p>
                <ExerciseTemplate type={exerciseType} index={1} />
                <button onclick={handleGenerate} class="mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 active:scale-95">
                    <MagicWandIcon class="w-5 h-5" />
                    Generate Exercise
                </button>
            </div>
        {:else if isLoading}
            <div class="h-full flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <span class="text-sm font-bold text-slate-500 animate-pulse">Designing lesson...</span>
                </div>
            </div>
        {:else}
            <div class="content-wrapper">
                {#if exerciseType === ExerciseType.FITB && Array.isArray(content) && (content as any)[0] && !(content as any)[0].error}
                     <InteractiveFITB exercise={(content as any)[0]} {colors} />
                {:else}
                     <div class="p-4 bg-slate-100 text-slate-600 rounded">
                        {(content as any)[0]?.error || "Content generated successfully. Full render implementation pending."}
                     </div>
                {/if}
            </div>
        {/if}
    </div>
</div>


<style>
    /* Prevent text selection while dragging */
    :global(body.dragging) {
        user-select: none;
    }
</style>
