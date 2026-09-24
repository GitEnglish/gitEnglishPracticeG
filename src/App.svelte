<script lang="ts">
  import Sidebar from './components/Sidebar.svelte';
  import Whiteboard from './components/Whiteboard.svelte';
  import GlobalSettings from './components/GlobalSettings.svelte';
  import type { ExerciseBlockState } from './lib/types';
  import { Difficulty, Tone, ExerciseType } from './lib/types';
  import { initActivityLogger, getActivityLogger } from './services/ActivityLogger';
  import { EXERCISE_SIZE_OVERRIDES, DEFAULT_BLOCK_DIMENSIONS } from './lib/constants';

  $effect(() => {
    initActivityLogger('practice-genie', 'student_default');
    getActivityLogger()?.startSession();
  });

  let isSidebarOpen = $state(true);


  // Local Storage Keys
  const BLOCKS_KEY = 'practiceGenie-blocks';
  const DIFFICULTY_KEY = 'practiceGenie-difficulty';
  const TONE_KEY = 'practiceGenie-tone';
  const THEME_KEY = 'practiceGenie-theme';
  const PATHS_KEY = 'practiceGenie-paths';

  let initialBlocks = [];
  try {
      const savedBlocks = localStorage.getItem(BLOCKS_KEY);
      if (savedBlocks) {
          initialBlocks = JSON.parse(savedBlocks);
      }
  } catch (e) {
      console.error('Failed to parse blocks from localStorage', e);
      localStorage.removeItem(BLOCKS_KEY);
  }
  let blocks = $state<ExerciseBlockState[]>(initialBlocks);

  let initialPaths = [];
  try {
      const savedPaths = localStorage.getItem(PATHS_KEY);
      if (savedPaths) {
          initialPaths = JSON.parse(savedPaths);
      }
  } catch (e) {
      console.error('Failed to parse paths from localStorage', e);
      localStorage.removeItem(PATHS_KEY);
  }
  let paths = $state<any[]>(initialPaths);
  let isDrawingMode = $state(false);

  // Global Settings State
  let isGlobalSettingsOpen = $state(false);
  let globalDifficulty = $state<Difficulty>((localStorage.getItem(DIFFICULTY_KEY) as Difficulty) || Difficulty.B1);
  let globalTone = $state<Tone>((localStorage.getItem(TONE_KEY) as Tone) || Tone.Casual);
  let globalTheme = $state<string>(localStorage.getItem(THEME_KEY) || '');

  $effect(() => { localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks)); });
  $effect(() => { localStorage.setItem(DIFFICULTY_KEY, globalDifficulty); });
  $effect(() => { localStorage.setItem(TONE_KEY, globalTone); });
  $effect(() => { localStorage.setItem(THEME_KEY, globalTheme); });
  $effect(() => { localStorage.setItem(PATHS_KEY, JSON.stringify(paths)); });

  let globalMakerTemperature = $state<number>(parseFloat(localStorage.getItem('deepseek_maker_temp') || '0.7'));
  let globalCheckerTemperature = $state<number>(parseFloat(localStorage.getItem('deepseek_checker_temp') || '0.2'));


  // Focus Settings State
  let globalFocusVocabulary = $state<string[]>(JSON.parse(localStorage.getItem('practiceGenie-focusVocabulary') || '[]'));
  let globalInclusionRate = $state<number>(parseFloat(localStorage.getItem('practiceGenie-inclusionRate') || '50'));
  let globalFocusGrammar = $state<string[]>(JSON.parse(localStorage.getItem('practiceGenie-focusGrammar') || '[]'));
  let globalGrammarInclusionRate = $state<number>(parseFloat(localStorage.getItem('practiceGenie-grammarInclusionRate') || '50'));

  // App State

  let presentingBlockId = $state<number | null>(null);

  let nextId = $derived(blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) + 1 : 1);
  let maxZIndex = $derived(blocks.length > 0 ? Math.max(...blocks.map(b => b.zIndex)) : 10);


  const handleExportState = () => {
      const data = {
          version: '2.1.0',
          timestamp: new Date().toISOString(),
          state: {
              blocks,
              difficulty: globalDifficulty,
              tone: globalTone,
              theme: globalTheme,
              focusVocabulary: globalFocusVocabulary,
              inclusionRate: globalInclusionRate,
              focusGrammar: globalFocusGrammar,
              grammarInclusionRate: globalGrammarInclusionRate
          }
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `practice-genie-project-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleImportState = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const result = event.target?.result as string;
              const data = JSON.parse(result);
              if (data && data.state) {
                  const state = data.state;
                  if (state.blocks) blocks = state.blocks;
                  if (state.difficulty) globalDifficulty = state.difficulty;
                  if (state.tone) globalTone = state.tone;
                  if (state.theme) globalTheme = state.theme;
                  if (state.focusVocabulary) globalFocusVocabulary = state.focusVocabulary;
                  if (state.inclusionRate) globalInclusionRate = state.inclusionRate;
                  if (state.focusGrammar) globalFocusGrammar = state.focusGrammar;
                  if (state.grammarInclusionRate) globalGrammarInclusionRate = state.grammarInclusionRate;
                  alert("Project imported successfully!");
              } else {
                  throw new Error("Invalid project file format");
              }
          } catch (error) {
              console.error("Failed to parse project file", error);
              alert("Invalid project file.");
          }
      };
      reader.readAsText(file);
      target.value = '';
  };

  const handleClearBoard = () => {
      if (window.confirm("Are you sure you want to clear the entire whiteboard? This cannot be undone unless you have exported your project.")) {
          blocks = [];
      }
  };


  // Handlers
  const handleAddBlock = (typeStr: string, dropX?: number, dropY?: number) => {
      const type = typeStr as ExerciseType;
      let finalX = 0;
      let finalY = 0;

      const dims = EXERCISE_SIZE_OVERRIDES[type] || DEFAULT_BLOCK_DIMENSIONS;
      const width = dims.width;
      const height = dims.height;

      if (dropX !== undefined && dropY !== undefined) {
          finalX = Math.round(dropX - width/2);
          finalY = Math.round(dropY - height/2);
      } else {
          // Place a new card in free space that is actually visible.
          //
          // The old search spiralled out to 3000px from centre, so a few adds
          // put cards — and their header controls, including Remove — outside
          // the viewport: unreachable, which read as "this one won't delete".
          // Capping the radius instead just stacked cards on top of each
          // other, hiding their controls the same way.
          //
          // So: sweep candidate positions across the visible box only, take
          // the first that is free, and if the view is genuinely full, cascade
          // from the centre by a small offset that stays on screen.
          // The canvas does not start at screen x=0 — the sidebar covers the
          // left 320px. Using the whiteboard element's own rect keeps new cards
          // out from under the sidebar, where their header controls would be
          // unreachable.
          const canvasEl = document.getElementById('whiteboard-main');
          const canvasRect = canvasEl
              ? canvasEl.getBoundingClientRect()
              : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
          // The canvas element can be larger than the window (it is a pannable
          // surface), so intersect it with the viewport. What matters is the
          // part the user can actually see right now.
          //
          // Block coordinates map to the screen as:
          //   screen = state - 5000 + canvasRect.left
          // so the visible band, expressed in block coordinates, is the
          // viewport shifted by (5000 - canvasRect.left).
          const visLeft = Math.max(0, canvasRect.left);
          const visTop = Math.max(0, canvasRect.top);
          const visRight = Math.min(window.innerWidth, canvasRect.right);
          const visBottom = Math.min(window.innerHeight, canvasRect.bottom);
          const canvasW = Math.max(0, visRight - visLeft);
          const canvasH = Math.max(0, visBottom - visTop);
          const viewLeft = 5000 + visLeft - canvasRect.left;
          const viewTop = 5000 + visTop - canvasRect.top;
          const viewRight = 5000 + visRight - canvasRect.left;
          const viewBottom = 5000 + visBottom - canvasRect.top;

          const clampX = (v: number) => Math.min(Math.max(v, viewLeft), Math.max(viewLeft, viewRight - width));
          const clampY = (v: number) => Math.min(Math.max(v, viewTop), Math.max(viewTop, viewBottom - height));

          const isFree = (x: number, y: number) => !blocks.some((b) =>
              x < b.x + b.width && x + width > b.x && y < b.y + b.height && y + height > b.y
          );

          const step = 60;
          let positionFound = false;
          search:
          for (let y = viewTop; y <= viewBottom - height && !positionFound; y += step) {
              for (let x = viewLeft; x <= viewRight - width; x += step) {
                  if (isFree(x, y)) {
                      finalX = x;
                      finalY = y;
                      positionFound = true;
                      break search;
                  }
              }
          }

          if (!positionFound) {
              // View is full. Cascade down and to the LEFT, never right: a card
              // placed to the right covers the previous card's top-right
              // corner, which is exactly where its Remove control lives, and a
              // fully covered card can never be clicked or brought forward.
              // Each step leaves the previous card's right edge exposed.
              const n = blocks.length;
              const offset = 56 * (1 + (n % 4));
              finalX = clampX(viewLeft + (canvasW - width) / 2 - offset);
              finalY = clampY(viewTop + (canvasH - height) / 2 + offset);
          }
      }

      const newBlock: ExerciseBlockState = {
          id: nextId,
          exerciseType: type,
          x: finalX,
          y: finalY,
          width,
          height,
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

<div class="h-screen w-screen flex font-sans antialiased overflow-hidden bg-shell">

  <!-- The floating radial menu is gone. Its four functions live in the
       sidebar header: settings, difficulty cycle, export, drawing mode. -->
  



  <Sidebar
    {isSidebarOpen}
    onAddExercise={handleAddBlock}
    focusVocabulary={globalFocusVocabulary}
    onUpdateFocusVocabulary={(v: string[]) => { globalFocusVocabulary = v; localStorage.setItem('practiceGenie-focusVocabulary', JSON.stringify(v)); }}
    inclusionRate={globalInclusionRate}
    onUpdateInclusionRate={(r: number) => { globalInclusionRate = r; localStorage.setItem('practiceGenie-inclusionRate', r.toString()); }}
    focusGrammar={globalFocusGrammar}
    onUpdateFocusGrammar={(g: string[]) => { globalFocusGrammar = g; localStorage.setItem('practiceGenie-focusGrammar', JSON.stringify(g)); }}
    grammarInclusionRate={globalGrammarInclusionRate}
    onUpdateGrammarInclusionRate={(r: number) => { globalGrammarInclusionRate = r; localStorage.setItem('practiceGenie-grammarInclusionRate', r.toString()); }}
    onExportState={handleExportState}
    onImportState={handleImportState}
    onClearBoard={handleClearBoard}
    onToggleSettings={() => isGlobalSettingsOpen = true}
    difficulty={globalDifficulty}
    onCycleDifficulty={cycleDifficulty}
    isDrawingMode={isDrawingMode}
    onToggleDrawingMode={() => isDrawingMode = !isDrawingMode}
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
        makerTemperature={globalMakerTemperature}
        setMakerTemperature={(t) => {
            globalMakerTemperature = t;
            localStorage.setItem('deepseek_maker_temp', t.toString());

        }}
        checkerTemperature={globalCheckerTemperature}
        setCheckerTemperature={(t) => {
            globalCheckerTemperature = t;
            localStorage.setItem('deepseek_checker_temp', t.toString());

        }}
      />
  {/if}

  <!-- Overlay for mobile - Smooth transition -->
  <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ease-in-out {isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
      aria-hidden="true"
      onclick={() => isSidebarOpen = false}
  ></div>

  <div class="flex-grow flex flex-col relative canvas-grid">
    <Whiteboard
      {blocks}
      {paths}
      {isDrawingMode}
      onPathsChange={(newPaths) => paths = newPaths}
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
