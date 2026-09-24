<script lang="ts">
  /**
   * CEFR level meter.
   *
   * Meaning is carried by the NUMBER of filled bars, not by hue — the label
   * and the title attribute state the level outright. That keeps it readable
   * without colour vision and stops it competing with the accent CTA, since
   * it uses the same accent colour in the same role.
   */
  let {
    level,
    max = 7,
    tone = 'accent',
    title = '',
    class: className = '',
  }: {
    /** Filled bars, 1–max. */
    level: number;
    max?: number;
    tone?: 'accent' | 'muted';
    title?: string;
    class?: string;
  } = $props();

  const filled = $derived(Math.max(0, Math.min(max, Math.round(level))));
  const on = $derived(tone === 'accent' ? 'bg-accent' : 'bg-fossil-400');
</script>

<span
  class="inline-flex items-end gap-[2px] h-3 {className}"
  role="img"
  aria-label="Level {filled} of {max}"
  {title}
>
  {#each { length: max } as _, i (i)}
    <span
      class="w-[3px] rounded-[1px] transition-colors
             {i < filled ? on : 'bg-fossil-700'}"
      style="height: {4 + i * 1.4}px"
    ></span>
  {/each}
</span>
