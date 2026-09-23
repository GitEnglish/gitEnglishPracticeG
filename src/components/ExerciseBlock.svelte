<script lang="ts">
    import type { ExerciseBlockState } from '../lib/types';
  import { ExerciseType, Difficulty, Tone } from '../lib/types';
  import { EXERCISE_PEDAGOGY, PEDAGOGY_COLORS, calculateExerciseAmount, SINGLE_INSTANCE_TYPES, DIFFICULTY_LEVELS, DIFFICULTY_LABELS, TONES } from '../lib/constants';
  import { useDebounce } from '../hooks/useDebounce';
  import { useResponsiveScale } from '../hooks/useResponsiveScale';
  import { useAttentionTracker } from '../hooks/useAttentionTracker';
  import { getActivityLogger } from '../services/ActivityLogger';
  import { generateExercise } from '../services/deepseekService';
  import type { Component } from 'svelte';

  import ExerciseTemplate from './ExerciseTemplate.svelte';

  // Icon Imports
  import { Trash2, Settings, Play, X, ChevronLeft, ChevronRight, Wand2 } from 'lucide-svelte';
  import { motion } from '@humanspeak/svelte-motion';

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

  let content = $state<any[]>([]);
  let isLoading = $state(false);
  let isSettingsOpen = $state(false);
  let currentSlide = $state(0);
  let generateAmount = $derived(quantity ?? calculateExerciseAmount(exerciseType, height));

  // If the block is marked as generated (e.g. from local storage reload) but content is empty,
  // revert it to un-generated so the user can see the generate button and prevent crashes.
  $effect(() => {
      if (isGenerated && (!content || content.length === 0)) {
          onUpdate(id, { isGenerated: false });
      }
  });


  // Real generation via OpenRouter (DeepSeek) — see services/deepseekService.ts
  // Real generation via OpenRouter (DeepSeek) — see services/deepseekService.ts
  const handleGenerate = async () => {
    isLoading = true;
    onFocus(id);
    currentSlide = 0;
    try {
        const amount = quantity ?? calculateExerciseAmount(exerciseType, height);
        const result = await generateExercise(exerciseType, difficulty, tone, theme, amount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate);
        if (Array.isArray(result)) {
            content = result;
            onUpdate(id, { isGenerated: true });
        } else {
            content = [result]; // { error } payload
        }
    } catch (e) {
        content = [{ error: 'Generation failed: ' + (e instanceof Error ? e.message : String(e)) }];
    } finally {
        isLoading = false;
    }
  };

  // Renderer map: every ExerciseType has an interactive component.
  // Components sniff their data shape (e.g. InteractiveMCQ handles all MCQ-like types).
  const EXERCISE_RENDERERS: Partial<Record<ExerciseType, Component<any>>> = {
    [ExerciseType.FITB]: InteractiveFITB,
    [ExerciseType.CollocationGapFill]: InteractiveFITB,
    [ExerciseType.PhrasalVerbGapFill]: InteractiveFITB,
    [ExerciseType.WordFormation]: InteractiveWordFormation,
    [ExerciseType.MultipleChoice]: InteractiveMCQ,
    [ExerciseType.CollocationOddOneOut]: InteractiveMCQ,
    [ExerciseType.Prediction]: InteractiveMCQ,
    [ExerciseType.RuleDiscovery]: InteractiveMCQ,
    [ExerciseType.SpotTheDifference]: InteractiveMCQ,
    [ExerciseType.PolitenessScenarios]: InteractiveMCQ,
    [ExerciseType.InferringMeaning]: InteractiveMCQ,
    [ExerciseType.ReadingGist]: InteractiveMCQ,
    [ExerciseType.SentenceScramble]: InteractiveSentenceScramble,
    [ExerciseType.ClozeParagraph]: InteractiveClozeOrDialogue,
    [ExerciseType.DialogueCompletion]: InteractiveClozeOrDialogue,
    [ExerciseType.Matching]: InteractiveMatching,
    [ExerciseType.FunctionMatching]: InteractiveMatching,
    [ExerciseType.ErrorCorrection]: InteractiveErrorCorrection,
    [ExerciseType.StorySequencing]: InteractiveStorySequencing,
    [ExerciseType.ReadingDetail]: InteractiveReadingDetail,
    [ExerciseType.PicturePrompt]: InteractivePicturePrompt,
    [ExerciseType.DictoGloss]: InteractiveDictoGloss,
    [ExerciseType.InformationTransfer]: InteractiveInformationTransfer,
    [ExerciseType.ListeningSpecificInfo]: InteractiveListening,
    [ExerciseType.RegisterSort]: InteractiveRegisterSort,
    [ExerciseType.FunctionalWriting]: InteractiveOpenResponseTask,
    [ExerciseType.MoralDilemma]: InteractiveOpenResponseTask,
    [ExerciseType.ProblemSolvingScenario]: InteractiveOpenResponseTask,
    [ExerciseType.RolePlayScenario]: InteractiveOpenResponseTask,
    [ExerciseType.StorytellingFromPrompts]: InteractiveOpenResponseTask,
    [ExerciseType.JustifyYourOpinion]: InteractiveOpenResponseTask,
    [ExerciseType.PictureComparison]: InteractiveOpenResponseTask,
  };

  let ActiveExercise = $derived(EXERCISE_RENDERERS[exerciseType as ExerciseType]);
  let activeItem = $derived(content[currentSlide] ?? content[0]);

  // Adapts a generated item to the shape its renderer expects.
  const mapItemForRenderer = (item: any): any => {
    if (!item || item.error) return item;
    if (exerciseType === ExerciseType.CollocationOddOneOut) {
      return { question: 'Which word does NOT collocate with "' + item.keyword + '"?', options: item.options, correctAnswer: item.correctAnswer };
    }
    return item;
  };

  const handleUpdateSetting = (updates: Partial<ExerciseBlockState>) => {
    onUpdate(id, updates);
  };

  let pedagogy = $derived((EXERCISE_PEDAGOGY as Record<string, string>)[exerciseType] || 'Default');
  let colors: any = $derived((PEDAGOGY_COLORS as Record<string, any>)[pedagogy] || (PEDAGOGY_COLORS as Record<string, any>)['Default']);
  let isSingleInstance = $derived(SINGLE_INSTANCE_TYPES.includes(exerciseType));


  let dragControls = $state(null);

  // Calculate scaled positions for framer motion if whiteboard is zoomed
  let scaledX = $derived(x * scale);
  let scaledY = $derived(y * scale);

  // Resize State
  let isResizing = $state(false);
  let resizeDirection = $state<string | null>(null);
  let startWidth = $state(0);
  let startHeight = $state(0);
  let startX = $state(0);
  let startY = $state(0);
  let startMouseX = $state(0);
  let startMouseY = $state(0);

  const startResize = (e: MouseEvent, direction: string) => {
      e.stopPropagation();
      onFocus(id);
      isResizing = true;
      resizeDirection = direction;
      startWidth = width;
      startHeight = height;
      startX = x;
      startY = y;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', stopResize);
  };

  const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !resizeDirection) return;
      e.preventDefault();

      const dx = (e.clientX - startMouseX) / scale;
      const dy = (e.clientY - startMouseY) / scale;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX;
      let newY = startY;

      if (resizeDirection.includes('e')) newWidth = Math.max(350, startWidth + dx);
      if (resizeDirection.includes('s')) newHeight = Math.max(150, startHeight + dy);
      if (resizeDirection.includes('w')) {
          newWidth = Math.max(350, startWidth - dx);
          // Only adjust X by the amount the width actually changed
          newX = startX + (startWidth - newWidth);
      }
      if (resizeDirection.includes('n')) {
          newHeight = Math.max(150, startHeight - dy);
          // Only adjust Y by the amount the height actually changed
          newY = startY + (startHeight - newHeight);
      }

      onUpdate(id, { width: newWidth, height: newHeight, x: newX, y: newY });
  };

  const stopResize = () => {
      isResizing = false;
      resizeDirection = null;
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', stopResize);
  };

</script>

<!-- Simplified ExerciseBlock implementation for step 6, focusing on Svelte Motion mechanics -->
<!-- Simplified ExerciseBlock implementation -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<motion.div
    role="region"
    aria-roledescription="exercise block"
    drag={!isPresenting && !isResizing}
    dragMomentum={false}
    dragElastic={0.2}
    whileHover={{ scale: isPresenting ? 1 : 1.01 }}
    whileTap={{ scale: isPresenting ? 1 : 0.99 }}
    onDragStart={() => {
        if (!isPresenting && !isResizing) {
            onFocus(id);
        }
    }}
    onDragEnd={(e: PointerEvent, info: any) => {
        if (!isPresenting && !isResizing) {
            // Apply the drag offset, scaled to the whiteboard's zoom level
            const newX = x + (info.offset.x / scale);
            const newY = y + (info.offset.y / scale);
            onUpdate(id, { x: Math.round(newX), y: Math.round(newY) });
        }
    }}
    onmousedown={() => onFocus(id)}
    class="bg-white rounded-[22px] shadow-card-academic border academic-card-border overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col will-change-transform {isPresenting ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] scale-150 !rounded-none !border-0 w-screen h-screen' : 'absolute cursor-grab active:cursor-grabbing'}"
    style="left: {x}px; top: {y}px; width: {isPresenting ? '900px' : width + 'px'}; height: {isPresenting ? 'auto' : height + 'px'}; min-height: {isPresenting ? 'auto' : '150px'}; z-index: {isPresenting ? 9999 : zIndex};"
>
    <!-- Top Gradient Bar -->
    <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E59500] to-transparent"></div>

    <!-- Resize Handles -->
    {#if !isPresenting}
        <div class="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'n')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 's')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'w')} role="separator" aria-orientation="vertical" tabindex="-1"></div>
        <div class="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'e')} role="separator" aria-orientation="vertical" tabindex="-1"></div>

        <div class="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'nw')} role="separator" tabindex="-1"></div>
        <div class="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'ne')} role="separator" tabindex="-1"></div>
        <div class="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'sw')} role="separator" tabindex="-1"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'se')} role="separator" tabindex="-1"></div>
    {/if}

    <!-- Header -->
    <div class="px-7 py-5 flex items-center justify-between border-b border-slate-200 bg-[#F7FAFC]/60" style="touch-action: none;">
        <div class="flex items-center min-w-[140px] pointer-events-none">
            <h2 class="text-base font-bold tracking-tight text-[#0D1322] flex items-center gap-2">
                {exerciseType}
                {#if isLoading}
                    <span class="animate-spin text-xs">...</span>
                {/if}
            </h2>
        </div>

        <div class="flex-1 flex justify-center">
            {#if !isGenerated && !isLoading}
                <button onclick={handleGenerate} class="inline-flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#E59500] to-[#D97706] hover:from-[#F59E0B] hover:to-[#E59500] text-[#0D1322] font-bold text-xs tracking-tight shadow-jewel-gold hover:shadow-glow-gold transition-all active:scale-[0.98]" title="Generate">
                    <svg class="w-3.5 h-3.5 text-[#0D1322]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"></path></svg>
                    <span>Generate ({generateAmount})</span>
                </button>
            {/if}
        </div>

        <div class="flex items-center space-x-3 min-w-[140px] justify-end relative z-50">
            <button onclick={() => isSettingsOpen = !isSettingsOpen} class="p-1.5 text-slate-400 hover:text-[#0D1322] hover:bg-slate-100 rounded-lg transition-colors" title="Settings">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"></path></svg>
            </button>
            <button onclick={() => onRemove(id)} class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Remove">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"></path></svg>
            </button>
        </div>
    </div>

    <!-- Body -->
    <div class="flex-grow flex flex-col bg-white overflow-hidden relative w-full h-full">
        {#if isSettingsOpen}
            <div class="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-5 overflow-y-auto font-casual">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Settings class="w-5 h-5 text-slate-500" />
                        Configuration
                    </h3>
                    <button onclick={() => isSettingsOpen = false} class="p-1 rounded hover:bg-slate-100 text-slate-500"><X class="w-5 h-5" /></button>
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

<div class="h-full flex flex-col p-7 bg-white overflow-y-auto custom-scrollbar-light space-y-4">
    <div class="w-full flex-grow space-y-4 max-w-2xl mx-auto flex flex-col justify-start">
        {#each Array(generateAmount) as _, i}
            <ExerciseTemplate type={exerciseType} index={i} />
        {/each}
    </div>
</div>
        {:else if isLoading}
            <div class="h-full flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <span class="text-sm font-bold text-slate-500 animate-pulse">Designing lesson...</span>
                </div>
            </div>
        {:else}
            <div class="content-wrapper h-full flex flex-col">
                {#if content.length > 1}
                    <div class="flex items-center justify-between mb-2 text-xs font-bold text-slate-500 flex-shrink-0">
                        <button class="p-1 rounded hover:bg-slate-100 disabled:opacity-30" onclick={() => currentSlide = Math.max(0, currentSlide - 1)} disabled={currentSlide === 0} aria-label="Previous item">
                            <ChevronLeft class="w-4 h-4" />
                        </button>
                        <span>{currentSlide + 1} / {content.length}</span>
                        <button class="p-1 rounded hover:bg-slate-100 disabled:opacity-30" onclick={() => currentSlide = Math.min(content.length - 1, currentSlide + 1)} disabled={currentSlide >= content.length - 1} aria-label="Next item">
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                {/if}
                <div class="flex-grow overflow-y-auto p-5 custom-scrollbar-light h-full w-full">
                    {#if activeItem?.error}
                        <div class="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{activeItem.error}</div>
                    {:else if ActiveExercise}
                        <ActiveExercise exercise={mapItemForRenderer(activeItem)} {colors} />
                    {:else if activeItem}
                        <pre class="text-xs whitespace-pre-wrap text-slate-600 bg-slate-50 p-3 rounded">{JSON.stringify(activeItem, null, 2)}</pre>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</motion.div>


<style>
    /* Prevent text selection while dragging */
    :global(body.dragging) {
        user-select: none;
    }
</style>
