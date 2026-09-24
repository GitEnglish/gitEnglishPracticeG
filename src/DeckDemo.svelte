<script lang="ts">
  import DeckMenu, { type DeckItem } from './lib/components/DeckMenu.svelte';

  let picked = $state<string[]>([]);

  function note(label: string) {
    picked = [...picked, label];
  }

  const library: DeckItem[] = [
    { id: 'fitb', label: 'Fill-in-the-Blank', hint: 'PPP', onSelect: () => note('Fill-in-the-Blank') },
    { id: 'mcq', label: 'Multiple Choice', hint: 'PPP', onSelect: () => note('Multiple Choice') },
    {
      id: 'lexis',
      label: 'Lexis',
      hint: 'collocation',
      children: [
        { id: 'cgf', label: 'Collocation Gap-Fill', onSelect: () => note('Collocation Gap-Fill') },
        { id: 'odd', label: 'Collocation Odd One Out', onSelect: () => note('Collocation Odd One Out') },
        { id: 'word', label: 'Word Formation', onSelect: () => note('Word Formation') },
      ],
    },
    {
      id: 'cr',
      label: 'C-R',
      hint: 'consciousness-raising',
      children: [
        { id: 'ec', label: 'Error Correction', onSelect: () => note('Error Correction') },
        { id: 'dg', label: 'Dicto-Gloss', onSelect: () => note('Dicto-Gloss') },
        { id: 'rd', label: 'Rule Discovery', onSelect: () => note('Rule Discovery') },
      ],
    },
  ];

  const settings: DeckItem[] = [
    { id: 'diff', label: 'Difficulty', hint: 'B1', onSelect: () => note('Difficulty') },
    { id: 'tone', label: 'Tone', hint: 'Casual', onSelect: () => note('Tone') },
    { id: 'theme', label: 'Theme', hint: '—', onSelect: () => note('Theme') },
  ];
</script>

<main class="page">
  <h1>Deck menu</h1>
  <p class="sub">
    A stack of cards behind one card. Click: the deck comes forward while it flattens, opening from the
    middle. Click again to close. Items with a sub-list open a second tier with the same motion.
  </p>

  <div class="row">
    <div class="panel">
      <span class="panel-label">Tier 1 + 2</span>
      <DeckMenu items={library} triggerLabel="Exercise Library" triggerHint="8 groups" itemHeight={48} onSelect={(i) => note(i.label)} />
    </div>

    <div class="panel">
      <span class="panel-label">Flat menu</span>
      <DeckMenu items={settings} triggerLabel="Global settings" triggerHint="B1" itemHeight={48} />
    </div>
  </div>

  <div class="picked">
    <span class="panel-label">Chosen</span>
    {#if picked.length === 0}
      <span class="none">nothing yet</span>
    {:else}
      {#each picked as p, i (i)}<span class="chip">{p}</span>{/each}
    {/if}
  </div>
</main>

<style>
  .page {
    min-height: 100vh;
    background: #dbe5eb;
    color: #131b1f;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    padding: 48px 40px;
  }
  h1 {
    margin: 0 0 6px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .sub {
    margin: 0 0 32px;
    max-width: 62ch;
    font-size: 15px;
    line-height: 1.6;
    color: #51595f;
  }
  .row {
    display: flex;
    gap: 56px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .panel {
    min-width: 300px;
    /* room for the deck to spread without clipping */
    padding-bottom: 300px;
  }
  .panel-label {
    display: block;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #647b93;
  }
  .picked {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .picked .panel-label {
    margin: 0;
  }
  .none {
    font-size: 14px;
    color: #647b93;
  }
  .chip {
    font-size: 13px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #c7d1d7;
  }
</style>
