<script lang="ts">
  import { ExerciseType } from '../lib/types';

  let { type, index } = $props<{ type: ExerciseType; index: number }>();
</script>

{#snippet templateBox(className: string, children?: any)}
    <div class="bg-fossil-100 rounded-lg flex items-center justify-center border border-fossil-200 {className}">
        {#if children}
            {@render children()}
        {/if}
    </div>
{/snippet}

{#snippet templateChip(className: string = '')}
    <div class="bg-fossil-200 h-4 w-12 rounded-full {className}"></div>
{/snippet}

{#snippet templateTextLine(width: string = 'w-full')}
    <div class="bg-fossil-200 h-2 rounded-full {width}"></div>
{/snippet}

<div class="flex items-start space-x-3 p-2.5 border-b border-fossil-100 last:border-b-0">
    <span class="text-xs font-semibold text-fossil-400 mt-0.5 select-none">{index + 1}.</span>
    <div class="flex-grow min-w-0">
        {#if type === ExerciseType.FITB || type === ExerciseType.CollocationGapFill || type === ExerciseType.PhrasalVerbGapFill}
            <div class="space-y-2">
                {@render templateTextLine("w-2/3")}
                <div class="flex items-center space-x-2">
                    {@render templateTextLine("w-1/3")}
                    {@render templateBox("w-20 h-6 border-dashed border border-fossil-300 bg-fossil-50")}
                    {@render templateTextLine("w-1/3")}
                </div>
                <div class="flex items-center space-x-2 pt-0.5">
                    {@render templateChip()} {@render templateChip()} {@render templateChip()}
                </div>
            </div>
        {:else if type === ExerciseType.MultipleChoice || type === ExerciseType.Prediction || type === ExerciseType.RuleDiscovery || type === ExerciseType.SpotTheDifference || type === ExerciseType.PolitenessScenarios || type === ExerciseType.InferringMeaning || type === ExerciseType.CollocationOddOneOut}
            <div class="space-y-2">
                {@render templateTextLine("w-full")}
                {@render templateTextLine("w-3/4")}
                <div class="grid grid-cols-2 gap-2">
                    {@render templateBox("h-7")} {@render templateBox("h-7")}
                    {@render templateBox("h-7")} {@render templateBox("h-7")}
                </div>
            </div>
        {:else if type === ExerciseType.SentenceScramble}
            <div class="space-y-2">
                {@render templateTextLine("w-3/4")}
                {@render templateBox("h-14 w-full border")}
                <div class="flex flex-wrap gap-2 justify-center">
                    {@render templateChip()}{@render templateChip()}{@render templateChip()}{@render templateChip()}
                    {@render templateChip()}{@render templateChip()}{@render templateChip()}
                </div>
            </div>
        {:else if type === ExerciseType.Matching || type === ExerciseType.FunctionMatching}
            <div class="grid grid-cols-2 gap-2">
                {@render templateBox("h-8")}
                {@render templateBox("h-8")}
            </div>
        {:else if type === ExerciseType.StorySequencing}
            {@render templateBox("h-10 w-full border-l-2 border-fossil-300")}
        {:else if type === ExerciseType.ClozeParagraph || type === ExerciseType.DialogueCompletion}
            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    {@render templateTextLine("w-1/4")} {@render templateBox("w-16 h-6")} {@render templateTextLine("w-1/2")}
                </div>
                <div class="flex items-center gap-2">
                    {@render templateTextLine("w-1/2")} {@render templateBox("w-16 h-6")} {@render templateTextLine("w-1/4")}
                </div>
            </div>
        {:else if type === ExerciseType.WordFormation || type === ExerciseType.ErrorCorrection}
            <div class="space-y-2">
                {@render templateTextLine("w-full")}
                {@render templateTextLine("w-2/3")}
                <div class="flex gap-2">
                    {@render templateBox("h-7 w-full")}
                    {@render templateBox("h-7 w-20 bg-fossil-300")}
                </div>
            </div>
        {:else if type === ExerciseType.ReadingGist || type === ExerciseType.ReadingDetail || type === ExerciseType.DictoGloss || type === ExerciseType.InformationTransfer || type === ExerciseType.ListeningSpecificInfo}
            <div class="space-y-2">
                {@render templateBox("h-20 w-full")}
                {@render templateTextLine("w-full")}
                {@render templateTextLine("w-3/4")}
            </div>
        {:else if type === ExerciseType.RegisterSort}
            <div class="space-y-2">
                {#snippet chipContainerContent()}
                    <div class="flex flex-wrap gap-1.5 p-1.5 justify-center w-full h-full">
                        {@render templateChip()} {@render templateChip()} {@render templateChip()}
                    </div>
                {/snippet}
                {@render templateBox("h-10 w-full border border-fossil-300 border-dashed", chipContainerContent)}

                <div class="grid grid-cols-3 gap-2">
                    {#snippet textFormal()}Formal{/snippet}
                    {#snippet textNeutral()}Neutral{/snippet}
                    {#snippet textInformal()}Informal{/snippet}
                    {@render templateBox("border text-fossil-400 font-casual text-[11px]", textFormal)}
                    {@render templateBox("border text-fossil-400 font-casual text-[11px]", textNeutral)}
                    {@render templateBox("border text-fossil-400 font-casual text-[11px]", textInformal)}
                </div>
            </div>
        {:else if type === ExerciseType.PicturePrompt || type === ExerciseType.MoralDilemma || type === ExerciseType.FunctionalWriting || type === ExerciseType.ProblemSolvingScenario || type === ExerciseType.RolePlayScenario || type === ExerciseType.StorytellingFromPrompts || type === ExerciseType.JustifyYourOpinion || type === ExerciseType.PictureComparison}
            <div class="space-y-2">
                {@render templateTextLine("w-1/3")}
                {@render templateBox("h-24 w-full")}
            </div>
        {:else}
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-fossil-200 rounded-full"></div>
                {@render templateTextLine("w-3/4")}
            </div>
        {/if}
    </div>
</div>
