<script lang="ts">
  import { Wand2 } from 'lucide-svelte';
  import { motion } from '@humanspeak/svelte-motion';

  // We define a block data structure locally just for the drag demonstration
  let blocks = $state([
    { id: 1, type: 'Fill-in-the-Blank', x: 200, y: 200, width: 350, height: 200 }
  ]);

  const removeBlock = (id: number) => {
    blocks = blocks.filter(b => b.id !== id);
  }
</script>

<main class="flex-grow bg-slate-200 relative overflow-hidden cursor-default font-casual h-full w-full">
  {#if blocks.length === 0}
  <div class="absolute inset-0 flex flex-col justify-center items-center text-center text-slate-500 pointer-events-none p-4 z-0 select-none">
      <Wand2 size={64} class="text-slate-400" />
      <h2 class="text-2xl font-bold mt-4">Welcome to the Practice Genie!</h2>
      <p class="mt-2 text-lg">Your infinite whiteboard is empty.</p>
      <p class="mt-1">Drag an exercise from the sidebar to anywhere on the canvas.</p>
      <p class="mt-4 text-sm opacity-70">
          <span class="bg-slate-300/50 px-2 py-1 rounded">Click & Drag</span> empty space to pan • Scroll to zoom
      </p>
  </div>
  {/if}

  <div
      class="absolute top-0 left-0 w-full h-full origin-top-left"
      style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 20px 20px; width: 100000px; height: 100000px;"
  >
    {#each blocks as block (block.id)}
      <motion.div
        key={String(block.id)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ x: block.x, y: block.y, width: block.width, height: block.height }}
        drag
        dragElastic={0.2}
        whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
        class="absolute bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-xl transition-shadow"
      >
        <div class="bg-slate-800 text-white p-3 flex justify-between items-center cursor-grab active:cursor-grabbing">
          <h3 class="font-bold text-sm">{block.type}</h3>
          <button
            onclick={() => removeBlock(block.id)}
            class="text-slate-400 hover:text-red-400 transition-colors"
          >
            &times;
          </button>
        </div>
        <div class="p-4 flex-grow flex items-center justify-center text-slate-400">
          Exercise Content Area
        </div>
      </motion.div>
    {/each}
  </div>
</main>
