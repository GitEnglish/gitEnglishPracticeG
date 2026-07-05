<script lang="ts">
  let {
    text,
    onclick,
    ondragstart,
    draggable = false,
    disabled = false,
    class: className = '',
    chipColors
  } = $props<{
    text: string;
    onclick?: () => void;
    ondragstart?: (e: DragEvent) => void;
    draggable?: boolean;
    disabled?: boolean;
    class?: string;
    chipColors: { bg: string; text: string; border: string; };
  }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
    {draggable}
    {ondragstart}
    {onclick}
    class="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all shadow-sm {chipColors.border} {chipColors.bg} {chipColors.text} {className} {disabled ? 'opacity-50 cursor-not-allowed' : draggable ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : 'cursor-pointer hover:brightness-95 hover:-translate-y-0.5'}"
>
    {text}
</span>
