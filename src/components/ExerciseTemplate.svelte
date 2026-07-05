<script lang="ts">
  import { ExerciseType } from '../lib/types';

  let { type, index } = $props<{ type: ExerciseType; index: number }>();
</script>

<div class="space-y-4 font-casual text-slate-400">
  <div class="flex items-center space-x-3 mb-4">
    <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{index}</div>
    <div class="h-4 bg-slate-200 rounded w-1/3"></div>
  </div>

  {#if type === ExerciseType.FITB || type === ExerciseType.CollocationGapFill || type === ExerciseType.PhrasalVerbGapFill}
      <div class="flex items-center space-x-2">
          <div class="bg-slate-200 h-3 rounded w-1/4"></div>
          <div class="w-20 h-6 border-b-2 border-dashed border-slate-300"></div>
          <div class="bg-slate-200 h-3 rounded w-1/4"></div>
      </div>
      <div class="flex gap-2 mt-4">
          <div class="bg-slate-200 h-6 w-16 rounded-xl"></div>
          <div class="bg-slate-200 h-6 w-16 rounded-xl"></div>
          <div class="bg-slate-200 h-6 w-16 rounded-xl"></div>
      </div>
  {:else if type === ExerciseType.MultipleChoice || type === ExerciseType.Prediction}
      <div class="space-y-2">
          <div class="flex items-center space-x-3 p-2 border-2 border-slate-100 rounded-xl">
              <div class="w-4 h-4 rounded-full border-2 border-slate-200"></div>
              <div class="bg-slate-200 h-3 rounded w-1/2"></div>
          </div>
          <div class="flex items-center space-x-3 p-2 border-2 border-slate-100 rounded-xl">
              <div class="w-4 h-4 rounded-full border-2 border-slate-200"></div>
              <div class="bg-slate-200 h-3 rounded w-1/3"></div>
          </div>
      </div>
  {:else if type === ExerciseType.Matching || type === ExerciseType.FunctionMatching}
      <div class="flex gap-4">
          <div class="flex-1 space-y-2">
              <div class="bg-slate-200 h-8 rounded-xl w-full"></div>
              <div class="bg-slate-200 h-8 rounded-xl w-full"></div>
          </div>
          <div class="flex-1 space-y-2">
              <div class="bg-slate-200 h-8 rounded-xl w-full border-dashed border-2"></div>
              <div class="bg-slate-200 h-8 rounded-xl w-full border-dashed border-2"></div>
          </div>
      </div>
  {:else if type === ExerciseType.PicturePrompt}
      <div class="bg-slate-200 h-32 rounded-xl w-full flex items-center justify-center">
          <svg class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
      </div>
  {:else if type === ExerciseType.RegisterSort}
      <div class="grid grid-cols-2 gap-2">
          <div class="h-20 border-2 border-slate-200 rounded-xl"></div>
          <div class="h-20 border-2 border-slate-200 rounded-xl"></div>
      </div>
  {:else if type === ExerciseType.StorySequencing}
      <div class="space-y-2">
          <div class="bg-slate-200 h-10 rounded-xl w-full"></div>
          <div class="bg-slate-200 h-10 rounded-xl w-full"></div>
          <div class="bg-slate-200 h-10 rounded-xl w-full"></div>
      </div>
  {:else}
      <div class="space-y-2">
          <div class="bg-slate-200 h-3 rounded w-full"></div>
          <div class="bg-slate-200 h-3 rounded w-5/6"></div>
          <div class="bg-slate-200 h-3 rounded w-4/6"></div>
      </div>
  {/if}
</div>
