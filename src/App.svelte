<script lang="ts">
  import Sidebar from './components/Sidebar.svelte';
  import Whiteboard from './components/Whiteboard.svelte';
  import RadialMenu from './components/RadialMenu.svelte';

  let isSidebarOpen = $state(true);
  let difficulty = $state('B1');
</script>

<div class="h-screen w-screen flex font-casual antialiased overflow-hidden bg-slate-800">
  <!-- Radial Menu replaces fixed top bar -->
  <RadialMenu
      onToggleSettings={() => {}}
      onToggleSidebar={() => isSidebarOpen = !isSidebarOpen}
      onExportState={() => {}}
      difficulty={difficulty}
      onCycleDifficulty={() => {}}
  />

  <Sidebar
    {isSidebarOpen}
  />

  <!-- Overlay for mobile - Smooth transition -->
  <div
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ease-in-out {isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
      aria-hidden="true"
      onclick={() => isSidebarOpen = false}
  ></div>

  <div class="flex-grow flex flex-col relative">
    <Whiteboard />
  </div>
</div>
