<script lang="ts">
  import { BookOpen, ChevronDown, Puzzle } from 'lucide-svelte';

  import { EXERCISE_CATEGORIES, PEDAGOGY_COLORS, EXERCISE_PEDAGOGY } from '../lib/constants';
  import { EXERCISE_INFO } from '../lib/exerciseInfo';
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
        onUpdateFocusVocabulary && onUpdateFocusVocabulary(focusVocabulary.filter(v => v !== vocabToRemove));
  };

  const handleAddGrammar = () => {
        const newGrammar = grammarInput.trim();
        if (newGrammar && !focusGrammar.includes(newGrammar.toLowerCase())) {
            onUpdateFocusGrammar && onUpdateFocusGrammar([...focusGrammar, newGrammar.toLowerCase()]);
            grammarInput = '';
        }
  };

  const handleRemoveGrammar = (grammarToRemove: string) => {
        onUpdateFocusGrammar && onUpdateFocusGrammar(focusGrammar.filter(g => g !== grammarToRemove));
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
  let isConfigOpen = $state(false);

  const toggleCategory = (name: string) => {
      openCategory = openCategory === name ? null : name;
  };


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


              <div class="space-y-2 overflow-hidden transition-all duration-300 {isConfigOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}">
                <!-- Vocabulary Focus -->
                <div class="mb-4 bg-slate-900/50 rounded-xl ring-1 ring-slate-700 overflow-hidden font-casual">
                    <button onclick={() => isVocabOpen = !isVocabOpen} class="w-full flex justify-between items-center p-4 text-left bg-slate-800/50 hover:bg-slate-800 transition-colors">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                            <span class="font-semibold text-slate-200 text-sm">Vocabulary Focus</span>
                        </div>
                        <ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200 {isVocabOpen ? 'rotate-180' : ''}" />
                    </button>
                    {#if isVocabOpen}
                        <div class="p-3 border-t border-slate-700 space-y-4 bg-slate-900/30">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Words</label>
                                <div class="flex space-x-2">
                                    <input
                                        type="text"
                                        bind:value={vocabInput}
                                        onkeydown={(e) => e.key === 'Enter' && handleAddVocab()}
                                        placeholder="Add vocabulary..."
                                        class="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
                                    />
                                    <button
                                        onclick={handleAddVocab}
                                        class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {#if focusVocabulary.length > 0}
                                <div class="flex flex-wrap gap-2 pt-1">
                                    {#each focusVocabulary as word}
                                        <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                            {word}
                                            <button
                                                onclick={() => handleRemoveVocab(word)}
                                                class="ml-1.5 text-yellow-400/60 hover:text-yellow-400 focus:outline-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    {/each}
                                </div>
                            {/if}

                            <div class="pt-2 border-t border-slate-800">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inclusion Rate</label>
                                    <span class="text-xs font-medium text-slate-400">{inclusionRate}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={inclusionRate}
                                    oninput={(e) => onUpdateInclusionRate && onUpdateInclusionRate(Number(e.currentTarget.value))}
                                    class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer range-thumb-yellow"
                                />
                                <div class="flex justify-between mt-1 px-1">
                                    <span class="text-[9px] text-slate-500 font-medium">Rare</span>
                                    <span class="text-[9px] text-slate-500 font-medium">Frequent</span>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Grammar Focus -->
                <div class="mb-4 bg-slate-900/50 rounded-xl ring-1 ring-slate-700 overflow-hidden font-casual">
                    <button onclick={() => isGrammarOpen = !isGrammarOpen} class="w-full flex justify-between items-center p-4 text-left bg-slate-800/50 hover:bg-slate-800 transition-colors">
                        <div class="flex items-center">
                            <Puzzle class="w-5 h-5 mr-2 text-emerald-400" />
                            <span class="font-semibold text-slate-200 text-sm">Grammar Focus</span>
                        </div>
                        <ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200 {isGrammarOpen ? 'rotate-180' : ''}" />
                    </button>
                    {#if isGrammarOpen}
                        <div class="p-3 border-t border-slate-700 space-y-4 bg-slate-900/30">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Structures</label>
                                <div class="flex space-x-2">
                                    <input
                                        type="text"
                                        bind:value={grammarInput}
                                        onkeydown={(e) => e.key === 'Enter' && handleAddGrammar()}
                                        placeholder="Add grammar structure..."
                                        class="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                                    />
                                    <button
                                        onclick={handleAddGrammar}
                                        class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {#if focusGrammar.length > 0}
                                <div class="flex flex-wrap gap-2 pt-1">
                                    {#each focusGrammar as structure}
                                        <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {structure}
                                            <button
                                                onclick={() => handleRemoveGrammar(structure)}
                                                class="ml-1.5 text-emerald-400/60 hover:text-emerald-400 focus:outline-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    {/each}
                                </div>
                            {/if}

                            <div class="pt-2 border-t border-slate-800">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inclusion Rate</label>
                                    <span class="text-xs font-medium text-slate-400">{grammarInclusionRate}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={grammarInclusionRate}
                                    oninput={(e) => onUpdateGrammarInclusionRate && onUpdateGrammarInclusionRate(Number(e.currentTarget.value))}
                                    class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer range-thumb-emerald"
                                />
                                <div class="flex justify-between mt-1 px-1">
                                    <span class="text-[9px] text-slate-500 font-medium">Rare</span>
                                    <span class="text-[9px] text-slate-500 font-medium">Frequent</span>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
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
                          {@const colors = PEDAGOGY_COLORS[pedagogy] || PEDAGOGY_COLORS['Default']}
                          {@const info = EXERCISE_INFO[type]}
                          {@const displayName = type.split('(')[0].trim()}
                          {@const SpecificIcon = EXERCISE_ICONS[type] || PencilSquareIcon}
                          <button
                              draggable="true"
                              ondragstart={(e) => { e.dataTransfer?.setData('exercise-type', type); }}
                              onclick={() => onAddExercise && onAddExercise(type)}
                              class="w-full text-left p-2.5 rounded-md cursor-pointer active:scale-95 transition-all duration-200 border {colors.border} {colors.bgOnDark} hover:bg-opacity-100 hover:translate-x-1 hover:shadow-lg group-hover:ring-1 ring-opacity-50 ring-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:{colors.border.replace('border-', 'ring-')}"
                              aria-label="Add {type} exercise"
                          >
                              <div class="flex justify-between items-center">
                                  <div class="flex items-center gap-3 min-w-0">
                                      <SpecificIcon class="w-4 h-4 {colors.textOnDark} opacity-70" />
                                      <div class="min-w-0">
                                          <h3 class="text-xs font-medium truncate {colors.textOnDark}">{displayName}</h3>
                                      </div>
                                  </div>
                                  <div class="flex-shrink-0">
                                       <DifficultyIndicatorIcon rating={info?.difficultyRating || 'A1'} />
                                  </div>
                              </div>
                          </button>
                      {/each}
                  </div>
              </div>
            </div>
          {/each}
      </div>
  </div>

          <div class="mt-4 border-t border-slate-800 pt-6">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-3">Project Actions</h3>
                <div class="flex flex-col gap-2">
                    <button onclick={onExportState} class="flex items-center gap-2 w-full p-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                        <DownloadIcon class="w-4 h-4 text-blue-400" /> Export Project
                    </button>
                    <label class="flex items-center gap-2 w-full p-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                        <UploadIcon class="w-4 h-4 text-green-400" /> Import Project
                        <input type="file" accept=".json" onchange={onImportState} class="hidden" />
                    </label>
                    <button onclick={onClearBoard} class="flex items-center gap-2 w-full p-2 text-sm font-medium text-slate-300 hover:bg-red-900/30 hover:text-red-400 rounded-lg transition-colors mt-2">
                        <TrashIcon class="w-4 h-4 text-red-400" /> Clear Board
                    </button>
                </div>
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
