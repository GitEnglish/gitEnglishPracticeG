<script lang="ts">
  /**
   * DeckMenu — a stacked deck that rotates open into a menu.
   *
   * The motion, as described: one card sits in front with a stack behind it,
   * receding in Z and sinking toward black. On click the deck comes toward the
   * viewer while it flattens — rotateX returning to 0, translateZ to 0 — so
   * the stack straightens into a plane and spreads into a list. It opens from
   * the middle: the centre card has no delay and the outer cards are delayed by
   * their distance from the centre, so the group comes together around it.
   * Clicking again runs the same springs in reverse.
   *
   * Built on @humanspeak/svelte-motion, the same port the exercise cards use
   * for dragging, so the menus and the cards share one set of physics instead
   * of the app having a spring system and a CSS system that never meet.
   */
  import { motion } from '@humanspeak/svelte-motion';
  import { prefersReducedMotion } from 'svelte/motion';
  import DeckMenu from './DeckMenu.svelte';

  export interface DeckItem {
    id: string;
    label: string;
    hint?: string;
    /** Present on an item to make it a second-tier trigger. */
    children?: DeckItem[];
    onSelect?: () => void;
  }

  let {
    items = [],
    open = $bindable(false),
    triggerLabel = 'Menu',
    triggerHint = '',
    itemHeight = 46,
    depth = 0,
    onSelect,
  }: {
    items?: DeckItem[];
    open?: boolean;
    triggerLabel?: string;
    triggerHint?: string;
    itemHeight?: number;
    /** 0 for a first-tier menu, 1+ for a nested one. */
    depth?: number;
    onSelect?: (item: DeckItem) => void;
  } = $props();

  /** Visual cards: 0 is the trigger, 1..n are the menu items. */
  const cardCount = $derived(items.length + 1);

  /** Distance from the centre of the deck — the stagger order. */
  const offsets = $derived(
    Array.from({ length: cardCount }, (_, v) =>
      cardCount <= 1 ? 0 : Math.abs(v - (cardCount - 1) / 2),
    ),
  );

  const Z_STEP = 16;
  const ROTATION = -68;
  const SPRING = { type: 'spring', stiffness: 190, damping: 24 } as const;

  function springFor(v: number) {
    if (prefersReducedMotion.current) return { duration: 0, delay: 0 };
    // The centre card leads; each step away from the middle waits a beat.
    return { ...SPRING, delay: (offsets[v] ?? 0) * 0.045 };
  }

  /**
   * Card 0 is the trigger: it stays flat and still at all times, and is the
   * anchor the stack swings out from beneath. Rotating it too left it nearly
   * edge-on when closed, so its real hit area was a sliver and a normal click
   * could not land on it. Only the cards *behind* it recede.
   */
  function closed(v: number) {
    if (v === 0) return { y: 0, z: 0, rotateX: 0, scale: 1, opacity: 1 };
    return {
      y: 0,
      z: -(Z_STEP * v),
      rotateX: ROTATION,
      scale: 0.86,
      opacity: Math.max(0.14, 1 - v * 0.2),
    };
  }

  function opened(v: number) {
    return { y: v * itemHeight, z: 0, rotateX: 0, scale: 1, opacity: 1 };
  }

  function target(v: number) {
    return open ? opened(v) : closed(v);
  }

  /** The overlay that sinks the waiting cards toward black. */
  function shade(v: number) {
    return open ? 0 : Math.min(0.82, v * 0.17);
  }

  function toggle() {
    open = !open;
  }

  function choose(item: DeckItem) {
    item.onSelect?.();
    onSelect?.(item);
    if (!item.children?.length) open = false;
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
      return;
    }
    if (depth > 0 && (e.key === 'ArrowLeft' || e.key === 'Backspace')) {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={onkeydown} />

<div class="deck" style="--item-h: {itemHeight}px">
  <!-- Reserves the open height so the deck is not clipped by its parent. -->
  <motion.div
    class="deck-shell"
    initial={false}
    animate={{ height: open ? cardCount * itemHeight : itemHeight }}
    transition={prefersReducedMotion.current ? { duration: 0 } : SPRING}
  >
    <div class="deck-stage">
      <!-- The trigger: visual card 0, in front of the stack. -->
      <motion.button
        type="button"
        class="deck-card"
        initial={closed(0)}
        animate={target(0)}
        transition={springFor(0)}
        style="z-index: {100}"
        aria-expanded={open}
        aria-haspopup="menu"
        onclick={toggle}
      >
        <span class="deck-label">{triggerLabel}</span>
        {#if triggerHint}<span class="deck-hint">{triggerHint}</span>{/if}
        <motion.span class="deck-shade" initial={false} animate={{ opacity: shade(0) }} aria-hidden="true"></motion.span>
      </motion.button>

      {#each items as item, i (item.id)}
        {@const v = i + 1}
        {#if item.children?.length}
          <!-- Second tier: the same motion, one level in. This layer's own
               position is animated too, so a nested group participates in the
               same stack-and-fan as the flat items. -->
          <motion.div
            class="deck-layer"
            initial={false}
            animate={{ y: open ? v * itemHeight : 0 }}
            transition={prefersReducedMotion.current ? { duration: 0 } : SPRING}
            style="z-index: {100 - v}"
          >
            <DeckMenu
              items={item.children}
              triggerLabel={item.label}
              triggerHint={item.hint ?? ''}
              {itemHeight}
              depth={depth + 1}
              onSelect={(child: DeckItem) => {
                child.onSelect?.();
                onSelect?.(child);
                open = false;
              }}
            />
          </motion.div>
        {:else}
          <motion.button
            type="button"
            role="menuitem"
            class="deck-card"
            initial={closed(v)}
            animate={target(v)}
            transition={springFor(v)}
            style="z-index: {100 - v}"
            onclick={() => choose(item)}
          >
            <span class="deck-label">{item.label}</span>
            {#if item.hint}<span class="deck-hint">{item.hint}</span>{/if}
            <motion.span class="deck-shade" initial={false} animate={{ opacity: shade(v) }} aria-hidden="true"></motion.span>
          </motion.button>
        {/if}
      {/each}
    </div>
  </motion.div>
</div>

<style>
  .deck {
    position: relative;
    /* Perspective is what makes translateZ read as depth rather than a flat
       scale. Without it the stack collapses into a 2D pile. */
    perspective: 900px;
    perspective-origin: 50% 0%;
  }

  /* motion.div children do not receive this component's scope attribute, so
     these must be global too — scoped, they silently fall back to
     position: static and start consuming layout height. */
  :global(.deck-shell) {
    position: relative;
    overflow: visible;
  }

  :global(.deck-layer) {
    position: absolute;
    /* Explicit, because the layer's position is driven by the animated `y`
       alone — with `top: auto` its static position leaks into the offset. */
    top: 0;
    left: 0;
    right: 0;
    transform-style: preserve-3d;
  }

  .deck-stage {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }

  /* The cards are rendered by motion.* child components, which do not receive
     this component's scope attribute — so scoped selectors silently miss them.
     These rules must be global or the cards render unstyled. The class names
     are specific enough to be safe. */
  :global(.deck-card) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--item-h);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border: 1px solid color-mix(in oklab, var(--deck-line, #c7d1d7) 70%, transparent);
    border-radius: calc(var(--item-h) * 0.28);
    background: var(--deck-bg, #ffffff);
    color: var(--deck-fg, #131b1f);
    font: 500 14px/1 'Plus Jakarta Sans', system-ui, sans-serif;
    text-align: left;
    cursor: pointer;
    transform-origin: 50% 0%;
    transform-style: preserve-3d;
    overflow: hidden;
    box-shadow: 0 1px 2px rgb(19 27 31 / 0.06);
  }

  :global(.deck-card:hover) {
    border-color: color-mix(in oklab, var(--deck-accent, #e3570b) 55%, transparent);
  }

  :global(.deck-card:focus-visible) {
    outline: 2px solid var(--deck-accent, #e3570b);
    outline-offset: 2px;
  }

  :global(.deck-label) {
    position: relative;
    z-index: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.deck-hint) {
    position: relative;
    z-index: 1;
    margin-left: auto;
    font-size: 12px;
    color: color-mix(in oklab, var(--deck-fg, #131b1f) 55%, transparent);
  }

  /* The "fades to black" of the cards waiting behind. A flat overlay rather
     than a filter, which would force a repaint of the whole card each frame. */
  :global(.deck-shade) {
    position: absolute;
    inset: 0;
    background: #000;
    pointer-events: none;
  }
</style>
