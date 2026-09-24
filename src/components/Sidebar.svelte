<script lang="ts">
  import { BookOpen, ChevronDown, Puzzle, Settings as SettingsIcon, PenTool as PenToolIcon } from 'lucide-svelte';
  import { motion } from '@humanspeak/svelte-motion';
  import DifficultyMeter from '../lib/components/DifficultyMeter.svelte';
  import { EXERCISE_CATEGORIES, EXERCISE_PEDAGOGY, PEDAGOGY_COLORS } from '../lib/constants';
  import { EXERCISE_INFO } from '../lib/exerciseInfo';
  import VocabularyFocus from './VocabularyFocus.svelte';
  import GrammarFocus from './GrammarFocus.svelte';
  import { ExerciseType } from '../lib/types';

  import { getActivityLogger } from '../services/ActivityLogger';



  import PencilSquareIcon from './icons/PencilSquareIcon.svelte';
  import ListBulletIcon from './icons/ListBulletIcon.svelte';
  import PuzzlePieceIcon from './icons/PuzzlePieceIcon.svelte';
  import EyeIcon from './icons/EyeIcon.svelte';
  import UserGroupIcon from './icons/UserGroupIcon.svelte';
  import ArrowsRightLeftIcon from './icons/ArrowsRightLeftIcon.svelte';
  import PhotoIcon from './icons/PhotoIcon.svelte';
  import SparklesIcon from './icons/SparklesIcon.svelte';
  import ChatBubbleBottomCenterTextIcon from './icons/ChatBubbleBottomCenterTextIcon.svelte';
  import BookOpenIcon from './icons/BookOpenIcon.svelte';
  import SpeakerWaveIcon from './icons/SpeakerWaveIcon.svelte';
  import DifficultyIndicatorIcon from './icons/DifficultyIndicatorIcon.svelte';
  import UploadIcon from './icons/UploadIcon.svelte';
  import DownloadIcon from './icons/DownloadIcon.svelte';

  import TrashIcon from './icons/TrashIcon.svelte';

  const EXERCISE_ICONS: Record<ExerciseType, any> = {
    [ExerciseType.FITB]: PencilSquareIcon,
    [ExerciseType.CollocationGapFill]: PencilSquareIcon,
    [ExerciseType.PhrasalVerbGapFill]: PencilSquareIcon,
    [ExerciseType.WordFormation]: PencilSquareIcon,
    [ExerciseType.ClozeParagraph]: PencilSquareIcon,
    [ExerciseType.DialogueCompletion]: ChatBubbleBottomCenterTextIcon,
    [ExerciseType.ErrorCorrection]: PencilSquareIcon,
    [ExerciseType.FunctionalWriting]: PencilSquareIcon,
    [ExerciseType.DictoGloss]: PencilSquareIcon,

    [ExerciseType.MultipleChoice]: ListBulletIcon,
    [ExerciseType.Prediction]: ListBulletIcon,
    [ExerciseType.RuleDiscovery]: PuzzlePieceIcon,
    [ExerciseType.SpotTheDifference]: EyeIcon,
    [ExerciseType.PolitenessScenarios]: UserGroupIcon,
    [ExerciseType.InferringMeaning]: PuzzlePieceIcon,
    [ExerciseType.CollocationOddOneOut]: ListBulletIcon,
    [ExerciseType.RegisterSort]: ArrowsRightLeftIcon,

    [ExerciseType.Matching]: ArrowsRightLeftIcon,
    [ExerciseType.FunctionMatching]: ArrowsRightLeftIcon,
    [ExerciseType.SentenceScramble]: ArrowsRightLeftIcon,
    [ExerciseType.StorySequencing]: ArrowsRightLeftIcon,

    [ExerciseType.PicturePrompt]: PhotoIcon,
    [ExerciseType.PictureComparison]: PhotoIcon,

    [ExerciseType.MoralDilemma]: SparklesIcon,
    [ExerciseType.ProblemSolvingScenario]: SparklesIcon,
    [ExerciseType.RolePlayScenario]: ChatBubbleBottomCenterTextIcon,
    [ExerciseType.StorytellingFromPrompts]: SparklesIcon,
    [ExerciseType.JustifyYourOpinion]: SparklesIcon,

    [ExerciseType.ReadingGist]: BookOpenIcon,
    [ExerciseType.ReadingDetail]: EyeIcon,
    [ExerciseType.InformationTransfer]: PencilSquareIcon,

    [ExerciseType.ListeningSpecificInfo]: SpeakerWaveIcon,
  };

  // Settings state
  let {
      isSidebarOpen = true,
      onAddExercise,
      focusVocabulary = [],
      onUpdateFocusVocabulary,
      inclusionRate = 50,
      onUpdateInclusionRate,
      focusGrammar = [],
      onUpdateFocusGrammar,
      grammarInclusionRate = 50,
      onUpdateGrammarInclusionRate,
      onExportState,
      onImportState,
      onClearBoard,
      onToggleSettings,
      difficulty,
      onCycleDifficulty,
      isDrawingMode,
      onToggleDrawingMode
  } = $props<{
      isSidebarOpen?: boolean;
      onAddExercise?: (type: string) => void;
      focusVocabulary?: string[];
      onUpdateFocusVocabulary?: (vocab: string[]) => void;
      inclusionRate?: number;
      onUpdateInclusionRate?: (rate: number) => void;
      focusGrammar?: string[];
      onUpdateFocusGrammar?: (grammar: string[]) => void;
      grammarInclusionRate?: number;
      onUpdateGrammarInclusionRate?: (rate: number) => void;
      onExportState?: () => void;
      onImportState?: (e: Event) => void;
      onClearBoard?: () => void;
      onToggleSettings?: () => void;
      difficulty?: string;
      onCycleDifficulty?: () => void;
      isDrawingMode?: boolean;
      onToggleDrawingMode?: () => void;
  }>();

  let isVocabOpen = $state(false);
  let vocabInput = $state('');

  let isGrammarOpen = $state(false);
  let grammarInput = $state('');

  const handleAddVocab = () => {
        const newVocab = vocabInput.trim();
        if (newVocab && !focusVocabulary.includes(newVocab.toLowerCase())) {
            onUpdateFocusVocabulary && onUpdateFocusVocabulary([...focusVocabulary, newVocab.toLowerCase()]);
            vocabInput = '';
        }
  };

  const handleRemoveVocab = (vocabToRemove: string) => {
        onUpdateFocusVocabulary && onUpdateFocusVocabulary(focusVocabulary.filter((v: string) => v !== vocabToRemove));
  };

  const handleAddGrammar = () => {
        const newGrammar = grammarInput.trim();
        if (newGrammar && !focusGrammar.includes(newGrammar.toLowerCase())) {
            onUpdateFocusGrammar && onUpdateFocusGrammar([...focusGrammar, newGrammar.toLowerCase()]);
            grammarInput = '';
        }
  };

  const handleRemoveGrammar = (grammarToRemove: string) => {
        onUpdateFocusGrammar && onUpdateFocusGrammar(focusGrammar.filter((g: string) => g !== grammarToRemove));
  };


  let openCategory: string | null = $state('PPP');
  let expandedInfo: string | null = $state(null);

  // Timestamp of the last svelte-motion drag end on an exercise card.
  // Releasing a drag fires a synthetic browser `click` on the card
  // (pointerdown + pointerup happened there), which would trigger the
  // card's `onclick` AND the drop handler — double-adding the block.
  // Clicks within this window after a drag end are swallowed.
  let lastDragEndTime = 0;
  const CLICK_AFTER_DRAG_GUARD_MS = 150;

  const suppressClickAfterDrag = () => {
      return Date.now() - lastDragEndTime < CLICK_AFTER_DRAG_GUARD_MS;
  };

  const toggleInfo = (e: Event, type: string) => {
      e.stopPropagation();
      expandedInfo = expandedInfo === type ? null : type;
  };
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
  <DifficultyMeter {level} title={`${rating} Difficulty`} />
{/snippet}

<motion.aside
  initial={false}
  animate={{ x: isSidebarOpen ? 0 : "-100%" }}
  transition={{ type: "spring", stiffness: 400, damping: 40 }}
  class="w-80 flex-shrink-0 bg-chrome border-r border-hairline/50 text-fossil-300 flex flex-col justify-between relative z-30 panel-frosted will-change-transform h-screen lg:static lg:translate-x-0 font-ui"
>

  <div class="flex flex-col h-full overflow-hidden">

    <div class="px-6 pt-7 pb-6 border-b border-hairline/60">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-citrine-300 via-accent to-citrine-700 p-1.5 flex items-center justify-center shadow-[0_0_12px_rgba(229,149,0,0.5)] border border-citrine-200/40 flex-shrink-0">
          <svg class="w-full h-full text-ink" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9.5"></circle>
            <polygon fill="currentColor" points="12 4 14.5 10.5 20 12 14.5 13.5 12 20 9.5 13.5 4 12 9.5 10.5 12 4"></polygon>
          </svg>
        </div>
        <div class="min-w-0">
          <div class="flex items-center">
            <span class="text-fossil-50 text-lg font-semibold tracking-tight antialiased">
              gitEnglish<sup class="text-[9px] font-semibold tracking-widest text-accent ml-0.5">™</sup>
            </span>
          </div>
        </div>
        <!-- These four were the radial menu. The orb is gone; the functions stay. -->
        <div class="ml-auto flex items-center gap-1.5">
          <button onclick={onToggleSettings} class="p-2 rounded-lg text-fossil-400 hover:text-fossil-50 hover:bg-fossil-50/10 transition-all" title="Global settings" aria-label="Global settings">
            <SettingsIcon class="w-4 h-4" />
          </button>
          <button onclick={onCycleDifficulty} class="px-2 py-1 rounded-lg border border-hairline text-sm font-semibold tracking-widest text-accent hover:bg-fossil-50/10 transition-all whitespace-nowrap" title="Cycle difficulty (CEFR)" aria-label="Cycle difficulty">
            {difficulty ?? 'B1'}
          </button>
          <button onclick={onToggleDrawingMode} class="p-2 rounded-lg transition-all {isDrawingMode ? 'text-accent bg-accent/15' : 'text-fossil-400 hover:text-fossil-50 hover:bg-fossil-50/10'}" title="Drawing mode" aria-pressed={isDrawingMode ?? false} aria-label="Toggle drawing mode">
            <PenToolIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6">

      <div data-purpose="sidebar-group">
          <button
            onclick={() => isConfigOpen = !isConfigOpen}
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold tracking-[0.1em] uppercase text-fossil-400 hover:text-fossil-50 transition-colors"
          >
              <span class="flex items-center space-x-2">
                <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
                <span>CONFIGURATION</span>
              </span>
              <ChevronDown class="w-3.5 h-3.5 text-fossil-400 transform transition-transform duration-200 {isConfigOpen ? 'rotate-180' : ''}" />
          </button>

          <div class="space-y-2 overflow-hidden transition-all duration-300 {isConfigOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}">
              <VocabularyFocus
                  {focusVocabulary}
                  onUpdateFocusVocabulary={onUpdateFocusVocabulary}
                  {inclusionRate}
                  onUpdateInclusionRate={onUpdateInclusionRate}
              />

              <GrammarFocus
                  {focusGrammar}
                  onUpdateFocusGrammar={onUpdateFocusGrammar}
                  {grammarInclusionRate}
                  onUpdateGrammarInclusionRate={onUpdateGrammarInclusionRate}
              />
          </div>
      </div>

      <div class="pb-8 space-y-3" data-purpose="exercise-library-group">
          <div class="px-3 text-xs font-bold tracking-[0.1em] uppercase text-fossil-400">Exercise Library</div>

          {#each EXERCISE_CATEGORIES as category}
            {@const catColors = PEDAGOGY_COLORS[category.name] || PEDAGOGY_COLORS['Default']}
            <div class="rounded-xl bg-chrome-raised/70 border border-hairline/80 overflow-hidden p-1.5 transition-all">
              <button
                  onclick={() => toggleCategory(category.name)}
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg {openCategory === category.name ? 'bg-chrome-raised' : 'bg-chrome-raised/50 hover:bg-chrome-raised'} transition-all text-left group"
              >
                  <div class="flex items-center space-x-2.5">
                      <BookOpen class="w-4 h-4 {catColors.textOnDark} transition-colors" />
                      <span class="text-sm font-medium text-fossil-50 tracking-[-0.01em]">{category.name}</span>
                  </div>
                  <ChevronDown class="w-3.5 h-3.5 text-fossil-400 transition-transform duration-200 {openCategory === category.name ? 'rotate-180' : ''}" />
              </button>

              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {openCategory === category.name ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}">
                  <div class="min-h-0 space-y-1 px-1">
                      {#each category.types as type}
                          {@const pedagogy = EXERCISE_PEDAGOGY[type] || 'Default'}
                          {@const colors = PEDAGOGY_COLORS[pedagogy]}
                          {@const info = EXERCISE_INFO[type]}
                          {@const displayName = type.split('(')[0].trim()}
                          {@const SpecificIcon = EXERCISE_ICONS[type] || PencilSquareIcon}
                          <div class="relative group">
                                <motion.div
                                    drag={true}
                                    dragSnapToOrigin={true}
                                    dragElastic={0.2}
                                    role="button"
                                    tabindex="0"
                                    onclick={() => {
                                        // A drag release synthesises a click on this card;
                                        // only treat it as "add exercise" when it's a real click.
                                        if (suppressClickAfterDrag()) return;
                                        onAddExercise && onAddExercise(type);
                                    }}
                                    onkeydown={(e: KeyboardEvent) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onAddExercise && onAddExercise(type);
                                        }
                                    }}
                                    onDragStart={() => {
                                        window.dispatchEvent(new CustomEvent('sidebar-drag-start', { detail: { type } }));
                                    }}
                                    onDragEnd={(e: PointerEvent, info: any) => {
                                        lastDragEndTime = Date.now();
                                        window.dispatchEvent(new CustomEvent('sidebar-drag-end'));

                                        const sidebarElement = document.querySelector('aside');
                                        if (sidebarElement) {
                                            const sidebarRect = sidebarElement.getBoundingClientRect();
                                            if (e.clientX > sidebarRect.right) {
                                                window.dispatchEvent(new CustomEvent('sidebar-item-dropped', {
                                                    detail: {
                                                        type,
                                                        clientX: e.clientX,
                                                        clientY: e.clientY
                                                    }
                                                }));
                                            }
                                        }
                                    }}
                                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-fossil-50/[0.04] cursor-grab active:cursor-grabbing transition-all z-50 relative group"
                                  aria-label={`Add ${type} exercise`}
                              >
                                  <div class="flex items-center space-x-2.5">
                                      <SpecificIcon class="w-3.5 h-3.5 text-fossil-400 group-hover:{colors.textOnDark.replace('text-', 'text-')} transition-colors" />
                                      <span class="text-xs font-normal text-fossil-300 group-hover:text-fossil-50 transition-colors tracking-tight">{displayName}</span>
                                  </div>
                                  <div class="flex items-center space-x-2">
                                      {@render difficultyIndicator(info.difficultyRating)}
                                      <button
                                          onclick={(e) => toggleInfo(e, type)}
                                          class="text-sm font-sans font-medium tracking-wide text-fossil-400 border border-fossil-50/10 rounded px-1.5 py-0.5 hover:text-fossil-50 hover:border-fossil-50/30 transition-colors z-20"
                                          title="About this exercise"
                                      >
                                          {pedagogy}
                                      </button>
                                  </div>
                              </motion.div>

                              <!-- Tooltip -->
                              <div class="absolute left-full top-0 ml-4 w-72
                                            p-4 rounded-xl bg-fossil-900 border border-fossil-700 shadow-2xl
                                            opacity-0 group-hover:opacity-100 invisible group-hover:visible
                                            transition-opacity duration-150 z-50 pointer-events-none">
                                  <div class="absolute top-4 -left-2 w-4 h-4 bg-fossil-900 border-b border-l border-fossil-700 transform rotate-45"></div>
                                  <h4 class="font-semibold {colors.textOnDark} text-base mb-1.5">{info.name.endsWith(`(${pedagogy})`) ? info.name.split('(')[0].trim() : info.name}</h4>
                                  <div class="flex items-center gap-2 mb-3">
                                      <span class="text-xs px-2 py-0.5 rounded-full border {colors.border} {colors.bgOnDark} {colors.textOnDark} bg-opacity-50">{pedagogy}</span>
                                      <span class="text-xs text-fossil-500">•</span>
                                      <span class="text-xs text-fossil-400">{info.difficultyRating}</span>
                                  </div>
                                  <p class="text-fossil-300 text-sm mb-4 leading-relaxed">{info.description}</p>
                                  <div class="bg-fossil-950/50 rounded-lg p-3 border border-fossil-800 mb-2">
                                      <p class="text-xs text-fossil-400 mb-1 font-semibold uppercase tracking-wider">Example</p>
                                      <p class="text-xs text-fossil-300 font-mono italic">"{info.example}"</p>
                                  </div>
                                  <p class="text-sm text-fossil-300 text-center uppercase tracking-widest pt-1">Click to add • Drag to place</p>
                              </div>

                              <!-- Accordion Info Panel (Not Draggable) -->
                              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {expandedInfo === type ? 'grid-rows-[1fr] opacity-100 mt-2 mb-3' : 'grid-rows-[0fr] opacity-0'}">
                                  <div class="min-h-0 bg-fossil-900 border-l-2 border-{colors.border.replace('border-', '')} rounded-r-lg overflow-hidden shadow-2xl ml-2">
                                      <div class="p-3.5">
                                          <h4 class="font-semibold text-accent text-sm mb-1.5">{info.name.endsWith(`(${pedagogy})`) ? info.name.split('(')[0].trim() : info.name}</h4>
                                          <div class="flex items-center gap-2 mb-2">
                                              <span class="text-sm px-1.5 py-0.5 rounded border {colors.border} {colors.textOnDark} bg-fossil-800">{pedagogy}</span>
                                              <span class="text-xs text-fossil-500">•</span>
                                              <span class="text-sm text-citrine-300">{info.difficultyRating}</span>
                                          </div>
                                          <p class="text-fossil-300 text-xs mb-3 leading-relaxed border-l-2 border-fossil-700 pl-2">{info.description}</p>
                                          <div class="bg-black/30 rounded p-2.5 border border-fossil-800">
                                              <p class="text-sm text-malachite-400 mb-1 font-semibold uppercase tracking-wider">Example</p>
                                              <p class="text-xs text-fossil-200 font-serif italic leading-tight">"{info.example}"</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      {/each}
                  </div>
              </div>
            </div>
          {/each}
      </div>
  </div>


  <div class="px-3 py-2.5 border-t border-hairline/70 bg-black/60" data-purpose="project-actions">
        <div class="flex items-center justify-center gap-1.5">
            <button onclick={onExportState} class="p-2 rounded-lg text-fossil-400 hover:text-fossil-50 hover:bg-fossil-50/10 transition-all" title="Export project (download a .json backup)" aria-label="Export project">
                <DownloadIcon class="w-4 h-4" />
            </button>
            <label class="p-2 rounded-lg text-fossil-400 hover:text-malachite-300 hover:bg-fossil-50/10 transition-all cursor-pointer" title="Import project (load a .json backup)" aria-label="Import project">
                <UploadIcon class="w-4 h-4" />
                <input type="file" accept=".json" onchange={onImportState} class="hidden" />
            </label>
            <button onclick={onClearBoard} class="p-2 rounded-lg text-fossil-400 hover:text-cinnabar-400 hover:bg-cinnabar-500/10 transition-all" title="Clear board" aria-label="Clear all exercises from board">
                <TrashIcon class="w-4 h-4" />
            </button>
            <span class="mx-1 h-5 w-px bg-hairline" aria-hidden="true"></span>
            <button onclick={() => getActivityLogger()?.downloadLog()} class="p-2 rounded-lg text-fossil-600 hover:text-fossil-300 hover:bg-fossil-50/10 transition-all" title="Download telemetry log" aria-label="Download session activity log">
                <DownloadIcon class="w-4 h-4" />
            </button>
            <div class="ml-1 text-sm font-mono text-fossil-400 select-none">v2.1.0</div>
        </div>
  </div>
  </div>
</motion.aside>


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
  .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
      background: #475569;
  }

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
