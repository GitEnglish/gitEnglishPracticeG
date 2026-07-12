import OpenAI from 'openai';
import { ExerciseType, Difficulty, Tone } from '../lib/types';

// The application uses state injected from App.svelte
let localMakerApiKey = '';
let localCheckerApiKey = '';
let localMakerTemp = 0.7;
let localCheckerTemp = 0.2;

export const setMakerApiKey = (key: string) => { localMakerApiKey = key; };
export const setCheckerApiKey = (key: string) => { localCheckerApiKey = key; };
export const setMakerTemperature = (temp: number) => { localMakerTemp = temp; };
export const setCheckerTemperature = (temp: number) => { localCheckerTemp = temp; };

const getMakerKey = () => localMakerApiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('deepseek_maker_api_key') : '') || import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const getCheckerKey = () => localCheckerApiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('deepseek_checker_api_key') : '') || import.meta.env.VITE_DEEPSEEK_API_KEY || '';

const getMakerClient = () => {
    const key = getMakerKey();
    if (!key) throw new Error("API_KEY is not valid. Please check your environment configuration.");
    return new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: key,
        dangerouslyAllowBrowser: true
    });
};

const getCheckerClient = () => {
    const key = getCheckerKey();
    if (!key) return null;
    return new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: key,
        dangerouslyAllowBrowser: true
    });
};

/**
 * Constructs the prompt and schema for exercise generation based on input parameters.
 * Enforces CEFR guidelines and strict American English.
 */
const getPromptAndSchema = (
  exerciseType: ExerciseType,
  difficulty: Difficulty,
  tone: Tone,
  theme: string,
  amount: number,
  focusVocabulary: string[],
  inclusionRate: number,
  focusGrammar: string[],
  grammarInclusionRate: number
) => {
  // Detailed CEFR instructions to guide the model's output
  const cefrInstructions: Record<Difficulty, string> = {
      [Difficulty.A1]: "Target CEFR Level A1 (Breakthrough). Use very basic vocabulary (top 500 words), simple present/past simple tenses, short sentences, and concrete, familiar topics.",
      [Difficulty.A2]: "Target CEFR Level A2 (Waystage). Use high-frequency vocabulary (top 1000 words), basic connectors (and, but, because), simple past/future tenses, and everyday topics.",
      [Difficulty.B1]: "Target CEFR Level B1 (Threshold). Use standard language, mixed tenses (present perfect, continuous), some phrasal verbs, and ability to discuss travel, work, and interests.",
      [Difficulty.B2]: "Target CEFR Level B2 (Vantage). Use a broad vocabulary, complex sentence structures, relative clauses, modals for speculation, and abstract topics.",
      [Difficulty.C1]: "Target CEFR Level C1 (Effective Operational Proficiency). Use low-frequency vocabulary, idiomatic expressions, nuanced grammar (inversion, conditionals), and complex, structured texts.",
      [Difficulty.C2]: "Target CEFR Level C2 (Mastery). Use precise, sophisticated vocabulary, colloquialisms, and handle complex academic or professional topics with ease.",
      [Difficulty.Suffering]: "Target CEFR Level C2+ (Native/Polymath). Use archaic, rare, or highly specific academic vocabulary. Employ extremely complex, nested sentence structures, subtle cultural references, and uncompromising difficulty. Show no mercy."
  };

  let basePrompt = `You are an expert ESL curriculum creator and CEFR examiner. Generate English exercises for an ESL learner's self-study.

**CRITICAL INSTRUCTION: STRICT AMERICAN ENGLISH ONLY**
1. **Spelling**: Use 'color', 'center', 'organize', 'defense', 'program', 'traveling'. DO NOT use 'colour', 'centre', 'organise', 'defence', 'programme', 'travelling'.
2. **Vocabulary**: Use 'apartment', 'roommate', 'vacation', 'truck', 'soccer', 'elevator', 'cookie', 'math', 'pants', 'sidewalk'. DO NOT use 'flat', 'flatmate', 'holiday', 'lorry', 'football', 'lift', 'biscuit', 'maths', 'trousers', 'pavement'.
3. **Grammar**: Prefer 'I just ate' over 'I have just eaten' where appropriate for US usage.
4. **Context**: Avoid British cultural references (e.g., 'GCSEs', 'NHS', 'High Street'). Use US equivalents (e.g., 'GPA', 'Main Street').

Difficulty Level: ${difficulty}
Strict Proficiency Guideline: ${cefrInstructions[difficulty]}
Tone: ${tone}
Theme: ${theme || 'general topics'}
Exercise Type: ${exerciseType}
Use '[BLANK]' as the placeholder for any missing words. Ensure the word bank is shuffled.`;

  if (focusVocabulary && focusVocabulary.length > 0) {
    basePrompt += `\n\n**Vocabulary Focus Instructions:**\n- Target Vocabulary: [${focusVocabulary.join(', ')}]\n- Inclusion Rate: Approximately ${inclusionRate}% of the exercise content should incorporate words from the Target Vocabulary list.\n- For the remaining content, please use vocabulary that is thematically or semantically related to the target words or the overall theme.`;
  }
  if (focusGrammar && focusGrammar.length > 0) {
    basePrompt += `\n\n**Grammar Focus Instructions:**\n- Target Grammar: [${focusGrammar.join(', ')}]\n- Inclusion Rate: Approximately ${grammarInclusionRate}% of the exercises should be designed to practice or elicit the use of the Target Grammar points.\n- For the remaining content, ensure it is grammatically correct according to standard English rules for the specified difficulty level.`;
  }

  // Define schema for each exercise type to ensure structured JSON output
  // using standard JSON Schema syntax for DeepSeek/OpenAI structured outputs
  switch (exerciseType) {
    case ExerciseType.FITB:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a sentence with a single '[BLANK]', the correct answer, and a 'wordBank' array containing the correct answer plus 2-3 incorrect distractor words. Generate ${amount} items.`,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
              wordBank: { type: "array", items: { type: "string" } },
            },
            required: ["question", "answer", "wordBank"],
            additionalProperties: false
          }
        },
      };
    case ExerciseType.CollocationGapFill:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} The focus is on common collocations (word partnerships). For each item, provide a sentence with a '[BLANK]' where a key part of a common collocation is missing. Provide the 'collocation' itself (e.g., "make a decision"), the 'answer' word, and a 'wordBank' with the answer and 2-3 distractors. Generate ${amount} items.`,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
              wordBank: { type: "array", items: { type: "string" } },
              collocation: { type: "string" }
            },
            required: ["question", "answer", "wordBank", "collocation"],
            additionalProperties: false
          }
        },
      };
    case ExerciseType.PhrasalVerbGapFill:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} The focus is on common phrasal verbs. For each item, provide a sentence with a '[BLANK]' where the particle is missing. Provide the 'phrasalVerb' itself (e.g., "give up"), the 'answer' particle, and a 'wordBank' with the answer and 2-3 distractor particles. Generate ${amount} items.`,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
              wordBank: { type: "array", items: { type: "string" } },
              phrasalVerb: { type: "string" }
            },
            required: ["question", "answer", "wordBank", "phrasalVerb"],
            additionalProperties: false
          }
        },
      };
    case ExerciseType.WordFormation:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a sentence with a '[BLANK]', the 'rootWord' to be modified, and the correct 'answer' (the modified word). Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              question: { type: "string" },
              rootWord: { type: "string" },
              answer: { type: "string" },
            }, required: ["question", "rootWord", "answer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.CollocationOddOneOut:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide a 'keyword' and 4 'options' (words). 3 options must collocate with the keyword, and 1 must NOT (the 'correctAnswer'). Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              keyword: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["keyword", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.MultipleChoice:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a 'question' or incomplete sentence, an array of 4 'options', and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["question", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.SentenceScramble:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide the 'correct' sentence, and an array of 'scrambledWords' representing that sentence out of order. Do not include punctuation in the scrambled words unless it's an apostrophe. Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              scrambledWords: { type: "array", items: { type: "string" } },
              correct: { type: "string" },
            }, required: ["scrambledWords", "correct"], additionalProperties: false
          }
        },
      };
    case ExerciseType.ClozeParagraph:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide a short 'paragraph' (3-5 sentences) with ${amount} missing words replaced by '[BLANK]'. Provide an 'answers' array in order of appearance, and a 'wordBank' array with the answers plus some distractors.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              paragraph: { type: "string" },
              answers: { type: "array", items: { type: "string" } },
              wordBank: { type: "array", items: { type: "string" } },
            }, required: ["paragraph", "answers", "wordBank"], additionalProperties: false
          }
        },
      };
    case ExerciseType.Matching:
    case ExerciseType.FunctionMatching:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide an array of ${amount} 'prompts' (e.g., words, phrases, or situations) and a corresponding array of ${amount} 'answers'. They must map 1-to-1 by index.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              prompts: { type: "array", items: { type: "string" } },
              answers: { type: "array", items: { type: "string" } },
            }, required: ["prompts", "answers"], additionalProperties: false
          }
        },
      };
    case ExerciseType.ErrorCorrection:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide an 'incorrectSentence' containing one grammatical or lexical error typical for the learner's level, and the 'correctSentence'. Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              incorrectSentence: { type: "string" },
              correctSentence: { type: "string" },
            }, required: ["incorrectSentence", "correctSentence"], additionalProperties: false
          }
        },
      };
    case ExerciseType.DialogueCompletion:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide a short 'dialogue' between two people with ${amount} missing phrases replaced by '[BLANK]'. Provide the 'answers' in order, and a 'wordBank' with distractors.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              dialogue: { type: "string" },
              answers: { type: "array", items: { type: "string" } },
              wordBank: { type: "array", items: { type: "string" } },
            }, required: ["dialogue", "answers", "wordBank"], additionalProperties: false
          }
        },
      };
    // TBLT SCHEMAS
    case ExerciseType.StorySequencing:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a TBLT Story Sequencing exercise.')}\nProvide a 'title' and an array of 4-6 'storyParts' that tell a chronological story when ordered correctly. The output should be the correct order.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              storyParts: { type: "array", items: { type: "string" } },
            }, required: ["title", "storyParts"], additionalProperties: false
          }
        },
      };
    case ExerciseType.Prediction:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide a 'storyStart' (a short paragraph setting up a situation), 3 'options' for what logically happens next, and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              storyStart: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["storyStart", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    // C-R SCHEMAS
    case ExerciseType.RuleDiscovery:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide 3 example 'sentences' illustrating a specific grammar rule. Ask a multiple-choice 'question' about the rule they share, provide 3 'options', and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              sentences: { type: "array", items: { type: "string" } },
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["sentences", "question", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.SpotTheDifference:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} Provide 'sentenceA' and 'sentenceB' (almost identical but with a key grammatical difference affecting meaning). Ask a multiple-choice 'question' about the difference in meaning, provide 3 'options', and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              sentenceA: { type: "string" },
              sentenceB: { type: "string" },
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["sentenceA", "sentenceB", "question", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.DictoGloss:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a C-R Dicto-Gloss exercise.')}\nProvide a 'title' and a short, dense 'text' (3-5 sentences) focusing on a specific grammar point for the learner to reconstruct.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              text: { type: "string" },
            }, required: ["title", "text"], additionalProperties: false
          }
        },
      };
    case ExerciseType.MoralDilemma:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a TBLT Moral Dilemma exercise.')}\nProvide a 'title' and a thought-provoking 'dilemma' (a short paragraph describing a difficult ethical choice) suitable for discussion.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              dilemma: { type: "string" },
            }, required: ["title", "dilemma"], additionalProperties: false
          }
        },
      };
    // INPUT SCHEMAS
    case ExerciseType.ReadingGist:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a Reading for Gist (Skimming) exercise.')}\nProvide a 'title', a reading 'text' (150-250 words), a main-idea 'question', 4 'options', and the 'correctAnswer'.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              text: { type: "string" },
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["title", "text", "question", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.ReadingDetail:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a Reading for Detail (Scanning) exercise.')}\nProvide a 'title', a reading 'text' (150-250 words), and an array of 3-5 specific 'questions' with their short 'answer'.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              text: { type: "string" },
              questions: {
                type: "array", items: {
                  type: "object", properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                  }, required: ["question", "answer"], additionalProperties: false
                },
              },
            }, required: ["title", "text", "questions"], additionalProperties: false
          }
        },
      };
    case ExerciseType.FunctionalWriting:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a Functional Writing Prompt.')}\nProvide a 'title', a specific real-world 'scenario' (e.g., writing an email to a boss), and a specific 'task' instruction.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              scenario: { type: "string" },
              task: { type: "string" },
            }, required: ["title", "scenario", "task"], additionalProperties: false
          }
        },
      };
    case ExerciseType.InformationTransfer:
      return {
        prompt: `${basePrompt.replace('English exercises', 'an Information Transfer exercise.')}\nProvide a 'title', a 'text' containing specific factual details (like dates, names, prices), and an array of 4-6 'formFields' (keys) that the learner needs to extract from the text.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              text: { type: "string" },
              formFields: { type: "array", items: { type: "string" } },
            }, required: ["title", "text", "formFields"], additionalProperties: false
          }
        },
      };
    case ExerciseType.ListeningSpecificInfo:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a Listening for Specific Info exercise.')}\nProvide a 'title', an 'audioText' (the script to be read aloud), and an array of 3-5 specific 'questions' with their short 'answer'.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              audioText: { type: "string" },
              questions: {
                type: "array", items: {
                  type: "object", properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                  }, required: ["question", "answer"], additionalProperties: false
                },
              },
            }, required: ["title", "audioText", "questions"], additionalProperties: false
          }
        },
      };
    case ExerciseType.ProblemSolvingScenario:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a Problem-Solving Scenario for a TBLT self-study task. Create a clear, concise scenario where the learner is faced with a problem that requires a creative or logical solution.')}\nProvide a 'title' and the 'scenario' text.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              scenario: { type: "string" },
            }, required: ["title", "scenario"], additionalProperties: false
          }
        },
      };
    // PRODUCTION SCHEMAS
    case ExerciseType.RolePlayScenario:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single role-play scenario.')}\nProvide a 'title', the 'character' the learner should play, the 'situation' they are in, and a specific 'task' to complete.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              character: { type: "string" },
              situation: { type: "string" },
              task: { type: "string" },
            }, required: ["title", "character", "situation", "task"], additionalProperties: false
          }
        },
      };
    case ExerciseType.StorytellingFromPrompts:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single storytelling exercise.')}\nProvide a 'title', an array of 3-4 'prompts' (keywords or short phrases), and a 'task' instructing the learner to write a story connecting them.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              prompts: { type: "array", items: { type: "string" } },
              task: { type: "string" },
            }, required: ["title", "prompts", "task"], additionalProperties: false
          }
        },
      };
    case ExerciseType.JustifyYourOpinion:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single exercise for justifying an opinion.')}\nProvide a 'title', a debatable 'statement', and a 'task' asking the learner to agree or disagree and justify their position.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              statement: { type: "string" },
              task: { type: "string" },
            }, required: ["title", "statement", "task"], additionalProperties: false
          }
        },
      };
    case ExerciseType.PictureComparison:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single picture comparison exercise.')}\nProvide a 'title', a rich description for 'promptA' (Scene 1), and a rich description for 'promptB' (Scene 2). The scenes should be related but different. Also provide a 'task' asking the learner to compare and contrast the two scenes.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              promptA: { type: "string" },
              promptB: { type: "string" },
              task: { type: "string" },
            }, required: ["title", "promptA", "promptB", "task"], additionalProperties: false
          }
        },
      };
    // PRAGMATICS SCHEMAS
    case ExerciseType.RegisterSort:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single register sort exercise.')}\nProvide a 'title', an array of 'categories' (e.g., "Formal", "Informal", "Neutral"), an array of 6-8 'phrases' to be sorted, and a 'solution' array mapping each phrase to its correct category.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              title: { type: "string" },
              categories: { type: "array", items: { type: "string" } },
              phrases: { type: "array", items: { type: "string" } },
              solution: {
                type: "array", items: {
                  type: "object", properties: {
                    phrase: { type: "string" },
                    category: { type: "string" },
                  }, required: ["phrase", "category"], additionalProperties: false
                }
              }
            }, required: ["title", "categories", "phrases", "solution"], additionalProperties: false
          }
        },
      };
    case ExerciseType.PolitenessScenarios:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single politeness scenario as a multiple-choice question.')}\nProvide a 'scenario' describing a social situation, a 'question' asking for the most appropriate utterance, an array of 3 'options' with varying levels of politeness, and the 'correctAnswer'.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              scenario: { type: "string" },
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["scenario", "question", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.InferringMeaning:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single exercise for inferring meaning.')}\nProvide a short 'dialogue' where one speaker implies something without saying it directly. Then provide a 'question' asking what the speaker means, an array of 3 'options', and the 'correctAnswer' which is the correct inference.`,
        schema: {
          type: "array", items: {
            type: "object", properties: {
              dialogue: { type: "string" },
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correctAnswer: { type: "string" },
            }, required: ["dialogue", "question", "options", "correctAnswer"], additionalProperties: false
          }
        },
      };
    case ExerciseType.PicturePrompt:
      // Uses Pollinations.ai instead of AI generation
      return {
        prompt: "",
        schema: { type: "object", properties: {}, additionalProperties: false }
      };
    default:
      throw new Error("Unsupported exercise type: " + exerciseType);
  }
};

/**
 * Generates exercises using the DeepSeek API.
 */
export const generateExercises = async (
  exerciseType: ExerciseType,
  difficulty: Difficulty,
  tone: Tone,
  theme: string,
  amount: number,
  focusVocabulary: string[] = [],
  inclusionRate: number = 0,
  focusGrammar: string[] = [],
  grammarInclusionRate: number = 0
) => {
  try {
    if (exerciseType === ExerciseType.PicturePrompt) {
      const generatedExercises = [];
      for (let i = 0; i < amount; i++) {
        // Constructing Pollinations.ai URL locally
        const imagePrompt = `A compelling and slightly ambiguous scene about "${theme}". The style should be ${tone}. The image is for an ESL student at a ${difficulty} level to analyze. ` + (i > 0 ? 'Variation ' + (i + 1) + '.' : '');
        const visualPrompt = `${theme} ${tone} scene, educational illustration` + (i > 0 ? ' variation ' + (i + 1) : '');
        const encodedPrompt = encodeURIComponent(visualPrompt);
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=600&seed=${Math.floor(Math.random() * 10000)}&nologo=true`;

        generatedExercises.push({
          title: `Picture Prompt #${i + 1}`,
          imageUrl: imageUrl,
          prompt: imagePrompt
        });
      }
      return generatedExercises;
    }

    const ai = getMakerClient();

    // Get prompt and schema for text-based exercises
    const { prompt, schema } = getPromptAndSchema(exerciseType, difficulty, tone, theme, amount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate);

    // Call DeepSeek API for content generation using structured outputs
    const response = await ai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: localMakerTemp,
      response_format: {
          type: "json_schema",
          json_schema: {
              name: "exercise_generation",
              strict: true,
              schema: schema
          }
      }
    });

    const jsonText = response.choices[0].message.content || "";
    const parsed = JSON.parse(jsonText);

    // Ensure the output is always an array, even for single-item generations.
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Error generating exercises:", error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
        return { error: "API Key is not valid. Please check your environment configuration." };
    }
    return { error: "Failed to generate exercises. The model may be overloaded or the request is invalid. Please try again later." };
  }
};

/**
 * Checks a user's answer for an exercise using DeepSeek.
 */
export const checkAnswerWithAI = async (
  exerciseType: string,
  exerciseContext: any,
  userResponse: any
) => {
  const ai = getCheckerClient();
  if (!ai) {
      return "This is dummy feedback because the Checker API Key is missing. Great job!";
  }

  const prompt = `
    You are an expert ESL teacher's assistant.
    Task: Evaluate the student's answer for the following exercise.

    Exercise Type: ${exerciseType}
    Context (Exercise Data): ${JSON.stringify(exerciseContext)}
    Student Response: ${JSON.stringify(userResponse)}

    Provide specific, concise feedback.
    1. Correctness: Is the answer factually or contextually correct based on the provided text/scenario?
    2. Grammar & Language: Point out any major errors and suggest improvements.
    3. Rating: Give a quick emoji rating (e.g., 🌟🌟🌟).

    Keep the response under 100 words. Be encouraging but precise.
  `;

  try {
    const response = await ai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: "user", content: prompt }],
      temperature: localCheckerTemp
    });
    return response.choices[0].message.content || "Could not retrieve feedback at this time.";
  } catch (error) {
    console.error("Error checking answer:", error);
    return "Could not retrieve feedback at this time.";
  }
};
