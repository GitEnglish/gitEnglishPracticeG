<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';
  type Size = 'sm' | 'md' | 'icon';

  let {
    variant = 'ghost',
    size = 'md',
    class: className = '',
    children,
    ...rest
  }: HTMLButtonAttributes & {
    variant?: Variant;
    size?: Size;
    class?: string;
    children?: Snippet;
  } = $props();

  const VARIANTS: Record<Variant, string> = {
    primary:
      'bg-accent text-accent-ink hover:bg-accent-hover active:brightness-95 shadow-accent font-bold',
    ghost:
      'bg-transparent text-fossil-200 hover:bg-fossil-50/10 active:bg-fossil-50/15',
    danger:
      'bg-transparent text-cinnabar-400 hover:bg-cinnabar-500/15 active:bg-cinnabar-500/25',
    subtle:
      'bg-fossil-100 text-ink hover:bg-fossil-200 active:bg-fossil-300 border border-rule',
  };

  const SIZES: Record<Size, string> = {
    sm: 'text-[11px] px-2.5 py-1 rounded-md gap-1.5',
    md: 'text-xs px-3.5 py-1.5 rounded-control gap-2',
    icon: 'p-1.5 rounded-control',
  };
</script>

<button
  {...rest}
  class="inline-flex items-center justify-center font-sans tracking-tight
         transition-all duration-150 cursor-pointer select-none
         disabled:opacity-40 disabled:pointer-events-none
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
         {VARIANTS[variant]} {SIZES[size]} {className}"
>
  {@render children?.()}
</button>
