<script lang="ts">
    import type { ExerciseBlockState } from '../lib/types';
  import { ExerciseType, Difficulty, Tone } from '../lib/types';
  import { EXERCISE_PEDAGOGY, PEDAGOGY_COLORS, calculateExerciseAmount, calculateExerciseDuration, SINGLE_INSTANCE_TYPES, DIFFICULTY_LEVELS, DIFFICULTY_LABELS, TONES } from '../lib/constants';
  import { getActivityLogger } from '../services/ActivityLogger';
  import { generateExercise } from '../services/aiService';
  import type { Component } from 'svelte';

  import ExerciseTemplate from './ExerciseTemplate.svelte';

  // Icon Imports
  import { Trash2, Settings, Wand2, RotateCcw } from 'lucide-svelte';
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
    scale = 1
  } = $props<{
    blockState: ExerciseBlockState;
    onUpdate: (id: number, updates: Partial<ExerciseBlockState>) => void;
    onRemove: (id: number) => void;
    onFocus: (id: number) => void;
    bounds?: string;
    scale?: number;
    allBlocks?: { x: number; y: number; width: number; height: number; id: number }[];
    onSnapLines?: (lines: { axis: 'x' | 'y'; position: number; start: number; end: number }[]) => void;
  }>();

  let { id, x, y, width, height, zIndex, exerciseType, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, isGenerated, quantity } = $derived(blockState);

  let content = $derived<any[]>(blockState.content ?? []);
  let isLoading = $state(false);
  let isSettingsOpen = $state(false);
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

    const myV0 = nx, myV1 = nx + width / 2, myV2 = nx + width;
    const myH0 = ny, myH1 = ny + height / 2, myH2 = ny + height;

    let bestV: { d: number; vp: number; i: number } | null = null;
    let bestH: { d: number; hp: number; i: number } | null = null;

    let d: number;

    for (let i = 0; i < allBlocks.length; i++) {
      const b = allBlocks[i];
      if (b.id === id) continue;

      const vps0 = b.x, vps1 = b.x + b.width / 2, vps2 = b.x + b.width;
      const hps0 = b.y, hps1 = b.y + b.height / 2, hps2 = b.y + b.height;

      // Vertical Checks
      d = Math.abs(myV0 - vps0); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps0, i: 0 };
      d = Math.abs(myV1 - vps0); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps0, i: 1 };
      d = Math.abs(myV2 - vps0); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps0, i: 2 };

      d = Math.abs(myV0 - vps1); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps1, i: 0 };
      d = Math.abs(myV1 - vps1); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps1, i: 1 };
      d = Math.abs(myV2 - vps1); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps1, i: 2 };

      d = Math.abs(myV0 - vps2); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps2, i: 0 };
      d = Math.abs(myV1 - vps2); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps2, i: 1 };
      d = Math.abs(myV2 - vps2); if (d < SNAP_THRESHOLD && (!bestV || d < bestV.d)) bestV = { d, vp: vps2, i: 2 };

      // Horizontal Checks
      d = Math.abs(myH0 - hps0); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps0, i: 0 };
      d = Math.abs(myH1 - hps0); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps0, i: 1 };
      d = Math.abs(myH2 - hps0); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps0, i: 2 };

      d = Math.abs(myH0 - hps1); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps1, i: 0 };
      d = Math.abs(myH1 - hps1); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps1, i: 1 };
      d = Math.abs(myH2 - hps1); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps1, i: 2 };

      d = Math.abs(myH0 - hps2); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps2, i: 0 };
      d = Math.abs(myH1 - hps2); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps2, i: 1 };
      d = Math.abs(myH2 - hps2); if (d < SNAP_THRESHOLD && (!bestH || d < bestH.d)) bestH = { d, hp: hps2, i: 2 };
    }

    if (bestV) {
      snappedX = bestV!.vp - (bestV!.i * (width / 2));
      lines.push({ axis: 'x', position: bestV!.vp, start: ny - 100, end: ny + height + 100 });
    }

    if (bestH) {
      snappedY = bestH!.hp - (bestH!.i * (height / 2));
      lines.push({ axis: 'y', position: bestH!.hp, start: snappedX - 100, end: snappedX + width + 100 });
    }
    return { snappedX, snappedY, lines };
  }

  const estimatedDuration = $derived(calculateExerciseDuration(exerciseType, height, quantity));

  const stop = (e: Event) => e.stopPropagation();
  // Deletion should read as the card leaving, not as a frame being dropped.
  // Fade and shrink over a short beat, then remove. `scale` is Tailwind's
  // standalone property here, so it never collides with the drag transform.
  let isRemoving = $state(false);
  const handleRemove = () => {
      if (isRemoving) return;
      isRemoving = true;
      if (content && content.length > 0 && typeof window !== 'undefined' && window.parent && window.parent !== window) {
          try {
              window.parent.postMessage({
                  type: 'EXERCISE_RECORD',
                  exercise: {
                      id: String(id),
                      type: exerciseType,
                      theme: theme || 'General Practice',
                      difficulty: difficulty || 'B1',
                      questions: content,
                      completedAt: Date.now()
                  }
              }, '*');
          } catch (e) {
              console.warn('[ExerciseBlock] Failed to emit EXERCISE_RECORD:', e);
          }
      }
      setTimeout(() => onRemove(id), 170);
  };
  const handleRegenerate = () => { if (!isLoading) handleGenerate(); };

  // If the block is marked as generated (e.g. from local storage reload) but content is empty,
  // revert it to un-generated so the user can see the generate button and prevent crashes.
  $effect(() => {
      if (isGenerated && (!content || content.length === 0)) {
          onUpdate(id, { isGenerated: false });
      }
  });

  const stopPointer = (e: PointerEvent) => e.stopPropagation();

  // Exercise generation via server-side OpenRouter proxy
  const handleGenerate = async () => {
    isLoading = true;
    onFocus(id);
    try {
        const amount = quantity ?? calculateExerciseAmount(exerciseType, height);
        const result = await generateExercise(exerciseType, difficulty, tone, theme, amount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate);
        if (Array.isArray(result)) {
            onUpdate(id, { isGenerated: true, content: result });
        } else {
            onUpdate(id, { isGenerated: true, content: [result] }); // { error } payload shown on card
        }
    } catch (e) {
        onUpdate(id, { isGenerated: true, content: [{ error: 'Generation failed: ' + (e instanceof Error ? e.message : String(e)) }] });
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

  const handleAnswerItem = (index: number, attempt: { concept?: string; category?: 'Vocabulary' | 'Grammar'; isCorrect: boolean; studentAnswer: any; questionText?: string }) => {
    const logger = getActivityLogger();
    const concept = attempt.concept || theme || exerciseType;
    const cat = attempt.category || 'Vocabulary';
    if (logger) {
      logger.startActivity(`block_${id}_q_${index}`, 'drill', `${exerciseType} Q${index + 1}`);
      logger.logFocusItem(
        cat,
        concept,
        0,
        attempt.isCorrect ? 1.0 : 0.0,
        1,
        attempt.isCorrect ? [] : [String(attempt.studentAnswer)],
        attempt.questionText || null
      );
      logger.endActivity();
    }
    const updatedContent = content.map((item: any, idx: number) =>
      idx === index ? { ...item, studentAnswer: attempt.studentAnswer, correct: attempt.isCorrect } : item
    );
    onUpdate(id, { content: updatedContent });
  };

  let pedagogy = $derived((EXERCISE_PEDAGOGY as Record<string, string>)[exerciseType] || 'Default');
  let displayTitle = $derived(
    exerciseType.endsWith(`(${pedagogy})`) ? exerciseType.split('(')[0].trim() : exerciseType
  );
  let colors: any = $derived((PEDAGOGY_COLORS as Record<string, any>)[pedagogy] || (PEDAGOGY_COLORS as Record<string, any>)['Default']);
  let contentEl = $state<HTMLElement | null>(null);

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

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<motion.div
    role="region"
    aria-roledescription="exercise block"
    drag={!isResizing}
    dragMomentum={false}
    dragSnapToOrigin={true}
    dragElastic={0}
    onDragStart={() => {
        if (!isResizing) {
            onFocus(id);
            onSnapLines([]);
        }
    }}
    onDrag={(e: PointerEvent, info: any) => {
        if (isResizing) return;
        const { lines } = computeSnap(info.offset.x, info.offset.y);
        onSnapLines(lines);
    }}
    onDragEnd={(e: PointerEvent, info: any) => {
        if (isResizing) return;
        const { snappedX, snappedY } = computeSnap(info.offset.x, info.offset.y);
        onSnapLines([]);
        onUpdate(id, { x: Math.round(snappedX), y: Math.round(snappedY) });
    }}
    onmousedown={() => onFocus(id)}
    class="bg-fossil-50 rounded-[22px] shadow-card border panel-outline-light overflow-hidden flex flex-col origin-center hover:scale-[1.006] transition-[opacity,scale] duration-[170ms] ease-out {isRemoving ? 'opacity-0 scale-[0.97] pointer-events-none' : ''} {isResizing ? 'select-none' : ''} absolute cursor-grab active:cursor-grabbing"
    style="left: {x}px; top: {y}px; width: {width}px; height: {height}px; min-height: 150px; z-index: {zIndex};"
>
    <div class="h-full w-full flex flex-col">
    <!-- Top Gradient Bar -->
    <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>

    <!-- Resize Handles -->
    <div class="absolute -top-1 left-2 right-2 h-3 cursor-ns-resize z-50 hover:bg-ink-faint/20 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'n')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
    <div class="absolute -bottom-1 left-2 right-2 h-3 cursor-ns-resize z-50 hover:bg-ink-faint/20 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 's')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
    <div class="absolute -left-1 top-2 bottom-2 w-3 cursor-ew-resize z-50 hover:bg-ink-faint/20 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'w')} role="separator" aria-orientation="vertical" tabindex="-1"></div>
    <div class="absolute -right-1 top-2 bottom-2 w-3 cursor-ew-resize z-50 hover:bg-ink-faint/20 rounded-full" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'e')} role="separator" aria-orientation="vertical" tabindex="-1"></div>

    <div class="absolute -top-1 -left-1 w-4 h-4 cursor-nwse-resize z-50 hover:bg-ink-faint/25 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'nw')} role="separator" tabindex="-1"></div>
    <div class="absolute -top-1 -right-1 w-4 h-4 cursor-nesw-resize z-50 hover:bg-ink-faint/25 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'ne')} role="separator" tabindex="-1"></div>
    <div class="absolute -bottom-1 -left-1 w-4 h-4 cursor-nesw-resize z-50 hover:bg-ink-faint/25 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'sw')} role="separator" tabindex="-1"></div>
    <div class="absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize z-50 hover:bg-ink-faint/25 rounded" onpointerdown={stopPointer} onmousedown={(e) => startResize(e, 'se')} role="separator" tabindex="-1"></div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="@container px-6 py-3.5 flex items-center justify-between gap-3 border-b border-hairline bg-chrome text-ink-invert flex-shrink-0 relative z-10 font-ui" style="touch-action: none;" onpointerdown={stopPointer}>
        <div class="flex items-center gap-4 min-w-0 flex-1">
            <div class="flex items-center gap-3 min-w-0">
                <h3 class="font-semibold text-lg tracking-tight truncate min-w-0 flex-1 select-none">{displayTitle}</h3>
                <span class="text-sm px-2 py-1 uppercase tracking-widest font-semibold bg-black/40 text-fossil-300 rounded-full border border-hairline select-none whitespace-nowrap shrink-0 @max-md:hidden">{pedagogy}</span>
                <span class="text-sm px-2 py-1 font-semibold bg-black/30 text-fossil-300 rounded-full border border-hairline select-none items-center gap-1 whitespace-nowrap shrink-0 @max-lg:hidden" title="Estimated completion time">
                    <span>⏱</span> ~{estimatedDuration}m
                </span>
            </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0 relative z-50">
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
            <Button variant="ghost" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); isSettingsOpen = !isSettingsOpen; }} title="Settings" class={isSettingsOpen ? 'bg-fossil-50/15 text-ink-invert' : 'text-fossil-300'}>
                <Settings class="w-4 h-4" />
            </Button>
            <Button variant="danger" size="icon" onpointerdown={stop} onclick={(e) => { stop(e); handleRemove(); }} title="Remove" class="text-cinnabar-400 {isRemoving ? 'opacity-40' : ''}">
                <Trash2 class="w-4 h-4" />
            </Button>
        </div>
    </div>
    <div class="flex-grow flex flex-col bg-fossil-50 overflow-hidden relative w-full h-full" role="presentation" onpointerdown={stopPointer}>
        {#if isSettingsOpen}
            <div class="p-3 border-b border-rule bg-surface grid grid-cols-2 gap-3 flex-shrink-0 relative z-10" role="presentation" onpointerdown={stopPointer}>
                <label class="sr-only" for="block-difficulty-{id}">Block difficulty</label>
                <select
                    id="block-difficulty-{id}"
                    value={difficulty}
                    onchange={(e) => handleUpdateSetting({difficulty: e.currentTarget.value as Difficulty})}
                    class="appearance-none text-xs font-medium text-ink-muted p-2 rounded-lg border border-fossil-300 bg-surface-raised w-full outline-none focus:ring-2 focus:ring-accent cursor-pointer select-chevron pr-7"
                >
                    {#each DIFFICULTY_LEVELS as d (d)}
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
                    {#each TONES as tn (tn)}
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
            <div class="h-full flex flex-col p-4 bg-fossil-50 overflow-hidden space-y-3">
                <div class="w-full flex-grow space-y-3 flex flex-col justify-start">
                    {#each Array(generateAmount) as _, i (i)}
                        <ExerciseTemplate type={exerciseType} index={i} />
                    {/each}
                </div>
            </div>
        {:else if isLoading}
            <div class="h-full flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-8 h-8 border-4 border-fossil-200 border-t-accent rounded-full animate-spin"></div>
                    <span class="text-sm font-medium text-fossil-500 animate-pulse">Designing practice...</span>
                </div>
            </div>
        {:else}
            <div class="content-wrapper flex flex-col h-full overflow-hidden" bind:this={contentEl}>
                <div class="flex-grow overflow-y-auto no-scrollbar p-4 h-full w-full">
                    <div class="space-y-3">
                        {#each content as item, i (i)}
                            {@const Item = EXERCISE_RENDERERS[exerciseType as ExerciseType]}
                            <div class="border-b border-fossil-200 pb-3 last:border-b-0 last:pb-0 flex items-start gap-3">
                                <span class="text-xs font-semibold text-ink-muted select-none mt-0.5 shrink-0">{i + 1}.</span>
                                <div class="flex-1 min-w-0">
                                    {#if item?.error}
                                        <div class="p-3 bg-cinnabar-50 text-cinnabar-600 rounded-lg border border-cinnabar-200 text-sm">{item.error}</div>
                                    {:else if Item}
                                        <Item exercise={mapItemForRenderer(item)} {colors} onAnswer={(attempt: any) => handleAnswerItem(i, attempt)} />
                                    {:else}
                                        <pre class="text-xs whitespace-pre-wrap text-fossil-600 bg-fossil-50 p-3 rounded">{JSON.stringify(item, null, 2)}</pre>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>
    </div>
</motion.div>


<style>
    /* Prevent text selection while dragging */
    :global(body.dragging) {
        user-select: none;
    }
</style>
