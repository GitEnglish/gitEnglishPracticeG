<script lang="ts">
  import { ChevronDown, Plus, XCircle } from 'lucide-svelte';

  let {
    focusVocabulary,
    onUpdateFocusVocabulary,
    inclusionRate,
    onUpdateInclusionRate
  } = $props<{
    focusVocabulary: string[];
    onUpdateFocusVocabulary: (v: string[]) => void;
    inclusionRate: number;
    onUpdateInclusionRate: (r: number) => void;
  }>();

  let isOpen = $state(false);
  let inputValue = $state('');

  const handleAddVocab = () => {
      const newVocab = inputValue.trim();
      if (newVocab && !focusVocabulary.includes(newVocab.toLowerCase())) {
          onUpdateFocusVocabulary([...focusVocabulary, newVocab.toLowerCase()]);
          inputValue = '';
      }
  };

  const handleRemoveVocab = (vocabToRemove: string) => {
      onUpdateFocusVocabulary(focusVocabulary.filter((v: string) => v !== vocabToRemove));
  };

  const handleInclusionRateChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      onUpdateInclusionRate(Number(target.value));
  };
</script>

<div class="mb-4 bg-fossil-900/50 rounded-xl ring-1 ring-fossil-700 overflow-hidden font-casual">
  <button onclick={() => isOpen = !isOpen} class="w-full flex justify-between items-center p-4 text-left bg-fossil-800/50 hover:bg-fossil-800 transition-colors focus:outline-none">
      <div class="flex items-center">
          <div class="w-5 h-5 mr-2 text-citrine-400 font-bold flex items-center justify-center">Aa</div>
          <span class="font-semibold text-citrine-100 text-[15px] tracking-tight">Vocabulary Focus</span>
      </div>
      <ChevronDown class={`w-4 h-4 text-citrine-500/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {#if isOpen}
      <div class="p-3 border-t border-fossil-700 space-y-4 bg-fossil-900/30">
          <div>
              <div class="flex gap-2">
                  <input
                      type="text"
                      bind:value={inputValue}
                      onkeydown={(e) => e.key === 'Enter' && handleAddVocab()}
                      placeholder="Add target word..."
                      class="w-full bg-fossil-950 text-citrine-50 border border-fossil-700 rounded-md shadow-sm px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-citrine-500 focus:border-citrine-500 focus:outline-none placeholder-fossil-600 font-serif"
                      aria-label="Add target vocabulary word"
                  />
                  <button onclick={handleAddVocab} class="bg-citrine-500 text-fossil-900 font-bold p-1.5 rounded-md hover:bg-citrine-400 transition-colors shadow" aria-label="Add word">
                      <Plus class="w-4 h-4" />
                  </button>
              </div>
              {#if focusVocabulary.length > 0}
                  <div class="mt-3 flex flex-wrap gap-2">
                      {#each focusVocabulary as v}
                          <span class="flex items-center bg-citrine-500/20 text-citrine-200 text-sm font-semibold px-2.5 py-1 rounded-full border border-citrine-500/40 shadow-sm">
                              {v}
                              <button onclick={() => handleRemoveVocab(v)} class="ml-1.5 text-citrine-400 hover:text-fossil-50" aria-label={`Remove ${v}`}>
                                  <XCircle class="w-3.5 h-3.5"/>
                              </button>
                          </span>
                      {/each}
                  </div>
              {/if}
          </div>
          <div>
              <div class="flex justify-between text-sm font-semibold text-citrine-500/80 mb-1.5">
                  <span>Inclusion Rate</span>
                  <span class="text-citrine-400">{inclusionRate}%</span>
              </div>
              <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={inclusionRate}
                  oninput={handleInclusionRateChange}
                  class="w-full h-1.5 bg-fossil-700 rounded-lg appearance-none cursor-pointer range-thumb-yellow shadow-inner"
                  aria-label="Vocabulary inclusion rate slider"
              />
          </div>
      </div>
  {/if}
</div>

<style>
  .range-thumb-yellow::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      background: #eab308;
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid #1e293b;
      box-shadow: 0 0 0 1px #eab308;
  }
</style>
