<script lang="ts">
  import { motion, AnimatePresence } from '@humanspeak/svelte-motion';
  import { X } from 'lucide-svelte';

  let {
    open = $bindable(false),
    side = 'right',
    title = 'Details',
    width = 'max-w-md',
    children
  } = $props<{
    open: boolean;
    side?: 'left' | 'right';
    title?: string;
    width?: string;
    children?: import('svelte').Snippet;
  }>();

  // Lock body scroll when open
  $effect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) open = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

  <AnimatePresence show={open}>
    <!-- Backdrop -->
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onclick={() => (open = false)}
      class="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
    />

    <!-- Panel -->
    <motion.div
      initial={{ x: side === 'right' ? '100%' : '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: side === 'right' ? '100%' : '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      class="fixed top-0 {side === 'right' ? 'right-0' : 'left-0'} h-full {width} w-full
             z-50 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col
             border-l border-zinc-200/50 dark:border-zinc-800/50
             {side === 'left' ? 'border-r' : 'border-l'}"
    >
      <!-- Gradient glow line on the edge -->
      <div class="absolute {side === 'right' ? 'left-0' : 'right-0'} top-0 bottom-0 w-px
                  bg-gradient-to-b from-transparent via-zinc-300/50 to-transparent
                  dark:via-zinc-700/50"></div>

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50">
        <h2 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <button
          onclick={() => open = false}
          class="group flex items-center justify-center w-8 h-8 rounded-full
                 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close panel"
        >
          <X class="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </motion.div>
  </AnimatePresence>
