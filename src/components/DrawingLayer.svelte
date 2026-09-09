<script lang="ts">
  import { onMount } from 'svelte';

  export interface DrawingPath {
    id: string;
    points: { x: number; y: number }[];
    color: string;
    width: number;
  }

  let {
    paths = [],
    isDrawingMode = false,
    scale = 1,
    pan = { x: 0, y: 0 },
    onPathAdded = (path: DrawingPath) => {}
  } = $props<{
    paths: DrawingPath[];
    isDrawingMode: boolean;
    scale: number;
    pan: { x: number; y: number };
    onPathAdded: (path: DrawingPath) => void;
  }>();

  let svgRef: SVGSVGElement;
  let isDrawing = $state(false);
  let currentPath = $state<DrawingPath | null>(null);
  let color = $state('#3b82f6'); // default blue
  let width = $state(4);

  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    if (!svgRef) return { x: 0, y: 0 };

    // Client coordinates
    let clientX = 0;
    let clientY = 0;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const rect = svgRef.getBoundingClientRect();

    // Because the SVG is placed INSIDE the #whiteboard-background which already
    // has transform: translate(pan.x, pan.y) scale(scale) applied to it,
    // rect.left and rect.top already account for the canvas's pan and scale.
    // Therefore, calculating coordinates only requires undoing the scale.

    // Calculate relative to the transformed SVG element
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;

    return { x, y };
  };

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    if (!isDrawingMode || (e instanceof MouseEvent && e.button !== 0)) return;

    isDrawing = true;
    const coords = getCoordinates(e);

    currentPath = {
      id: Date.now().toString(),
      points: [coords],
      color,
      width
    };

    // Prevent default to stop scrolling on touch devices
    if (e.cancelable) e.preventDefault();
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing || !currentPath) return;

    const coords = getCoordinates(e);
    currentPath = {
      ...currentPath,
      points: [...currentPath.points, coords]
    };

    if (e.cancelable) e.preventDefault();
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentPath) return;

    isDrawing = false;
    onPathAdded(currentPath);
    currentPath = null;
  };

  const handlePointerLeave = () => {
    if (isDrawing) {
      handlePointerUp();
    }
  };

  // Convert points array to SVG path 'd' string
  const toSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const start = points[0];
    let path = `M ${start.x} ${start.y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };
</script>

<svg
  bind:this={svgRef}
  class="absolute top-0 left-0 w-full h-full pointer-events-none"
  style="pointer-events: {isDrawingMode ? 'auto' : 'none'}; touch-action: none; z-index: 9999999;"
  role="presentation"
  onmousedown={handlePointerDown}
  onmousemove={handlePointerMove}
  onmouseup={handlePointerUp}
  onmouseleave={handlePointerLeave}
  ontouchstart={handlePointerDown}
  ontouchmove={handlePointerMove}
  ontouchend={handlePointerUp}
  ontouchcancel={handlePointerLeave}
>
  <!-- Render background paths. We no longer apply a transform here because the parent is already transformed -->
  <g>
    {#each paths as path (path.id)}
      <path
        d={toSvgPath(path.points)}
        stroke={path.color}
        stroke-width={path.width}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/each}

    <!-- Render the current path being drawn -->
    {#if currentPath}
      <path
        d={toSvgPath(currentPath.points)}
        stroke={currentPath.color}
        stroke-width={currentPath.width}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/if}
  </g>
</svg>
