<script lang="ts">
  let {
    onCheck,
    loading = false,
    feedback = null,
    buttonColor
  } = $props<{
    onCheck: () => void;
    loading?: boolean;
    feedback?: string | null;
    buttonColor: { bg: string; text: string; border: string; hover: string; };
  }>();
</script>

<div class="mt-5 flex flex-col gap-3">
    <button
        onclick={onCheck}
        disabled={loading}
        class="w-full sm:w-auto self-start px-6 py-2.5 rounded-xl font-bold {buttonColor.bg} {buttonColor.text} border-2 {buttonColor.border} {buttonColor.hover} shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
    >
        {#if loading}
            <span class="animate-pulse">Checking...</span>
        {:else}
            Check Answer
        {/if}
    </button>
    {#if feedback}
        <div class="p-4 rounded-xl text-sm font-medium {feedback.startsWith('Correct') || feedback.startsWith('Perfect') ? 'bg-green-100 text-green-900 border border-green-200' : 'bg-red-100 text-red-900 border border-red-200'}">
            {feedback}
        </div>
    {/if}
</div>
