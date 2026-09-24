import { ExerciseType, type ExerciseCategory, Difficulty, Tone } from './types';

export const DIFFICULTY_LEVELS = Object.values(Difficulty);
export const TONES = Object.values(Tone);

export const VALID_STUDENT_IDS = [
  'aarontutor',
  'andrea-always-aims-above-average-2026',
  'carlos-premium-english-2025',
  'david-saves-snacks-2025',
  'edwin-enjoys-every-english-exam-2026',
  'francisco-finds-five-funny-facts-2026',
  'jocelyn-explains-meeting-mania-2026',
  'kyrylo-keeps-kicking-knowledge-keys-2026',
  'leidy-2025-wallyworld',
  'maarten-makes-many-major-moves-2026',
  'matias-masters-many-magic-maps-2026',
  'nicolas-never-needs-new-notes-2026',
  'norbert-never-naps-near-noon-2026',
  'ruslan-rarely-runs-round-rooms-2026',
  'sergio-sees-seven-super-stars-2026',
  'test'
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.A1]: 'A1 (Beginner)',
  [Difficulty.A2]: 'A2 (Elementary)',
  [Difficulty.B1]: 'B1 (Intermediate)',
  [Difficulty.B2]: 'B2 (Upper Int.)',
  [Difficulty.C1]: 'C1 (Advanced)',
  [Difficulty.C2]: 'C2 (Mastery)',
  [Difficulty.Suffering]: 'Suffering (C2+)',
};

/**
 * One standard card size for every exercise type.
 *
 * The old per-type table ran from 600x750 up to 800x800, so most cards landed
 * at 700-800px tall against a canvas of roughly 800px: one card filled the
 * view and four would not sit side by side. Sizes are uniform now, and only
 * the picture card is an exception, because it has to hold an image.
 *
 * Height is also what `calculateExerciseAmount` reads, so a uniform height
 * gives a uniform question count -- which is the behaviour the "drag the edge
 * to get more questions" resize is meant to express.
 */
export const DEFAULT_BLOCK_DIMENSIONS = { width: 700, height: 600 };

export const EXERCISE_SIZE_OVERRIDES: Partial<Record<ExerciseType, { width: number; height: number }>> = {
    [ExerciseType.PicturePrompt]: { width: 760, height: 680 },
};

export const EXERCISE_PEDAGOGY: Record<ExerciseType, string> = {
  [ExerciseType.FITB]: 'PPP',
  [ExerciseType.MultipleChoice]: 'PPP',
  [ExerciseType.SentenceScramble]: 'PPP',
  [ExerciseType.Matching]: 'PPP',
  [ExerciseType.CollocationGapFill]: 'Lexis',
  [ExerciseType.WordFormation]: 'Lexis',
  [ExerciseType.PhrasalVerbGapFill]: 'Lexis',
  [ExerciseType.CollocationOddOneOut]: 'Lexis',
  [ExerciseType.ErrorCorrection]: 'C-R',
  [ExerciseType.RuleDiscovery]: 'C-R',
  [ExerciseType.SpotTheDifference]: 'C-R',
  [ExerciseType.DictoGloss]: 'C-R',
  [ExerciseType.ClozeParagraph]: 'Input',
  [ExerciseType.DialogueCompletion]: 'Input',
  [ExerciseType.Prediction]: 'Input',
  [ExerciseType.InformationTransfer]: 'Input',
  [ExerciseType.ReadingGist]: 'Skills',
  [ExerciseType.ReadingDetail]: 'Skills',
  [ExerciseType.FunctionalWriting]: 'Skills',
  [ExerciseType.ListeningSpecificInfo]: 'Skills',
  [ExerciseType.StorySequencing]: 'TBLT',
  [ExerciseType.PicturePrompt]: 'TBLT',
  [ExerciseType.MoralDilemma]: 'TBLT',
  [ExerciseType.ProblemSolvingScenario]: 'TBLT',
  [ExerciseType.RolePlayScenario]: 'Production',
  [ExerciseType.StorytellingFromPrompts]: 'Production',
  [ExerciseType.JustifyYourOpinion]: 'Production',
  [ExerciseType.PictureComparison]: 'Production',
  [ExerciseType.FunctionMatching]: 'Social English',
  [ExerciseType.RegisterSort]: 'Social English',
  [ExerciseType.PolitenessScenarios]: 'Social English',
  [ExerciseType.InferringMeaning]: 'Social English',
};

const CATEGORY_DEFINITIONS = {
    PPP: {
        name: 'PPP',
        description: "Presentation, Practice, Production: A structured approach focusing on accuracy.",
        types: [ExerciseType.FITB, ExerciseType.SentenceScramble, ExerciseType.Matching, ExerciseType.MultipleChoice],
    },
    Input: {
        name: 'Input',
        description: "Input-Based Tasks: Focus on understanding and processing language.",
        types: [ExerciseType.DialogueCompletion, ExerciseType.ClozeParagraph, ExerciseType.Prediction, ExerciseType.InformationTransfer],
    },
    Lexis: {
        name: 'Lexis',
        description: "Lexical Approach: Focuses on vocabulary and chunks of language.",
        types: [ExerciseType.CollocationGapFill, ExerciseType.WordFormation, ExerciseType.PhrasalVerbGapFill, ExerciseType.CollocationOddOneOut],
    },
    Skills: {
        name: 'Skills',
        description: "Language Skills: Exercises for reading, writing, and functional communication.",
        types: [ExerciseType.ReadingGist, ExerciseType.FunctionalWriting, ExerciseType.ListeningSpecificInfo, ExerciseType.ReadingDetail],
    },
    TBLT: {
        name: 'TBLT',
        description: "Task-Based Language Teaching: Focuses on completing a task using language.",
        types: [ExerciseType.PicturePrompt, ExerciseType.StorySequencing, ExerciseType.MoralDilemma, ExerciseType.ProblemSolvingScenario],
    },
    SocialEnglish: {
        name: 'Social English',
        description: "Using language appropriately in social contexts (Pragmatics).",
        types: [ExerciseType.FunctionMatching, ExerciseType.RegisterSort, ExerciseType.PolitenessScenarios, ExerciseType.InferringMeaning],
    },
    CR: {
        name: 'C-R',
        description: "Consciousness-Raising: Activities that draw attention to grammatical rules.",
        types: [ExerciseType.ErrorCorrection, ExerciseType.DictoGloss, ExerciseType.RuleDiscovery, ExerciseType.SpotTheDifference],
    },
    Production: {
        name: 'Production',
        description: "Production (Creative Output): Tasks that push learners to produce language.",
        types: [ExerciseType.RolePlayScenario, ExerciseType.PictureComparison, ExerciseType.StorytellingFromPrompts, ExerciseType.JustifyYourOpinion],
    },
};

export const EXERCISE_CATEGORIES = [
    CATEGORY_DEFINITIONS.PPP,
    CATEGORY_DEFINITIONS.Lexis,
    CATEGORY_DEFINITIONS.CR,
    CATEGORY_DEFINITIONS.Input,
    CATEGORY_DEFINITIONS.Skills,
    CATEGORY_DEFINITIONS.SocialEnglish,
    CATEGORY_DEFINITIONS.TBLT,
    CATEGORY_DEFINITIONS.Production,
];

type ColorScheme = {
  textOnDark: string;
  textOnLight: string;
  border: string;
  shadow: string;
  chip: { bg: string; text: string; border: string };
  bgOnDark: string;
};

/**
 * One scheme for every pedagogy group.
 *
 * This used to carry eight different colourways keyed by teaching approach.
 * Two problems: the class names it referenced (`primary-blue-400`,
 * `accent-green-300`, ...) were never real Tailwind colours and silently
 * rendered as nothing, and giving each group its own hue fought the single
 * accent for attention. Groups are now told apart by their label and position
 * in the sidebar, which is all the reader needs.
 */
const GROUP_SCHEME: ColorScheme = {
  textOnDark: 'text-ink-invert-muted',
  textOnLight: 'text-ink-muted',
  border: 'border-hairline',
  shadow: '',
  chip: { bg: 'bg-chrome-raised', text: 'text-ink-invert-muted', border: 'border-hairline' },
  bgOnDark: 'bg-chrome-raised',
};

export const PEDAGOGY_COLORS: Record<string, ColorScheme> = {
  'PPP': GROUP_SCHEME,
  'Input': GROUP_SCHEME,
  'Lexis': GROUP_SCHEME,
  'Skills': GROUP_SCHEME,
  'TBLT': GROUP_SCHEME,
  'Social English': GROUP_SCHEME,
  'C-R': GROUP_SCHEME,
  'Production': GROUP_SCHEME,
  'Default': GROUP_SCHEME,
};

/**
 * Natural rendered height of ONE skeleton, in px, measured from a real browser
 * with the card forced tall so flex-stretch cannot distort the figure. The
 * amount calculation divides by these, so if a template changes its markup,
 * re-measure -- otherwise the skeletons stop fitting the card.
 */
export const TEMPLATE_HEIGHTS: Partial<Record<ExerciseType, number>> = {
    [ExerciseType.SentenceScramble]: 230,
    [ExerciseType.Matching]: 100,
    [ExerciseType.FunctionMatching]: 100,
    [ExerciseType.StorySequencing]: 120,
    [ExerciseType.FITB]: 120,
    [ExerciseType.CollocationGapFill]: 120,
    [ExerciseType.PhrasalVerbGapFill]: 120,
    [ExerciseType.MultipleChoice]: 150,
    [ExerciseType.Prediction]: 150,
    [ExerciseType.RuleDiscovery]: 180,
    [ExerciseType.SpotTheDifference]: 180,
    [ExerciseType.PolitenessScenarios]: 150,
    [ExerciseType.InferringMeaning]: 180,
    [ExerciseType.CollocationOddOneOut]: 120,
    [ExerciseType.ClozeParagraph]: 140,
    [ExerciseType.DialogueCompletion]: 140,
    [ExerciseType.WordFormation]: 160,
    [ExerciseType.ErrorCorrection]: 150,
};
export const DEFAULT_TEMPLATE_HEIGHT = 150;

export const ESTIMATED_TIME: Record<ExerciseType, { base: number; perItem: number }> = {
    [ExerciseType.FITB]: { base: 1, perItem: 1 },
    [ExerciseType.MultipleChoice]: { base: 1, perItem: 1 },
    [ExerciseType.SentenceScramble]: { base: 2, perItem: 2 },
    [ExerciseType.ClozeParagraph]: { base: 2, perItem: 3 },
    [ExerciseType.Matching]: { base: 1, perItem: 1 },
    [ExerciseType.ErrorCorrection]: { base: 2, perItem: 2 },
    [ExerciseType.DialogueCompletion]: { base: 2, perItem: 2 },
    [ExerciseType.StorySequencing]: { base: 3, perItem: 2 },
    [ExerciseType.Prediction]: { base: 2, perItem: 2 },
    [ExerciseType.RuleDiscovery]: { base: 5, perItem: 3 },
    [ExerciseType.SpotTheDifference]: { base: 3, perItem: 3 },
    [ExerciseType.DictoGloss]: { base: 10, perItem: 0 },
    [ExerciseType.PicturePrompt]: { base: 5, perItem: 0 },
    [ExerciseType.MoralDilemma]: { base: 10, perItem: 0 },
    [ExerciseType.ProblemSolvingScenario]: { base: 10, perItem: 0 },
    [ExerciseType.CollocationGapFill]: { base: 1, perItem: 1 },
    [ExerciseType.WordFormation]: { base: 1, perItem: 1.5 },
    [ExerciseType.PhrasalVerbGapFill]: { base: 1, perItem: 1.5 },
    [ExerciseType.CollocationOddOneOut]: { base: 1, perItem: 1 },
    [ExerciseType.InformationTransfer]: { base: 10, perItem: 0 },
    [ExerciseType.ReadingGist]: { base: 5, perItem: 0 },
    [ExerciseType.ReadingDetail]: { base: 10, perItem: 0 },
    [ExerciseType.ListeningSpecificInfo]: { base: 8, perItem: 0 },
    [ExerciseType.FunctionalWriting]: { base: 15, perItem: 0 },
    [ExerciseType.RolePlayScenario]: { base: 10, perItem: 0 },
    [ExerciseType.StorytellingFromPrompts]: { base: 15, perItem: 0 },
    [ExerciseType.JustifyYourOpinion]: { base: 10, perItem: 0 },
    [ExerciseType.PictureComparison]: { base: 10, perItem: 0 },
    [ExerciseType.FunctionMatching]: { base: 1, perItem: 1 },
    [ExerciseType.RegisterSort]: { base: 5, perItem: 0 },
    [ExerciseType.PolitenessScenarios]: { base: 2, perItem: 2 },
    [ExerciseType.InferringMeaning]: { base: 3, perItem: 2 },
};

export const SINGLE_INSTANCE_TYPES = [
    ExerciseType.ReadingGist, ExerciseType.ReadingDetail, ExerciseType.FunctionalWriting,
    ExerciseType.DictoGloss, ExerciseType.InformationTransfer, ExerciseType.ListeningSpecificInfo,
    ExerciseType.ProblemSolvingScenario, ExerciseType.RolePlayScenario, ExerciseType.StorytellingFromPrompts,
    ExerciseType.JustifyYourOpinion, ExerciseType.RegisterSort, ExerciseType.PictureComparison,
    ExerciseType.MoralDilemma, ExerciseType.PicturePrompt
];

/**
 * How many skeleton exercises fit on a card of this size.
 *
 * Driven by AREA, not height alone: widening a card makes room for longer
 * sentences, and a short wide card should not claim the same capacity as a
 * tall narrow one. Chrome (header + padding) is subtracted before dividing,
 * so the skeletons always land inside the card rather than overflowing it.
 */
export const calculateExerciseAmount = (exerciseType: ExerciseType, height: number): number => {
    if (SINGLE_INSTANCE_TYPES.includes(exerciseType)) return 1;
    const headerAndPaddingHeight = 70;
    const availableHeight = height - headerAndPaddingHeight;
    const templateHeight = TEMPLATE_HEIGHTS[exerciseType] || DEFAULT_TEMPLATE_HEIGHT;
    if (templateHeight <= 0) return 1;
    return Math.max(1, Math.floor(availableHeight / templateHeight));
};


export const calculateExerciseDuration = (exerciseType: ExerciseType, height: number, manualAmount?: number): number => {
    const amount = manualAmount ?? calculateExerciseAmount(exerciseType, height);
    const timing = ESTIMATED_TIME[exerciseType] || { base: 5, perItem: 1 };
    return Math.ceil(timing.base + (timing.perItem * (amount - 1)));
};
