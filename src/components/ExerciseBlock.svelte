<script lang="ts">
    import type { ExerciseBlockState } from '../lib/types';
  import { ExerciseType, Difficulty, Tone } from '../lib/types';
  import { EXERCISE_PEDAGOGY, PEDAGOGY_COLORS, calculateExerciseAmount, calculateExerciseDuration, SINGLE_INSTANCE_TYPES, DIFFICULTY_LEVELS, DIFFICULTY_LABELS, TONES } from '../lib/constants';
  import { useDebounce } from '../hooks/useDebounce';
  import { useResponsiveScale } from '../hooks/useResponsiveScale';
  import { useAttentionTracker } from '../hooks/useAttentionTracker';
  import { getActivityLogger } from '../services/ActivityLogger';
  import { generateExercise } from '../services/deepseekService';
  import type { Component } from 'svelte';

  import ExerciseTemplate from './ExerciseTemplate.svelte';

  // Icon Imports
  import { Trash2, Settings, X, ChevronLeft, ChevronRight, Wand2, RotateCcw } from 'lucide-svelte';
  import { motion } from '@humanspeak/svelte-motion';
  import Button from '../lib/components/Button.svelte';
  import Field from '../lib/components/Field.svelte';

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
    allBlocks = [],
    onSnapLines = (_lines: { axis: 'x' | 'y'; position: number; start: number; end: number }[]) => {},
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
    allBlocks?: { x: number; y: number; width: number; height: number; id: number }[];
    onSnapLines?: (lines: { axis: 'x' | 'y'; position: number; start: number; end: number }[]) => void;
  }>();

  let { id, x, y, width, height, zIndex, exerciseType, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, isGenerated, quantity } = $derived(blockState);

  let content = $state<any[]>([]);
  let isLoading = $state(false);
  let isSettingsOpen = $state(false);
  let currentSlide = $state(0);
  let generateAmount = $derived(quantity ?? calculateExerciseAmount(exerciseType, height));

  // Snap-to-align — ported from legacy Whiteboard. While the block is being
  // dragged, the nearest block edge within 10px (in world coordinates) pulls
  // the move to align, and the matched axis is rendered as a red guide line.
  const SNAP_THRESHOLD = 10;
  function computeSnap(deltaX: number, deltaY: number) {
    const wDelta = deltaX / scale;
    const hDelta = deltaY / scale;
    const nx = x + wDelta, ny = y + hDelta;
    let snappedX = nx, snappedY = ny;
    const lines: { axis: 'x' | 'y'; position: number; start: number; end: number }[] = [];
    const myV = [nx, nx + width / 2, nx + width];
    const myH = [ny, ny + height / 2, ny + height];
    let bestV: { d: number; vp: number; i: number } | null = null;
    for (const b of allBlocks) {
      if (b.id === id) continue;
      for (const vp of [b.x, b.x + b.width / 2, b.x + b.width]) {
        for (let i = 0; i < myV.length; i++) {
          const d = Math.abs(myV[i] - vp);
          if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) {
            bestV = { d, vp, i };
          }
        }
      }
    }
    if (bestV) {
      snappedX = bestV!.vp - (bestV!.i * (width / 2));
      lines.push({ axis: 'x', position: bestV!.vp, start: ny - 100, end: ny + height + 100 });
    }
    let bestH: { d: number; hp: number; i: number } | null = null;
    for (const b of allBlocks) {
      if (b.id === id) continue;
      for (const hp of [b.y, b.y + b.height / 2, b.y + b.height]) {
        for (let i = 0; i < myH.length; i++) {
          const d = Math.abs(myH[i] - hp);
          if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) {
            bestH = { d, hp, i };
          }
        }
      }
    }
    if (bestH) {
      snappedY = bestH!.hp - (bestH!.i * (height / 2));
      lines.push({ axis: 'y', position: bestH!.hp, start: snappedX - 100, end: snappedX + width + 100 });
    }
    return { snappedX, snappedY, lines };
  }

  const estimatedDuration = $derived(calculateExerciseDuration(exerciseType, height, quantity));

  const stop = (e: Event) => e.stopPropagation();
  const handleQuantityChange = (val: string) => {
      const n = parseInt(val);
      onUpdate(id, { quantity: isNaN(n) || n < 1 ? undefined : n });
  };
  const handleRegenerate = () => { if (!isLoading) handleGenerate(); };
  const handleEnterLive = (e: Event) => { stop(e); if (isGenerated) onEnterPresentation(); };
  const handleExitLive = (e: Event) => { stop(e); onExitPresentation(); };

  // Arrow-key slide nav in presentation mode — ported from legacy
  $effect(() => {
      if (!isPresenting) return;
      const onKey = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') onNextSlide();
          else if (e.key === 'ArrowLeft') onPrevSlide();
          else if (e.key === 'Escape') onExitPresentation();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
  });

  // If the block is marked as generated (e.g. from local storage reload) but content is empty,
  // revert it to un-generated so the user can see the generate button and prevent crashes.
  $effect(() => {
      if (isGenerated && (!content || content.length === 0)) {
          onUpdate(id, { isGenerated: false });
      }
  });


  // svelte-motion attaches setPointerCapture on the block at pointerdown, which
  // retargets pointerup/click to the block — child buttons (Generate, Settings,
  // Remove, slide nav) and inputs would never receive clicks. Stopping
  // propagation on interactive zones prevents the drag system from capturing.
  const stopPointer = (e: PointerEvent) => e.stopPropagation();

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

  // Snap-to-content: after generation the card resizes itself to exactly fit
  // its content, so it never scrolls. Ported from the pre-refactor block,
  // which did this with a ResizeObserver, a 5px jitter guard and a 350px
  // minimum width. Disabled while presenting or before generation.
  let headerEl = $state<HTMLElement | null>(null);
  let contentEl = $state<HTMLElement | null>(null);

  $effect(() => {
      if (!isGenerated || !contentEl || isPresenting || isResizing) return;
      const observer = new ResizeObserver(() => {
          const contentHeight = contentEl!.scrollHeight;
          const contentWidth = contentEl!.scrollWidth;
          const headerHeight = headerEl?.offsetHeight || 0;
          // body padding (p-5 top+bottom = 40) + card border
          const chromeV = 40 + 2;
          const chromeH = 40 + 2;
          const desiredHeight = Math.max(150, headerHeight + contentHeight + chromeV);
          const desiredWidth = Math.max(350, contentWidth + chromeH);
          if (Math.abs(desiredHeight - height) > 5 || Math.abs(desiredWidth - width) > 5) {
              onUpdate(id, { height: desiredHeight, width: desiredWidth });
          }
      });
      observer.observe(contentEl);
      return () => observer.disconnect();
  });

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
      e.preventDefault();
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
    dragSnapToOrigin={true}
    dragElastic={0.2}
    whileHover={{ scale: isPresenting ? 1 : 1.01 }}
    whileTap={{ scale: isPresenting ? 1 : 0.99 }}
    onDragStart={() => {
        if (!isPresenting && !isResizing) {
            onFocus(id);
            onSnapLines([]);
        }
    }}
    onDrag={(e: PointerEvent, info: any) => {
        if (isPresenting || isResizing) return;
        const { snappedX, snappedY, lines } = computeSnap(info.offset.x, info.offset.y);
        onSnapLines(lines);
        // soft-correct the visual transform during the drag
        const dx = (snappedX - x) * scale - info.offset.x;
        const dy = (snappedY - y) * scale - info.offset.y;
        if (dx || dy) info.offset.x += dx, info.offset.y += dy;
    }}
    onDragEnd={(e: PointerEvent, info: any) => {
        if (isPresenting || isResizing) return;
        const { snappedX, snappedY } = computeSnap(info.offset.x, info.offset.y);
        onSnapLines([]);
        onUpdate(id, { x: Math.round(snappedX), y: Math.round(snappedY) });
    }}
    onmousedown={() => onFocus(id)}
    class="bg-fossil-50 rounded-[22px] shadow-card border panel-outline-light overflow-hidden transition-shadow duration-200 hover:shadow-2xl flex flex-col will-change-transform {isResizing ? 'select-none' : ''} {isPresenting ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] scale-150 !rounded-none !border-0 w-screen h-screen' : 'absolute cursor-grab active:cursor-grabbing'}"
    style="left: {x}px; top: {y}px; width: {isPresenting ? '900px' : width + 'px'}; height: {isPresenting ? 'auto' : height + 'px'}; min-height: {isPresenting ? 'auto' : '150px'}; z-index: {isPresenting ? 9999 : zIndex};"
>
    <!-- Top Gradient Bar -->
    <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>

    <!-- Resize Handles -->
    {#if !isPresenting}
        <div class="absolute -top-1 left-2 right-2 h-3 cursor-ns-resize z-50 hover:bg-accent/25 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'n')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute -bottom-1 left-2 right-2 h-3 cursor-ns-resize z-50 hover:bg-accent/25 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 's')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute -left-1 top-2 bottom-2 w-3 cursor-ew-resize z-50 hover:bg-accent/25 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'w')} role="separator" aria-orientation="vertical" tabindex="-1"></div>
        <div class="absolute -right-1 top-2 bottom-2 w-3 cursor-ew-resize z-50 hover:bg-accent/25 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'e')} role="separator" aria-orientation="vertical" tabindex="-1"></div>

        <div class="absolute -top-1 -left-1 w-4 h-4 cursor-nwse-resize z-50 hover:bg-accent/30 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'nw')} role="separator" tabindex="-1"></div>
        <div class="absolute -top-1 -right-1 w-4 h-4 cursor-nesw-resize z-50 hover:bg-accent/30 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'ne')} role="separator" tabindex="-1"></div>
        <div class="absolute -bottom-1 -left-1 w-4 h-4 cursor-nesw-resize z-50 hover:bg-accent/30 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'sw')} role="separator" tabindex="-1"></div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize z-50 hover:bg-accent/30 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'se')} role="separator" tabindex="-1"></div>
    {/if}

    <!-- Header — ported from the pre-refactor block. The title column is
         min-w-0 flex-1 with truncate so it can never push into the controls,
         and every control stops the drag-capture workaround on pointerdown. -->
    <!-- svelte-ignore a11y_no_static_element_interactions
         stopPointer only stops svelte-motion from capturing the pointer so the
         buttons inside stay clickable. It adds no behaviour of its own, so a
         role here would misrepresent the element to assistive tech. -->
    <div bind:this={headerEl} class="px-6 py-3.5 flex items-center justify-between gap-3 border-b border-hairline bg-chrome text-ink-invert flex-shrink-0 relative z-10 font-ui" style="touch-action: none;" onpointerdown={stopPointer}>
        <div class="flex items-center gap-4 min-w-0 flex-1">
            {#if isPresenting}
                <Button variant="ghost" size="icon" onpointerdown={stop} onclick={handleExitLive} title="Exit Live Mode" class="text-fossil-400">
                    <X class="w-6 h-6" />
                </Button>
            {/if}
            <div class="flex items-center gap-3 min-w-0">
                <h3 class="font-semibold text-lg tracking-tight truncate select-none {isPresenting ? 'text-2xl' : ''}">{exerciseType}</h3>
                <span class="text-[10px] px-2 py-1 uppercase tracking-widest font-semibold bg-black/40 text-fossil-400 rounded-full border border-hairline select-none whitespace-nowrap hidden sm:inline">{pedagogy}</span>
                <span class="text-[10px] px-2 py-1 font-semibold bg-black/30 text-fossil-300 rounded-full border border-hairline select-none items-center gap-1 whitespace-nowrap hidden md:flex" title="Estimated completion time">
                    <span>⏱</span> ~{estimatedDuration}m
                </span>
            </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0 relative z-50">
            {#if isPresenting && content.length > 1}
                <div class="flex items-center gap-3 mr-2 border-r border-hairline pr-3">
                    <span class="text-sm font-mono font-medium text-fossil-400">{currentSlide + 1} / {content.length}</span>
                    <Button variant="subtle" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); currentSlide = Math.max(0, currentSlide - 1); }} disabled={currentSlide === 0} aria-label="Previous item">
                        <ChevronLeft class="w-5 h-5" />
                    </Button>
                    <Button variant="subtle" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); currentSlide = Math.min(content.length - 1, currentSlide + 1); }} disabled={currentSlide >= content.length - 1} aria-label="Next item">
                        <ChevronRight class="w-5 h-5" />
                    </Button>
                </div>
            {/if}

            {#if !isPresenting && !isGenerated && !isSingleInstance}
                <div class="flex items-center bg-black/40 rounded-lg px-2 py-1 border {quantity ? 'border-accent' : 'border-hairline'} transition-colors" onpointerdown={stopPointer}>
                    <span class="text-[10px] font-semibold uppercase mr-1.5 {quantity ? 'text-accent' : 'text-fossil-500'}">Qty</span>
                    <input
                        type="number" min="1" max="50"
                        value={generateAmount}
                        oninput={(e) => handleQuantityChange(e.currentTarget.value)}
                        onpointerdown={stop}
                        class="w-7 bg-transparent text-center text-xs font-semibold text-ink-invert outline-none appearance-none"
                        title="Manually set amount (overrides auto-size)"
                    />
                </div>
            {/if}

            {#if !isPresenting && isGenerated}
                <button
                    onpointerdown={stop} onclick={handleEnterLive}
                    class="px-3 py-1.5 rounded-full bg-cinnabar-600 text-fossil-50 font-semibold hover:bg-cinnabar-500 transition-all shadow-lift active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    title="Start Live Mode"
                >
                    <span class="w-2 h-2 rounded-full bg-fossil-50 animate-pulse"></span>
                    <span class="text-xs uppercase tracking-wider">Live</span>
                </button>
            {/if}

            {#if !isPresenting}
                {#if isGenerated}
                    <Button variant="ghost" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); handleRegenerate(); }} title="Regenerate" class="text-accent hover:bg-accent/15">
                        <RotateCcw class="w-4 h-4" />
                    </Button>
                {:else if !isLoading}
                    <Button variant="primary" size="sm" onpointerdown={stop} onclick={(e) => { stop(e); handleGenerate(); }} title="Generate" class="px-3 py-1.5">
                        <Wand2 class="h-3.5 w-3.5" />
                        <span>Generate</span>
                    </Button>
                {/if}
                <Button variant="ghost" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); isSettingsOpen = !isSettingsOpen; }} title="Settings" class={isSettingsOpen ? 'bg-fossil-50/15 text-ink-invert' : 'text-fossil-400'}>
                    <Settings class="w-4 h-4" />
                </Button>
                <Button variant="danger" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); onRemove(id); }} title="Remove" class="text-cinnabar-400">
                    <Trash2 class="w-4 h-4" />
                </Button>
            {/if}
        </div>
    </div>
    <div class="flex-grow flex flex-col bg-fossil-50 overflow-hidden relative w-full h-full" onpointerdown={stopPointer}>
        {#if isSettingsOpen && !isPresenting}
            <div class="p-3 border-b border-rule bg-surface grid grid-cols-2 gap-3 flex-shrink-0 relative z-10" onpointerdown={stopPointer}>
                <label class="sr-only" for="block-difficulty-{id}">Block difficulty</label>
                <select
                    id="block-difficulty-{id}"
                    value={difficulty}
                    onchange={(e) => handleUpdateSetting({difficulty: e.currentTarget.value as Difficulty})}
                    class="appearance-none text-xs font-medium text-ink-muted p-2 rounded-lg border border-fossil-300 bg-surface-raised w-full outline-none focus:ring-2 focus:ring-accent cursor-pointer select-chevron pr-7"
                >
                    {#each DIFFICULTY_LEVELS as d}
                        <option value={d}>{DIFFICULTY_LABELS[d]}</option>
                    {/each}
                </select>
                <label class="sr-only" for="block-tone-{id}">Block tone</label>
                <select
                    id="block-tone-{id}"
                    value={tone}
                    onchange={(e) => handleUpdateSetting({tone: e.currentTarget.value as Tone})}
                    class="appearance-none text-xs font-medium text-ink-muted p-2 rounded-lg border border-fossil-300 bg-surface-raised w-full outline-none focus:ring-2 focus:ring-accent cursor-pointer select-chevron pr-7"
                >
                    {#each TONES as tn}
                        <option value={tn}>{tn}</option>
                    {/each}
                </select>
                <label class="sr-only" for="block-theme-{id}">Block theme</label>
                <input
                    id="block-theme-{id}"
                    type="text"
                    class="col-span-2 text-xs font-medium text-ink-muted p-2 rounded-lg border border-fossil-300 bg-surface-raised w-full outline-none focus:ring-2 focus:ring-accent placeholder:text-ink-faint"
                    placeholder="Theme — e.g. Travel, Business"
                    value={theme}
                    oninput={(e) => handleUpdateSetting({theme: e.currentTarget.value})}
                />
            </div>
        {/if}

        {#if !isGenerated && !isLoading}

<div class="h-full flex flex-col p-7 bg-fossil-50 overflow-y-auto custom-scrollbar-light space-y-4">
    <div class="w-full flex-grow space-y-4 max-w-2xl mx-auto flex flex-col justify-start">
        {#each Array(generateAmount) as _, i}
            <ExerciseTemplate type={exerciseType} index={i} />
        {/each}
    </div>
</div>
        {:else if isLoading}
            <div class="h-full flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-8 h-8 border-4 border-fossil-200 border-t-accent rounded-full animate-spin"></div>
                    <span class="text-sm font-medium text-fossil-500 animate-pulse">Designing lesson...</span>
                </div>
            </div>
        {:else}
            <div class="content-wrapper flex flex-col" bind:this={contentEl}>
                {#if content.length > 1}
                    <div class="flex items-center justify-between mb-2 text-xs font-medium text-fossil-500 flex-shrink-0">
                        <button class="p-1 rounded hover:bg-fossil-100 disabled:opacity-30" onclick={() => currentSlide = Math.max(0, currentSlide - 1)} disabled={currentSlide === 0} aria-label="Previous item">
                            <ChevronLeft class="w-4 h-4" />
                        </button>
                        <span>{currentSlide + 1} / {content.length}</span>
                        <button class="p-1 rounded hover:bg-fossil-100 disabled:opacity-30" onclick={() => currentSlide = Math.min(content.length - 1, currentSlide + 1)} disabled={currentSlide >= content.length - 1} aria-label="Next item">
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                {/if}
                <div class="flex-grow overflow-y-auto p-5 custom-scrollbar-light h-full w-full">
                    {#if activeItem?.error}
                        <div class="p-4 bg-cinnabar-50 text-cinnabar-600 rounded-xl border border-cinnabar-200 text-sm">{activeItem.error}</div>
                    {:else if ActiveExercise}
                        <ActiveExercise exercise={mapItemForRenderer(activeItem)} {colors} />
                    {:else if activeItem}
                        <pre class="text-xs whitespace-pre-wrap text-fossil-600 bg-fossil-50 p-3 rounded">{JSON.stringify(activeItem, null, 2)}</pre>
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
