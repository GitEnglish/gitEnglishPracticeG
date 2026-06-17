<script lang="ts">
  import { motion, AnimatePresence } from '@humanspeak/svelte-motion';
  import { GripVertical, MoreHorizontal } from 'lucide-svelte';

  let { modules } = $props<{
    modules: Array<{ id: string; title: string; description: string; status: 'active' | 'draft' | 'archived' }>;
  }>();

  // Simple drag-to-reorder state simulation
  let list = $derived(modules);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };
</script>

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
  class="space-y-3"
>
  <AnimatePresence>
    {#each list as mod (mod.id)}
      <motion.div
        layout
        variants={itemVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        class="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900
               border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-grab active:cursor-grabbing"
      >
        <div class="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {mod.title}
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full
              {mod.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
              {mod.status === 'draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : ''}
              {mod.status === 'archived' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400' : ''}
            ">
              {mod.status}
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {mod.description}
          </p>
        </div>

        <button class="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </motion.div>
    {/each}
  </AnimatePresence>
</motion.div>
