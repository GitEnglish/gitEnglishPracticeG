<script lang="ts">
  import { ChevronDown, Plus, XCircle, SpellCheck } from 'lucide-svelte';

  let {
    focusGrammar,
    onUpdateFocusGrammar,
    grammarInclusionRate,
    onUpdateGrammarInclusionRate
  } = $props<{
    focusGrammar: string[];
    onUpdateFocusGrammar: (g: string[]) => void;
    grammarInclusionRate: number;
    onUpdateGrammarInclusionRate: (r: number) => void;
  }>();

  let isOpen = $state(false);
  let inputValue = $state('');

  const handleAddGrammar = () => {
      const newGrammar = inputValue.trim();
      if (newGrammar && !focusGrammar.includes(newGrammar)) {
          onUpdateFocusGrammar([...focusGrammar, newGrammar]);
          inputValue = '';
      }
  };

  const handleRemoveGrammar = (grammarToRemove: string) => {
      onUpdateFocusGrammar(focusGrammar.filter((g: string) => g !== grammarToRemove));
  };

  const handleInclusionRateChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      onUpdateGrammarInclusionRate(Number(target.value));
  };
</script>

<div class="bg-fossil-900/50 rounded-xl ring-1 ring-fossil-700 overflow-hidden font-casual mb-4">
  <button onclick={() => isOpen = !isOpen} class="w-full flex justify-between items-center p-4 text-left bg-fossil-800/50 hover:bg-fossil-800 transition-colors focus:outline-none">
      <div class="flex items-center">
          <SpellCheck class="w-5 h-5 mr-2 text-malachite-400" />
          <span class="font-bold text-malachite-100 text-sm tracking-wide">Grammar Focus</span>
      </div>
      <ChevronDown class={`w-4 h-4 text-malachite-500/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {#if isOpen}
      <div class="p-3 border-t border-fossil-700 space-y-4 bg-fossil-900/30">
          <div>
              <div class="flex gap-2">
                  <input
                      type="text"
                      bind:value={inputValue}
                      onkeydown={(e) => e.key === 'Enter' && handleAddGrammar()}
                      placeholder="Add target grammar (e.g. Present Perfect)..."
                      class="w-full bg-fossil-950 text-malachite-50 border border-fossil-700 rounded-md shadow-sm px-3 py-1.5 text-xs focus:ring-1 focus:ring-malachite-500 focus:border-malachite-500 focus:outline-none placeholder-fossil-600 font-serif"
                      aria-label="Add target grammar point"
                  />
                  <button onclick={handleAddGrammar} class="bg-malachite-500 text-fossil-900 font-bold p-1.5 rounded-md hover:bg-malachite-400 transition-colors shadow" aria-label="Add grammar point">
                      <Plus class="w-4 h-4" />
                  </button>
              </div>
              {#if focusGrammar.length > 0}
                  <div class="mt-3 flex flex-wrap gap-2">
                      {#each focusGrammar as g}
                          <span class="flex items-center bg-malachite-500/20 text-malachite-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-malachite-500/40 shadow-sm">
                              {g}
                              <button onclick={() => handleRemoveGrammar(g)} class="ml-1.5 text-malachite-400 hover:text-fossil-50" aria-label={`Remove ${g}`}>
                                  <XCircle class="w-3.5 h-3.5"/>
                              </button>
                          </span>
                      {/each}
                  </div>
              {/if}
          </div>
          <div>
              <div class="flex justify-between text-xs font-bold text-malachite-500/70 mb-1.5">
                  <span>Inclusion Rate</span>
                  <span class="text-malachite-400">{grammarInclusionRate}%</span>
              </div>
              <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={grammarInclusionRate}
                  oninput={handleInclusionRateChange}
                  class="w-full h-1.5 bg-fossil-700 rounded-lg appearance-none cursor-pointer range-thumb-emerald shadow-inner"
                  aria-label="Grammar inclusion rate slider"
              />
          </div>
      </div>
  {/if}
</div>

<style>
  .range-thumb-emerald::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      background: #10b981;
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid #1e293b;
      box-shadow: 0 0 0 1px #10b981;
  }
</style>
