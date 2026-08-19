const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.svelte', 'utf8');

const replacement = `
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
`;

content = content.replace(
    /import \{ EXERCISE_CATEGORIES \} from '\.\.\/lib\/constants';/g,
    replacement
);

const oldCard = `
                          <div role="button" tabindex="0" draggable="true" ondragstart={(e) => { e.dataTransfer?.setData('exercise-type', type); }} class="cursor-grab hover:bg-slate-700 p-2 text-sm rounded transition-colors text-slate-300 flex items-center justify-between border border-slate-700/50" onclick={() => onAddExercise && onAddExercise(type)}>
                            <div class="flex items-center gap-2">
                              <Puzzle size={12} class="opacity-50" />
                              {type}
                            </div>
                            <div class="flex gap-0.5 opacity-50">
                              <div class="w-1 h-3 bg-slate-400 rounded-full"></div>
                              <div class="w-1 h-3 bg-slate-400 rounded-full"></div>
                              <div class="w-1 h-3 bg-slate-400 rounded-full"></div>
                            </div>
                          </div>
`;

const newCard = `
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
                                       <DifficultyIndicatorIcon rating={info?.difficultyRating || 1} />
                                  </div>
                              </div>
                          </button>
`;

content = content.replace(oldCard, newCard);

// Fix the styling for the Accordion category button
content = content.replace(
    `class="mb-1 rounded-xl overflow-hidden transition-all duration-300 border {openCategory === category.name ? 'border-slate-700 bg-slate-800/50 shadow-inner' : 'border-transparent bg-slate-900/50 hover:bg-slate-800'}"`,
    `class="mb-2 font-casual"`
);

const oldCategoryButton = `
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
`;

const newCategoryButton = `
              {@const catColors = PEDAGOGY_COLORS[category.name] || PEDAGOGY_COLORS['Default']}
              <button
                  onclick={() => toggleCategory(category.name)}
                  class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 border {openCategory === category.name ? \`\${catColors.bgOnDark} \${catColors.border} shadow-lg\` : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-slate-700'}"
              >
                  <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-7 h-7 rounded-md {openCategory === category.name ? \`\${catColors.bgOnDark} \${catColors.textOnDark} border \${catColors.border}\` : 'bg-slate-700 text-slate-400 border border-slate-600'} transition-colors duration-200">
                         <BookOpen size={14} />
                      </div>
                      <span class="font-bold text-sm {catColors.textOnDark} transition-opacity duration-200 {openCategory === category.name ? 'opacity-100' : 'opacity-90'}">{category.name}</span>
                  </div>
                  <ChevronDown size={16} class="transition-transform duration-200 {openCategory === category.name ? \`rotate-180 \${catColors.textOnDark}\` : 'text-slate-500'}" />
              </button>
`;

content = content.replace(oldCategoryButton, newCategoryButton);

const oldCategoryPanel = `
              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {openCategory === category.name ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}">
                  <div class="min-h-0 space-y-2 pl-2 border-l-2 border-slate-700 border-opacity-30 ml-4 mb-2">
`;

const newCategoryPanel = `
              <div class="grid transition-all duration-300 ease-in-out overflow-hidden {openCategory === category.name ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}">
                  <div class="min-h-0 space-y-2 pl-2 border-l-2 {catColors.border.replace('border-', 'border-opacity-30 ')} ml-4">
`;

content = content.replace(oldCategoryPanel, newCategoryPanel);

// Remove the standalone v2.1.0 and add Project Actions at the bottom
const oldFooter = `
  <div class="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-600">
      v2.1.0 • Infinite Canvas
  </div>
`;

const newFooter = `
          <div class="mt-4 border-t border-slate-800 pt-6">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-3">Project Actions</h3>
                <div class="flex flex-col gap-2">
                    <button class="flex items-center gap-2 w-full p-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                        <DownloadIcon class="w-4 h-4 text-blue-400" /> Export Project
                    </button>
                    <label class="flex items-center gap-2 w-full p-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                        <UploadIcon class="w-4 h-4 text-green-400" /> Import Project
                        <input type="file" accept=".json" class="hidden" />
                    </label>
                    <button class="flex items-center gap-2 w-full p-2 text-sm font-medium text-slate-300 hover:bg-red-900/30 hover:text-red-400 rounded-lg transition-colors mt-2">
                        <TrashIcon class="w-4 h-4 text-red-400" /> Clear Board
                    </button>
                </div>
          </div>
`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/Sidebar.svelte', content);
