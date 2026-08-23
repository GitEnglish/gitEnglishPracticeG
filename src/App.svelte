<script lang="ts">
  import Sidebar from './components/Sidebar.svelte';
  import Whiteboard from './components/Whiteboard.svelte';
    import GlobalSettings from './components/GlobalSettings.svelte';
  import type { ExerciseBlockState } from './lib/types';
  import { Difficulty, Tone, ExerciseType } from './lib/types';

  let isSidebarOpen = $state(true);

  // Global Settings State
  let isGlobalSettingsOpen = $state(false);
  let globalDifficulty = $state<Difficulty>(Difficulty.B1);
  let globalTone = $state<Tone>(Tone.Casual);
  let globalTheme = $state<string>('');
  let globalMakerApiKey = $state<string>(localStorage.getItem('deepseek_maker_api_key') || '');
  let globalCheckerApiKey = $state<string>(localStorage.getItem('deepseek_checker_api_key') || '');
  let globalMakerTemperature = $state<number>(parseFloat(localStorage.getItem('deepseek_maker_temp') || '0.7'));
  let globalCheckerTemperature = $state<number>(parseFloat(localStorage.getItem('deepseek_checker_temp') || '0.2'));


  // Focus Settings State
  let globalFocusVocabulary = $state<string[]>(JSON.parse(localStorage.getItem('practiceGenie-focusVocabulary') || '[]'));
  let globalInclusionRate = $state<number>(parseFloat(localStorage.getItem('practiceGenie-inclusionRate') || '50'));
  let globalFocusGrammar = $state<string[]>(JSON.parse(localStorage.getItem('practiceGenie-focusGrammar') || '[]'));
  let globalGrammarInclusionRate = $state<number>(parseFloat(localStorage.getItem('practiceGenie-grammarInclusionRate') || '50'));

  // App State
  let blocks = $state<ExerciseBlockState[]>([]);
  let presentingBlockId = $state<number | null>(null);

  let nextId = $derived(blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) + 1 : 1);
  let maxZIndex = $derived(blocks.length > 0 ? Math.max(...blocks.map(b => b.zIndex)) : 10);

  // Handlers
  const handleAddBlock = (typeStr: string, dropX?: number, dropY?: number) => {
      const type = typeStr as ExerciseType;
      let finalX = 0;
      let finalY = 0;
      const width = 350;
      const height = 250;

      if (dropX !== undefined && dropY !== undefined) {
          finalX = Math.round(dropX - width/2); // Offset already handled by Whiteboard
          finalY = Math.round(dropY - height/2);
      } else {
          // Find free position logic equivalent to React version
          // the legacy app used standard screen bounds, here the whiteboard origin is at -5000, -5000
          // Let's place it near the center of the current view by default, or just at a fixed offset
          // To be simple and match the "fallback" logic, let's put it around 0,0 relative to whiteboard center
          finalX = 5000 + 100;
          finalY = 5000 + 100;

          let positionFound = false;
          for (let y = 100; y < 3000 && !positionFound; y += 50) {
              for (let x = 100; x < 3000 && !positionFound; x += 50) {
                  const checkX = 5000 + x;
                  const checkY = 5000 + y;
                  let hasOverlap = false;
                  for (const block of blocks) {
                      if (
                          checkX < block.x + block.width &&
                          checkX + width > block.x &&
                          checkY < block.y + block.height &&
                          checkY + height > block.y
                      ) {
                          hasOverlap = true;
                          break;
                      }
                  }
                  if (!hasOverlap) {
                      finalX = checkX;
                      finalY = checkY;
                      positionFound = true;
                  }
              }
          }
      }

      const newBlock: ExerciseBlockState = {
          id: nextId,
          exerciseType: type,
          x: -5000 + (window.innerWidth / 2) - 175, // Center minus half width
          y: -5000 + (window.innerHeight / 2) - 100,
          width: 350,
          height: 250,
          zIndex: maxZIndex + 1,
          difficulty: globalDifficulty,
          tone: globalTone,
          theme: globalTheme || 'General English',
          focusVocabulary: [...globalFocusVocabulary],
          inclusionRate: globalInclusionRate,
          focusGrammar: [...globalFocusGrammar],
          grammarInclusionRate: globalGrammarInclusionRate,
          isGenerated: false
      };
      blocks = [...blocks, newBlock];
  };

  const handleUpdateBlock = (id: number, updates: Partial<ExerciseBlockState>) => {
      blocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
  };

  const handleRemoveBlock = (id: number) => {
      blocks = blocks.filter(b => b.id !== id);
      if (presentingBlockId === id) presentingBlockId = null;
  };

  const handleFocusBlock = (id: number) => {
      blocks = blocks.map(b => b.id === id ? { ...b, zIndex: maxZIndex + 1 } : b);
  };

  const cycleDifficulty = () => {
      const diffs = Object.values(Difficulty);
      const idx = diffs.indexOf(globalDifficulty);
      globalDifficulty = diffs[(idx + 1) % diffs.length];
  };
</script>

<div class="h-screen w-screen flex font-casual antialiased overflow-hidden bg-slate-800">

  <Sidebar
    {isSidebarOpen}
    focusVocabulary={globalFocusVocabulary}
    onUpdateFocusVocabulary={(v: string[]) => { globalFocusVocabulary = v; localStorage.setItem('practiceGenie-focusVocabulary', JSON.stringify(v)); }}
    inclusionRate={globalInclusionRate}
    onUpdateInclusionRate={(r: number) => { globalInclusionRate = r; localStorage.setItem('practiceGenie-inclusionRate', r.toString()); }}
    focusGrammar={globalFocusGrammar}
    onUpdateFocusGrammar={(g: string[]) => { globalFocusGrammar = g; localStorage.setItem('practiceGenie-focusGrammar', JSON.stringify(g)); }}
    grammarInclusionRate={globalGrammarInclusionRate}
    onUpdateGrammarInclusionRate={(r: number) => { globalGrammarInclusionRate = r; localStorage.setItem('practiceGenie-grammarInclusionRate', r.toString()); }}
  />

  {#if isGlobalSettingsOpen}
      <GlobalSettings
        onClose={() => isGlobalSettingsOpen = false}
        difficulty={globalDifficulty}
        setDifficulty={(d) => globalDifficulty = d}
        tone={globalTone}
        setTone={(t) => globalTone = t}
        theme={globalTheme}
        setTheme={(t) => globalTheme = t}
        totalTime={blocks.reduce((acc, b) => acc + (b.quantity || 1), 0)}
        makerApiKey={globalMakerApiKey}
        setMakerApiKey={(k) => {
            globalMakerApiKey = k;
            localStorage.setItem('deepseek_maker_api_key', k);
            import('./services/deepseekService').then(m => m.setMakerApiKey && m.setMakerApiKey(k));
        }}
        checkerApiKey={globalCheckerApiKey}
        setCheckerApiKey={(k) => {
            globalCheckerApiKey = k;
            localStorage.setItem('deepseek_checker_api_key', k);
            import('./services/deepseekService').then(m => m.setCheckerApiKey && m.setCheckerApiKey(k));
        }}
        makerTemperature={globalMakerTemperature}
        setMakerTemperature={(t) => {
            globalMakerTemperature = t;
            localStorage.setItem('deepseek_maker_temp', t.toString());
            import('./services/deepseekService').then(m => m.setMakerTemperature && m.setMakerTemperature(t));
        }}
        checkerTemperature={globalCheckerTemperature}
        setCheckerTemperature={(t) => {
            globalCheckerTemperature = t;
            localStorage.setItem('deepseek_checker_temp', t.toString());
            import('./services/deepseekService').then(m => m.setCheckerTemperature && m.setCheckerTemperature(t));
        }}
      />
  {/if}

  <!-- Overlay for mobile - Smooth transition -->
  <div
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ease-in-out {isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
      aria-hidden="true"
      onclick={() => isSidebarOpen = false}
  ></div>

  <div class="flex-grow flex flex-col relative">
    <Whiteboard
      {blocks}
      onAddBlock={handleAddBlock}
      onUpdateBlock={handleUpdateBlock}
      onRemoveBlock={handleRemoveBlock}
      onFocusBlock={handleFocusBlock}
      {presentingBlockId}
      onEnterPresentation={(id) => presentingBlockId = id}
      onExitPresentation={() => presentingBlockId = null}
      onNextSlide={() => {}}
      onPrevSlide={() => {}}
    />
  </div>
</div>
