<script lang="ts">
  import { Difficulty } from '../../lib/types';
  let { rating } = $props<{ rating: string }>();

  let colorClass = $derived(
    rating === Difficulty.A1 ? 'text-malachite-500' :
    rating === Difficulty.A2 ? 'text-malachite-500' :
    rating === Difficulty.B1 ? 'text-citrine-500' :
    rating === Difficulty.B2 ? 'text-citrine-500' :
    rating === Difficulty.C1 ? 'text-cinnabar-500' :
    rating === Difficulty.C2 ? 'text-cinnabar-600' :
    rating === Difficulty.Suffering ? 'text-cinnabar-700' : 'text-fossil-400'
  );

  let labelClass = $derived(
    rating === Difficulty.A1 || rating === Difficulty.A2 ? 'bg-malachite-100 text-malachite-700 border-malachite-200' :
    rating === Difficulty.B1 || rating === Difficulty.B2 ? 'bg-citrine-100 text-citrine-700 border-citrine-200' :
    rating === Difficulty.C1 || rating === Difficulty.C2 ? 'bg-cinnabar-100 text-cinnabar-700 border-cinnabar-200' :
    rating === Difficulty.Suffering ? 'bg-cinnabar-200 text-cinnabar-800 border-cinnabar-300' : 'bg-fossil-100 text-fossil-700 border-fossil-200'
  );
</script>

<div class="flex items-center gap-1.5" title="CEFR Level: {rating}">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 {colorClass}">
    <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
  </svg>
  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border {labelClass} tracking-wide">
    {rating}
  </span>
</div>
