<script lang="ts">
  import CloseIcon from './CloseIcon.svelte';
  let { class: className = "w-6 h-6" } = $props();
</script>
<CloseIcon class={className} />
