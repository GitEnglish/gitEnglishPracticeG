<script lang="ts">
  import { BookOpen, ChevronDown, Puzzle } from 'lucide-svelte';
  import { EXERCISE_CATEGORIES, EXERCISE_PEDAGOGY, PEDAGOGY_COLORS } from '../lib/constants';
  import { EXERCISE_INFO } from '../lib/exerciseInfo';
  import VocabularyFocus from './VocabularyFocus.svelte';
  import GrammarFocus from './GrammarFocus.svelte';
  import { ExerciseType } from '../lib/types';


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
      onClearBoard
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


  const EXERCISE_ICONS: Record<string, any> = {
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




  let openCategory: string | null = $state('PPP');
  let expandedInfo: string | null = $state(null);

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

      <div class="pb-8">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-3">Exercise Library</h3>

          {#each EXERCISE_CATEGORIES as category}
            {@const catColors = PEDAGOGY_COLORS[category.name] || PEDAGOGY_COLORS['Default']}
            <div class="mb-2 font-casual">
              <button
                  onclick={() => toggleCategory(category.name)}
                  class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 border {openCategory === category.name ? `${catColors.bgOnDark} ${catColors.border} shadow-lg` : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-slate-700'}"
              >
                  <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-7 h-7 rounded-md {openCategory === category.name ? `${catColors.bgOnDark} ${catColors.textOnDark} border ${catColors.border}` : 'bg-slate-700 text-slate-400 border border-slate-600'} transition-colors duration-200">
                         <BookOpen size={14} />
                      </div>
                      <span class="font-bold text-sm {catColors.textOnDark} transition-opacity duration-200 {openCategory === category.name ? 'opacity-100' : 'opacity-90'}">{category.name}</span>
                  </div>
                  <ChevronDown size={16} class="transition-transform duration-200 {openCategory === category.name ? `rotate-180 ${catColors.textOnDark}` : 'text-slate-500'}" />
              </button>

              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {openCategory === category.name ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}">
                  <div class="min-h-0 space-y-2 pl-2 border-l-2 {catColors.border.replace('border-', 'border-opacity-30 ')} ml-4">
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
                                      if (e.dataTransfer) {
                                          e.dataTransfer.setData('exercise-type', type);
                                          e.dataTransfer.effectAllowed = 'copy';

                                          const dragGhost = document.createElement('div');
                                          dragGhost.className = `p-3 rounded-lg border-2 ${colors.border} ${colors.bgOnDark} ${colors.textOnDark} font-bold shadow-2xl flex items-center gap-2`;
                                          dragGhost.style.position = 'absolute';
                                          dragGhost.style.top = '-1000px';
                                          dragGhost.innerHTML = `
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.867.276c-.32-.049-.648.059-.878.289l-.756.756a1.5 1.5 0 0 0-.44 1.06v4.313a2.4 2.4 0 0 1-2.4 2.4h-4.312a1.5 1.5 0 0 0-1.061.44l-.756.756c-.23.23-.558.338-.878.289a.98.98 0 0 1-.276-.867l1.611-1.611c.47-.47.706-1.087.706-1.704s-.235-1.233-.706-1.704l-1.568-1.568c-.23-.23-.558-.338-.289-.878l.756-.756a1.5 1.5 0 0 0 .44-1.06V6.985a2.4 2.4 0 0 1 2.4-2.4h4.312a1.5 1.5 0 0 0 1.061-.44l.756-.756c.23-.23.558-.338.878-.289a.98.98 0 0 1 .276.867L15.427 5.57c-.47.47-.706 1.087-.706 1.704s.235 1.233.706 1.704l1.568 1.568c.23.23.558.338.289.878l-.756.756a1.5 1.5 0 0 0-.44 1.06v.001z"/></svg>
                                            <span>${displayName}</span>
                                          `;
                                          document.body.appendChild(dragGhost);
                                          e.dataTransfer.setDragImage(dragGhost, 20, 20);
                                          setTimeout(() => { if (document.body.contains(dragGhost)) document.body.removeChild(dragGhost); }, 50);
                                      }
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
                                      <div class="flex items-center gap-2 flex-shrink-0">
                                          {@render difficultyIndicator(info.difficultyRating)}
                                          <button
                                              onclick={(e) => toggleInfo(e, type)}
                                              class="p-1 rounded-md bg-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-500 transition-colors z-20 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm flex items-center justify-center gap-1"
                                              title="About this exercise"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                              <span class="text-[10px] font-bold uppercase tracking-wider pr-1">Info</span>
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <!-- Accordion Info Panel (Not Draggable) -->
                              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {expandedInfo === type ? 'grid-rows-[1fr] opacity-100 mt-2 mb-3' : 'grid-rows-[0fr] opacity-0'}">
                                  <div class="min-h-0 bg-slate-900 border-l-2 border-{colors.border.replace('border-', '')} rounded-r-lg overflow-hidden shadow-2xl ml-2">
                                      <div class="p-3.5">
                                          <h4 class="font-bold text-blue-200 text-sm mb-1.5">{info.name}</h4>
                                          <div class="flex items-center gap-2 mb-2">
                                              <span class="text-[10px] px-1.5 py-0.5 rounded border {colors.border} {colors.textOnDark} bg-slate-800">{pedagogy}</span>
                                              <span class="text-xs text-slate-500">•</span>
                                              <span class="text-[10px] text-amber-300">{info.difficultyRating}</span>
                                          </div>
                                          <p class="text-slate-300 text-xs mb-3 leading-relaxed border-l-2 border-slate-700 pl-2">{info.description}</p>
                                          <div class="bg-black/30 rounded p-2.5 border border-slate-800">
                                              <p class="text-[10px] text-emerald-400 mb-1 font-semibold uppercase tracking-wider">Example</p>
                                              <p class="text-xs text-slate-200 font-serif italic leading-tight">"{info.example}"</p>
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

  <div class="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-600">
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
