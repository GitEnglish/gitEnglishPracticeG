<script lang="ts">
  import { Menu } from 'lucide-svelte';

  let { difficulty = 'B1', onToggleSettings, onToggleSidebar, onExportState, onCycleDifficulty } = $props<{
      difficulty?: string;
      onToggleSettings?: () => void;
      onToggleSidebar?: () => void;
      onExportState?: () => void;
      onCycleDifficulty?: () => void;
  }>();
</script>

<div class="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
    <div class="relative pointer-events-auto group">
        <!-- Main Toggle Button -->
        <button
            onclick={onToggleSidebar}
            class="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            aria-label="Toggle Menu"
            aria-expanded="false"
            aria-haspopup="true"
        >
            <Menu size={24} />
        </button>
        <!-- Decorative Glow -->
        <div class="absolute inset-0 rounded-full bg-blue-500 blur-md opacity-30 -z-10 group-hover:opacity-50 transition-opacity"></div>
    </div>
</div>
