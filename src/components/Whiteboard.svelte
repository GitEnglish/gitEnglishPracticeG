<script lang="ts">
  import { Wand2 } from 'lucide-svelte';
  import type { ExerciseBlockState } from '../lib/types';
  import ExerciseBlock from './ExerciseBlock.svelte';

  let {
    blocks,
    onAddBlock,
    onUpdateBlock,
    onRemoveBlock,
    onFocusBlock,
    presentingBlockId,
    onEnterPresentation,
    onExitPresentation,
    onNextSlide,
    onPrevSlide
  } = $props<{
    blocks: ExerciseBlockState[];
    onAddBlock?: (type: string, x: number, y: number) => void;
    onUpdateBlock: (id: number, updates: Partial<ExerciseBlockState>) => void;
    onRemoveBlock: (id: number) => void;
    onFocusBlock: (id: number) => void;
    presentingBlockId: number | null;
    onEnterPresentation: (id: number) => void;
    onExitPresentation: () => void;
    onNextSlide: () => void;
    onPrevSlide: () => void;
  }>();

  let scale = $state(1);
  let pan = $state({ x: 0, y: 0 });
  let isPanning = $state(false);
  let lastMousePos = $state({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isBackground = target.id === 'whiteboard-background' || target.id === 'whiteboard-main';

    if (e.button === 1 || e.button === 2 || (e.button === 0 && isBackground)) {
      isPanning = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    pan = { x: pan.x + dx, y: pan.y + dy };
    lastMousePos = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    if (isPanning) isPanning = false;
  };

  const handleWheel = (e: WheelEvent) => {
      // Allow zooming if holding ctrl or meta key
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const zoomSensitivity = 0.001;
          const delta = -e.deltaY * zoomSensitivity;
          const newScale = Math.min(Math.max(0.2, scale + delta), 3);
          scale = newScale;
      }
  };

  // Setup window listeners for pan/zoom
  $effect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  const handleDrop = (e: DragEvent) => {
      e.preventDefault();

      const blockId = e.dataTransfer?.getData('block-id');
      if (blockId) {
          // Block moved
          const id = parseInt(blockId, 10);
          const offsetX = parseFloat(e.dataTransfer?.getData('offset-x') || '0');
          const offsetY = parseFloat(e.dataTransfer?.getData('offset-y') || '0');

          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / scale - offsetX;
          const y = (e.clientY - rect.top - pan.y) / scale - offsetY;

          onUpdateBlock(id, { x: Math.round(x), y: Math.round(y) });
          return;
      }

      e.preventDefault();
      const exerciseType = e.dataTransfer?.getData('exercise-type');
      if (exerciseType && onAddBlock) {
          // Adjust drop coordinates based on current pan and scale
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / scale;
          const y = (e.clientY - rect.top - pan.y) / scale;
          onAddBlock(exerciseType, Math.round(x), Math.round(y));
      }
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main
  id="whiteboard-main"
  onmousedown={handleMouseDown}
  onwheel={handleWheel}
  ondrop={handleDrop}
  ondragover={(e) => e.preventDefault()}
  class="flex-grow bg-slate-200 relative overflow-hidden font-casual h-full w-full {isPanning ? 'cursor-grabbing' : 'cursor-grab'}"
>
  {#if blocks.length === 0}
  <div class="absolute inset-0 flex flex-col justify-center items-center text-center text-slate-500 pointer-events-none p-4 z-0 select-none">
      <Wand2 size={64} class="text-slate-400" />
      <h2 class="text-2xl font-bold mt-4">Welcome to the Practice Genie!</h2>
      <p class="mt-2 text-lg">Your infinite whiteboard is empty.</p>
      <p class="mt-1">Drag an exercise from the sidebar to anywhere on the canvas.</p>
      <p class="mt-4 text-sm opacity-70">
          <span class="bg-slate-300/50 px-2 py-1 rounded">Click & Drag</span> empty space to pan • <span class="bg-slate-300/50 px-2 py-1 rounded">Cmd+Scroll</span> to zoom
      </p>
  </div>
  {/if}

  <div
      id="whiteboard-background"
      class="absolute origin-top-left will-change-transform {isPanning ? 'pointer-events-none' : ''}"
      style="transform: translate({pan.x}px, {pan.y}px) scale({scale}); width: 10000px; height: 10000px; left: -5000px; top: -5000px; background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 20px 20px; background-position: 5000px 5000px;"
  >
    {#each blocks as block (block.id)}
      <ExerciseBlock
        blockState={block}
        onUpdate={onUpdateBlock}
        onRemove={onRemoveBlock}
        onFocus={onFocusBlock}
        isPresenting={presentingBlockId === block.id}
        {onEnterPresentation}
        {onExitPresentation}
        {onNextSlide}
        {onPrevSlide}
        {scale}
      />
    {/each}
  </div>

  {#if presentingBlockId !== null}
      <div class="fixed inset-0 bg-slate-900/90 z-50 transition-opacity flex items-center justify-center pointer-events-none"></div>
  {/if}
</main>
