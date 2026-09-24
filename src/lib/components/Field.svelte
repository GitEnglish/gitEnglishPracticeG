<script lang="ts">
  /**
   * A labelled form control.
   *
   * Exists mainly to make the label/control association impossible to forget:
   * a generated `id` is bound to the control and referenced by the label's
   * `for`, which is what the svelte a11y_label_has_associated_control rule
   * was flagging in five places.
   */
  import type { Snippet } from 'svelte';

  let {
    label,
    hint = '',
    error = '',
    required = false,
    id = `f${Math.random().toString(36).slice(2, 9)}`,
    class: className = '',
    children,
  }: {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    id?: string;
    class?: string;
    /** Receives the control id so callers can bind value / spread attributes. */
    children: Snippet<[string]>;
  } = $props();
</script>

<div class="space-y-1.5 {className}">
  <label
    for={id}
    class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted"
  >
    {label}
    {#if required}<span class="text-cinnabar-500" aria-hidden="true">*</span>{/if}
  </label>

  {@render children(id)}

  {#if error}
    <p class="text-[11px] text-cinnabar-600">{error}</p>
  {:else if hint}
    <p class="text-[11px] text-ink-faint">{hint}</p>
  {/if}
</div>
