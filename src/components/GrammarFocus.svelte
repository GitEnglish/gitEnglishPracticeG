<script lang="ts">
  import { ChevronDown, Plus, XCircle, SpellCheck } from 'lucide-svelte';

  let {
    focusGrammar,
    setFocusGrammar,
    grammarInclusionRate,
    setGrammarInclusionRate
  } = $props<{
    focusGrammar: string[];
    setFocusGrammar: (g: string[]) => void;
    grammarInclusionRate: number;
    setGrammarInclusionRate: (r: number) => void;
  }>();

  let isOpen = $state(false);
  let inputValue = $state('');

  const handleAddGrammar = () => {
      const newGrammar = inputValue.trim();
      if (newGrammar && !focusGrammar.includes(newGrammar)) {
          setFocusGrammar([...focusGrammar, newGrammar]);
          inputValue = '';
      }
  };

  const handleRemoveGrammar = (grammarToRemove: string) => {
      setFocusGrammar(focusGrammar.filter((g: string) => g !== grammarToRemove));
  };

  const handleInclusionRateChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      setGrammarInclusionRate(Number(target.value));
  };
</script>

<div class="bg-slate-900/50 rounded-xl ring-1 ring-slate-700 overflow-hidden font-casual mb-4">
  <button onclick={() => isOpen = !isOpen} class="w-full flex justify-between items-center p-4 text-left bg-slate-800/50 hover:bg-slate-800 transition-colors focus:outline-none">
      <div class="flex items-center">
          <SpellCheck class="w-5 h-5 mr-2 text-emerald-400" />
          <span class="font-bold text-emerald-100 text-sm tracking-wide">Grammar Focus</span>
      </div>
      <ChevronDown class={`w-4 h-4 text-emerald-500/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {#if isOpen}
      <div class="p-3 border-t border-slate-700 space-y-4 bg-slate-900/30">
          <div>
              <div class="flex gap-2">
                  <input
                      type="text"
                      bind:value={inputValue}
                      onkeydown={(e) => e.key === 'Enter' && handleAddGrammar()}
                      placeholder="Add target grammar (e.g. Present Perfect)..."
                      class="w-full bg-slate-950 text-emerald-50 border border-slate-700 rounded-md shadow-sm px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder-slate-600 font-serif"
                      aria-label="Add target grammar point"
                  />
                  <button onclick={handleAddGrammar} class="bg-emerald-500 text-slate-900 font-bold p-1.5 rounded-md hover:bg-emerald-400 transition-colors shadow" aria-label="Add grammar point">
                      <Plus class="w-4 h-4" />
                  </button>
              </div>
              {#if focusGrammar.length > 0}
                  <div class="mt-3 flex flex-wrap gap-2">
                      {#each focusGrammar as g}
                          <span class="flex items-center bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                              {g}
                              <button onclick={() => handleRemoveGrammar(g)} class="ml-1.5 text-emerald-400 hover:text-white" aria-label={`Remove ${g}`}>
                                  <XCircle class="w-3.5 h-3.5"/>
                              </button>
                          </span>
                      {/each}
                  </div>
              {/if}
          </div>
          <div>
              <div class="flex justify-between text-xs font-bold text-emerald-500/70 mb-1.5">
                  <span>Inclusion Rate</span>
                  <span class="text-emerald-400">{grammarInclusionRate}%</span>
              </div>
              <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={grammarInclusionRate}
                  oninput={handleInclusionRateChange}
                  class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-emerald shadow-inner"
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
