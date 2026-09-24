<script lang="ts">
  import { Menu, X, Settings, Gauge, Download, Palette, PenTool } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';

  let { difficulty = 'B1', onToggleSettings, onToggleSidebar, onExportState, onCycleDifficulty, isDrawingMode = false, onToggleDrawingMode } = $props<{
      difficulty?: string;
      onToggleSettings?: () => void;
      onToggleSidebar?: () => void;
      onExportState?: () => void;
      onCycleDifficulty?: () => void;
      isDrawingMode?: boolean;
      onToggleDrawingMode?: () => void;
  }>();

  let isOpen = $state(false);
  let isHovered = $state(false);
  const radius = 80;

  const handleGlobalClick = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('#radial-menu-container')) {
          isOpen = false;
      }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') isOpen = false;
  };

  onMount(() => {
      window.addEventListener('click', handleGlobalClick);
      window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
  });

  let menuItems = $derived([
      { icon: Settings, label: "Config", action: onToggleSettings },
      { icon: Gauge, label: `Difficulty: ${difficulty}`, action: onCycleDifficulty },
      { icon: Download, label: "Export", action: onExportState },
      { icon: PenTool, label: isDrawingMode ? "Stop Drawing" : "Draw", action: onToggleDrawingMode }
  ]);

  const getStyle = (index: number, total: number) => {
      const angleDegree = 160 - (index * 40);
      const angleRad = (angleDegree * Math.PI) / 180;
      const x = radius * Math.cos(angleRad);
      const y = radius * Math.sin(angleRad);

      if (isOpen) {
          return `transform: translate(${x}px, ${y}px) scale(1); opacity: 1; pointer-events: auto; transition-delay: ${index * 50}ms;`;
      } else {
          return `transform: translate(0px, 0px) scale(0.5); opacity: 0; pointer-events: none; transition-delay: ${(total - 1 - index) * 50}ms;`;
      }
  };
</script>

<div id="radial-menu-container"
     class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center justify-center font-casual"
     onmouseenter={() => isHovered = true}
     onmouseleave={() => isHovered = false}
     role="group"
>
    <!-- Main Toggle Button -->
    <button
        onclick={(e) => {
            e.stopPropagation();
            isOpen = !isOpen;
            if (isOpen && onToggleSidebar) onToggleSidebar();
        }}
        class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-[102] border-4 border-fossil-50/20 backdrop-blur-sm ring-1 ring-black/5
               {isOpen ? 'bg-accent text-accent-ink rotate-90 scale-110' : 'bg-chrome-raised text-fossil-200 hover:bg-accent hover:text-accent-ink hover:scale-105 hover:shadow-accent/30'}"
        aria-label="Open Menu"
    >
        {#if isOpen}
            <X size={28} />
        {:else}
            <Menu size={28} />
        {/if}
    </button>

    <!-- Satellites -->
    {#each menuItems as item, index}
        <button
            onclick={() => {
                if (item.action) item.action();
                isOpen = false;
            }}
            style={getStyle(index, menuItems.length)}
            class="absolute w-10 h-10 bg-fossil-50 text-ink rounded-full shadow-lg border border-fossil-200
                   flex items-center justify-center transition-all duration-300 hover:bg-accent hover:text-accent-ink hover:scale-110"
            title={item.label}
        >
            {#if item.icon}
                {@const IconComponent = item.icon}
                <IconComponent size={20} />
            {/if}
        </button>
    {/each}

    <!-- Label tooltip -->
    {#if !isOpen && isHovered}
         <div class="absolute top-16 text-[10px] font-bold uppercase tracking-widest text-fossil-600 bg-fossil-50/90 px-2 py-1 rounded-md shadow-sm border border-fossil-100 animate-in fade-in slide-in-from-top-1">
             Menu
         </div>
    {/if}
</div>
