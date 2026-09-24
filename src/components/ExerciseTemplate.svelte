<script lang="ts">
  import { ExerciseType } from '../lib/types';

  let { type, index } = $props<{ type: ExerciseType; index: number }>();
</script>

{#snippet templateBox(className: string, children?: any)}
    <div class="bg-fossil-100 rounded-xl flex items-center justify-center border border-fossil-200 {className}">
        {#if children}
            {@render children()}
        {/if}
    </div>
{/snippet}

{#snippet templateChip(className: string = '')}
    <div class="bg-fossil-200 h-6 w-16 rounded-full {className}"></div>
{/snippet}

{#snippet templateTextLine(width: string = 'w-full')}
    <div class="bg-fossil-200 h-3 rounded-full {width}"></div>
{/snippet}

<div class="flex items-start space-x-4 p-4 border-b border-fossil-100 last:border-b-0">
    <span class="text-sm font-bold text-fossil-300 mt-1 select-none">{index + 1}.</span>
    <div class="flex-grow">
        {#if type === ExerciseType.FITB || type === ExerciseType.CollocationGapFill || type === ExerciseType.PhrasalVerbGapFill}
            <div class="space-y-4">
                {@render templateTextLine("w-2/3")}
                <div class="flex items-center space-x-3">
                    {@render templateTextLine("w-1/3")}
                    {@render templateBox("w-28 h-8 border-dashed border-2 border-fossil-300 bg-fossil-50")}
                    {@render templateTextLine("w-1/3")}
                </div>
                <div class="flex space-x-3 pt-2">
                    {@render templateChip()} {@render templateChip()} {@render templateChip()}
                </div>
            </div>
        {:else if type === ExerciseType.MultipleChoice || type === ExerciseType.Prediction || type === ExerciseType.RuleDiscovery || type === ExerciseType.SpotTheDifference || type === ExerciseType.PolitenessScenarios || type === ExerciseType.InferringMeaning || type === ExerciseType.CollocationOddOneOut}
            <div class="space-y-4">
                {@render templateTextLine("w-full")}
                {@render templateTextLine("w-3/4")}
                <div class="grid grid-cols-2 gap-3 pt-2">
                    {@render templateBox("h-12")} {@render templateBox("h-12")}
                    {@render templateBox("h-12")} {@render templateBox("h-12")}
                </div>
            </div>
        {:else if type === ExerciseType.SentenceScramble}
            <div class="space-y-5">
                <div class="space-y-2">
                    {@render templateTextLine("w-3/4")}
                </div>
                {@render templateBox("h-24 w-full border-2")}
                <div class="flex flex-wrap gap-3 py-1 justify-center">
                    {@render templateChip()}{@render templateChip()}{@render templateChip()}{@render templateChip()}
                    {@render templateChip()}{@render templateChip()}{@render templateChip()}
                </div>
                {@render templateBox("h-10 w-full bg-fossil-300")}
            </div>
        {:else if type === ExerciseType.Matching || type === ExerciseType.FunctionMatching}
            <div class="grid grid-cols-2 gap-4">
                {@render templateBox("h-14")}
                {@render templateBox("h-14")}
            </div>
        {:else if type === ExerciseType.StorySequencing}
            {@render templateBox("h-16 w-full border-l-4 border-fossil-300")}
        {:else if type === ExerciseType.ClozeParagraph || type === ExerciseType.DialogueCompletion}
            <div class="space-y-4 leading-loose">
                <div class="flex items-center gap-3">
                    {@render templateTextLine("w-1/4")} {@render templateBox("w-24 h-8")} {@render templateTextLine("w-1/2")}
                </div>
                <div class="flex items-center gap-3">
                    {@render templateTextLine("w-1/2")} {@render templateBox("w-24 h-8")} {@render templateTextLine("w-1/4")}
                </div>
                <div class="flex items-center gap-3">
                    {@render templateTextLine("w-1/3")} {@render templateBox("w-24 h-8")} {@render templateTextLine("w-2/5")}
                </div>
            </div>
        {:else if type === ExerciseType.WordFormation || type === ExerciseType.ErrorCorrection}
            <div class="space-y-4">
                {@render templateTextLine("w-full")}
                {@render templateTextLine("w-2/3")}
                <div class="flex gap-2 mt-4">
                    {@render templateBox("h-10 w-full")}
                    {@render templateBox("h-10 w-24 bg-fossil-300")}
                </div>
            </div>
        {:else if type === ExerciseType.ReadingGist || type === ExerciseType.ReadingDetail || type === ExerciseType.DictoGloss || type === ExerciseType.InformationTransfer || type === ExerciseType.ListeningSpecificInfo}
            <div class="space-y-4">
                {@render templateBox("h-32 w-full")}
                <div class="space-y-2 pt-2">
                    {@render templateTextLine("w-full")}
                    {@render templateTextLine("w-3/4")}
                </div>
            </div>
        {:else if type === ExerciseType.RegisterSort}
            <div class="space-y-4">
                {#snippet chipContainerContent()}
                    <div class="flex flex-wrap gap-2 p-2 justify-center w-full h-full">
                        {@render templateChip()} {@render templateChip()} {@render templateChip()}
                    </div>
                {/snippet}
                {@render templateBox("h-16 w-full border-2 border-fossil-300 border-dashed", chipContainerContent)}

                <div class="grid grid-cols-3 gap-3 h-28">
                    {#snippet textFormal()}Formal{/snippet}
                    {#snippet textNeutral()}Neutral{/snippet}
                    {#snippet textInformal()}Informal{/snippet}
                    {@render templateBox("border-2 text-fossil-400 font-casual text-xs", textFormal)}
                    {@render templateBox("border-2 text-fossil-400 font-casual text-xs", textNeutral)}
                    {@render templateBox("border-2 text-fossil-400 font-casual text-xs", textInformal)}
                </div>
            </div>
        {:else if type === ExerciseType.PicturePrompt || type === ExerciseType.MoralDilemma || type === ExerciseType.FunctionalWriting || type === ExerciseType.ProblemSolvingScenario || type === ExerciseType.RolePlayScenario || type === ExerciseType.StorytellingFromPrompts || type === ExerciseType.JustifyYourOpinion || type === ExerciseType.PictureComparison}
            <div class="space-y-3">
                {@render templateTextLine("w-1/3")}
                {@render templateBox("h-40 w-full")}
            </div>
        {:else}
            <div class="flex items-center space-x-3">
                <div class="w-6 h-6 bg-fossil-200 rounded-full"></div>
                {@render templateTextLine("w-3/4")}
            </div>
        {/if}
    </div>
</div>
