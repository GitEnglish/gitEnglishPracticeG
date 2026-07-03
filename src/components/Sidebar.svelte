<script lang="ts">
  import { BookOpen, ChevronDown, Puzzle } from 'lucide-svelte';

  let { isSidebarOpen = true } = $props();

  let openCategory: string | null = $state('PPP');
  let isConfigOpen = $state(false);

  const toggleCategory = (name: string) => {
      openCategory = openCategory === name ? null : name;
  };

  const EXERCISE_CATEGORIES = [
      { name: 'PPP', types: ['Fill-in-the-Blank', 'Sentence Scramble', 'Multiple Choice', 'Matching'] },
      { name: 'Lexis', types: ['Word Formation', 'Collocation Gap-Fill'] },
      { name: 'C-R', types: ['Rule Discovery (C-R)', 'Spot the Difference (C-R)'] },
      { name: 'Input', types: ['Reading for Gist (Skimming)', 'Reading for Detail (Scanning)'] },
      { name: 'Skills', types: ['Functional Writing Prompt'] }
  ];
</script>

<aside class="fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 text-white flex flex-col h-screen transition-transform duration-300 ease-in-out will-change-transform border-r border-slate-800 shadow-2xl lg:static lg:translate-x-0 {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} font-casual">

  <div class="p-6 pb-4 flex-shrink-0 border-b border-slate-800 bg-slate-900 z-10">
    <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 font-playful">gitEnglish™</h1>
    <h2 class="text-sm font-medium text-slate-400 mt-0.5 tracking-wide uppercase">Practice Genie</h2>
  </div>

  <div class="flex-grow overflow-y-auto custom-scrollbar-dark p-4">

      <div class="mb-6">
          <button
            onclick={() => isConfigOpen = !isConfigOpen}
            class="flex items-center justify-between w-full p-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
          >
              <span>Configuration</span>
              <ChevronDown class="w-4 h-4 transition-transform duration-200 {isConfigOpen ? 'rotate-180' : ''}" />
          </button>
      </div>

      <div class="pb-8">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-3">Exercise Library</h3>

          {#each EXERCISE_CATEGORIES as category}
            <div class="mb-1 rounded-xl overflow-hidden transition-all duration-300 border {openCategory === category.name ? 'border-slate-700 bg-slate-800/50 shadow-inner' : 'border-transparent bg-slate-900/50 hover:bg-slate-800'}">
              <button
                  onclick={() => toggleCategory(category.name)}
                  class="flex items-center justify-between w-full p-3 text-left focus:outline-none cursor-pointer"
              >
                  <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                         <BookOpen size={14} />
                      </div>
                      <span class="font-bold text-sm text-slate-200 transition-opacity duration-200 {openCategory === category.name ? 'opacity-100' : 'opacity-90'}">{category.name}</span>
                  </div>
                  <ChevronDown size={16} class="transition-transform duration-200 {openCategory === category.name ? 'rotate-180 text-slate-200' : 'text-slate-500'}" />
              </button>

              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {openCategory === category.name ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}">
                  <div class="min-h-0 space-y-2 pl-2 border-l-2 border-slate-700 border-opacity-30 ml-4 mb-2">
                      {#each category.types as type}
                          <div class="cursor-grab hover:bg-slate-700 p-2 text-sm rounded transition-colors text-slate-300 flex items-center justify-between border border-slate-700/50">
                            <div class="flex items-center gap-2">
                              <Puzzle size={12} class="opacity-50" />
                              {type}
                            </div>
                            <div class="flex gap-0.5 opacity-50">
                              <div class="w-1 h-3 bg-slate-400 rounded-full"></div>
                              <div class="w-1 h-3 bg-slate-400 rounded-full"></div>
                              <div class="w-1 h-3 bg-slate-400 rounded-full"></div>
                            </div>
                          </div>
                      {/each}
                  </div>
              </div>
            </div>
          {/each}
      </div>
  </div>

  <div class="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-600">
      v2.1.0 • Infinite Canvas
  </div>
</aside>

<style>
  .custom-scrollbar-dark::-webkit-scrollbar {
      width: 6px;
  }
  .custom-scrollbar-dark::-webkit-scrollbar-track {
      background: transparent;
  }
  .custom-scrollbar-dark::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
  }
</style>
