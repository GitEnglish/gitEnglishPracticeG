<script lang="ts">
  import { motion } from '@humanspeak/svelte-motion';
  import { Library, LayoutDashboard, Settings } from 'lucide-svelte';
  import SidePanel from './components/SidePanel.svelte';
  import ModuleList from './components/module-browser/ModuleList.svelte';

  let panelOpen = $state(false);

  // Generate 32 mock modules for the browser
  const mockModules = Array.from({ length: 32 }, (_, i) => ({
    id: `mod-${i + 1}`,
    title: `Core Curriculum Module ${i + 1}`,
    description: `Foundational concepts and exercises for section ${String.fromCharCode(65 + (i % 5))}.`,
    status: i < 5 ? 'active' : i < 20 ? 'draft' : 'archived'
  })) as Array<{ id: string; title: string; description: string; status: 'active' | 'draft' | 'archived' }>;
</script>

<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
  <!-- Top Navigation Bar -->
  <header class="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
        G
      </div>
      <h1 class="text-xl font-bold tracking-tight">Practice Genie</h1>
    </div>

    <div class="flex items-center gap-4 text-zinc-500">
      <button class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        <LayoutDashboard size={20} />
      </button>
      <button class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        <Settings size={20} />
      </button>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 max-w-5xl mx-auto w-full p-8 flex flex-col items-center justify-center gap-8">
    <div class="text-center max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 class="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
          Welcome to the new Workspace
        </h2>
        <p class="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          The react legacy is gone. This is a pristine Svelte 5 environment powered by
          <code class="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-sm font-mono text-emerald-600 dark:text-emerald-400">
            @humanspeak/svelte-motion
          </code>
          for unparalleled fluidity.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onclick={() => panelOpen = true}
          class="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900
                 rounded-full font-medium shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:shadow-zinc-900/30
                 transition-shadow"
        >
          <Library size={20} />
          <span>Browse 32 Modules</span>
        </motion.button>
      </motion.div>
    </div>
  </main>
</div>

<!-- The Sexy Side Panel -->
<SidePanel bind:open={panelOpen} title="Module Browser" width="max-w-md" side="right">
  <div class="mb-4">
    <input
      type="text"
      placeholder="Search modules..."
      class="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:border-emerald-500
             focus:ring-2 focus:ring-emerald-500/20 rounded-lg outline-none transition-all
             text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
    />
  </div>

  <ModuleList modules={mockModules} />
</SidePanel>
