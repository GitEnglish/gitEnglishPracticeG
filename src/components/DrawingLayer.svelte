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
    isErasing = false,
    scale = 1,
    pan = { x: 0, y: 0 },
    onPathAdded = (path: DrawingPath) => {},
    onPathsChange = (paths: DrawingPath[]) => {}
  } = $props<{
    paths: DrawingPath[];
    isDrawingMode: boolean;
    isErasing: boolean;
    scale: number;
    pan: { x: number; y: number };
    onPathAdded: (path: DrawingPath) => void;
    onPathsChange: (paths: DrawingPath[]) => void;
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

  // Eraser: delete any stroke within reach of the pointer. Radius is in
  // world coordinates (points are already unscaled), so a stroke drawn
  // with width w erases when the pointer comes within 12px + w/2 of it.
  const ERASE_RADIUS = 12;

  const distToSegment = (
    px: number, py: number,
    ax: number, ay: number,
    bx: number, by: number
  ) => {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };

  const pathHit = (path: DrawingPath, x: number, y: number) => {
    const reach = ERASE_RADIUS + path.width / 2;
    const pts = path.points;
    for (let i = 0; i < pts.length; i++) {
      if (Math.hypot(pts[i].x - x, pts[i].y - y) <= reach) return true;
      if (
        i > 0 &&
        distToSegment(x, y, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y) <= reach
      ) {
        return true;
      }
    }
    return false;
  };

  const eraseAt = (e: MouseEvent | TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const remaining = paths.filter((p: DrawingPath) => !pathHit(p, x, y));
    if (remaining.length !== paths.length) onPathsChange(remaining);
    if (e.cancelable) e.preventDefault();
  };

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    if (isErasing) {
      isDrawing = true;
      eraseAt(e);
      return;
    }
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
    if (!isDrawing) return;

    if (isErasing) {
      eraseAt(e);
      return;
    }

    if (!currentPath) return;

    const coords = getCoordinates(e);
    currentPath = {
      ...currentPath,
      points: [...currentPath.points, coords]
    };

    if (e.cancelable) e.preventDefault();
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    isDrawing = false;
    if (isErasing || !currentPath) {
      currentPath = null;
      return;
    }
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
  style="pointer-events: {isDrawingMode || isErasing ? 'auto' : 'none'}; touch-action: none; z-index: 2; cursor: {isErasing ? 'cell' : isDrawingMode ? 'crosshair' : 'default'};"
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
