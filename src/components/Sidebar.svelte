<script lang="ts">
  import { BookOpen, ChevronDown, Puzzle } from 'lucide-svelte';
  import { EXERCISE_CATEGORIES, EXERCISE_PEDAGOGY, PEDAGOGY_COLORS } from '../lib/constants';
  import { EXERCISE_INFO } from '../lib/exerciseInfo';
  import type { ExerciseType } from '../lib/types';

  let { isSidebarOpen = true } = $props();

  let openCategory: string | null = $state('PPP');
  let isConfigOpen = $state(false);

  const toggleCategory = (name: string) => {
      openCategory = openCategory === name ? null : name;
  };



</script>

{#snippet difficultyIndicator(rating: string)}
  {@const ratingsMap: Record<string, number> = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'Suffering': 7,
    'Beginner': 1, 'Intermediate': 3, 'Advanced': 5
  }}
  {@const level = ratingsMap[rating] || 1}
  <div class="flex items-end gap-0.5 h-4" title={`${rating} Difficulty`}>
      <div class={`w-1 h-1.5 rounded-sm ${level >= 1 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
      <div class={`w-1 h-2 rounded-sm ${level >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
      <div class={`w-1 h-2.5 rounded-sm ${level >= 3 ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
      <div class={`w-1 h-3 rounded-sm ${level >= 4 ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
      <div class={`w-1 h-3.5 rounded-sm ${level >= 5 ? 'bg-orange-600' : 'bg-slate-700'}`}></div>
      <div class={`w-1 h-4 rounded-sm ${level >= 6 ? 'bg-red-600' : 'bg-slate-700'}`}></div>
  </div>
{/snippet}

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
                          {@const pedagogy = EXERCISE_PEDAGOGY[type] || 'Default'}
                          {@const colors = PEDAGOGY_COLORS[pedagogy]}
                          {@const info = EXERCISE_INFO[type]}
                          {@const displayName = type.split('(')[0].trim()}
                          <div class="relative group">
                              <div
                                  role="button"
                                  tabindex="0"
                                  draggable="true"
                                  ondragstart={(e) => {
                                      e.dataTransfer?.setData('exercise-type', type);
                                      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
                                  }}
                                  class="w-full text-left p-2.5 rounded-md cursor-grab active:scale-95 transition-all duration-200 border {colors.border} {colors.bgOnDark} hover:bg-opacity-100 hover:translate-x-1 hover:shadow-lg group-hover:ring-1 ring-opacity-50 ring-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:{colors.border.replace('border-', 'ring-')}"
                                  aria-label={`Add ${type} exercise`}
                              >
                                  <div class="flex justify-between items-center">
                                      <div class="flex items-center gap-3 min-w-0">
                                          <Puzzle class="w-4 h-4 {colors.textOnDark} opacity-70" />
                                          <div class="min-w-0">
                                              <h3 class="text-xs font-medium truncate {colors.textOnDark}">{displayName}</h3>
                                          </div>
                                      </div>
                                      <div class="flex-shrink-0">
                                          {@render difficultyIndicator(info.difficultyRating)}
                                      </div>
                                  </div>
                              </div>

                              <!-- Tooltip -->
                              <div class="absolute left-full top-0 ml-4 w-72 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                  <div class="absolute top-4 -left-2 w-4 h-4 bg-slate-900 border-b border-l border-slate-700 transform rotate-45"></div>
                                  <h4 class="font-bold {colors.textOnDark} text-base mb-1.5">{info.name}</h4>
                                  <div class="flex items-center gap-2 mb-3">
                                      <span class="text-xs px-2 py-0.5 rounded-full border {colors.border} {colors.bgOnDark} {colors.textOnDark} bg-opacity-50">{pedagogy}</span>
                                      <span class="text-xs text-slate-500">•</span>
                                      <span class="text-xs text-slate-400">{info.difficultyRating}</span>
                                  </div>
                                  <p class="text-slate-300 text-sm mb-4 leading-relaxed">{info.description}</p>
                                  <div class="bg-slate-950/50 rounded-lg p-3 border border-slate-800 mb-2">
                                      <p class="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Example</p>
                                      <p class="text-xs text-slate-300 font-mono italic">"{info.example}"</p>
                                  </div>
                                  <p class="text-[10px] text-slate-500 text-center uppercase tracking-widest pt-1">Drag to place</p>
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
