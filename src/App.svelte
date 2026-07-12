<script lang="ts">
  import Sidebar from './components/Sidebar.svelte';
  import Whiteboard from './components/Whiteboard.svelte';
  import RadialMenu from './components/RadialMenu.svelte';
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

  // App State
  let blocks = $state<ExerciseBlockState[]>([]);
  let presentingBlockId = $state<number | null>(null);

  let nextId = $derived(blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) + 1 : 1);
  let maxZIndex = $derived(blocks.length > 0 ? Math.max(...blocks.map(b => b.zIndex)) : 10);

  // Handlers
  const handleAddBlock = (typeStr: string, x: number, y: number) => {
      const type = typeStr as ExerciseType;
      const newBlock: ExerciseBlockState = {
          id: nextId,
          exerciseType: type,
          x: x - 5000, // Offset due to whiteboard grid coordinate system (left/top -5000)
          y: y - 5000,
          width: 350,
          height: 250,
          zIndex: maxZIndex + 1,
          difficulty: globalDifficulty,
          tone: globalTone,
          theme: globalTheme || 'General English',
          focusVocabulary: [],
          inclusionRate: 0.5,
          focusGrammar: [],
          grammarInclusionRate: 0.5,
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
  <RadialMenu
      onToggleSettings={() => isGlobalSettingsOpen = true}
      onToggleSidebar={() => isSidebarOpen = !isSidebarOpen}
      onExportState={() => {}}
      difficulty={globalDifficulty}
      onCycleDifficulty={cycleDifficulty}
  />

  <Sidebar {isSidebarOpen} />

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
