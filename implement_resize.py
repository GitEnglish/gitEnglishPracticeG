import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Add resize state variables inside script block
state_vars = """
  // Resize State
  let isResizing = $state(false);
  let resizeDirection = $state<string | null>(null);
  let startWidth = $state(0);
  let startHeight = $state(0);
  let startX = $state(0);
  let startY = $state(0);
  let startMouseX = $state(0);
  let startMouseY = $state(0);

  const startResize = (e: MouseEvent, direction: string) => {
      e.stopPropagation();
      onFocus(id);
      isResizing = true;
      resizeDirection = direction;
      startWidth = width;
      startHeight = height;
      startX = x;
      startY = y;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', stopResize);
  };

  const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !resizeDirection) return;
      e.preventDefault();

      const dx = (e.clientX - startMouseX) / scale;
      const dy = (e.clientY - startMouseY) / scale;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX;
      let newY = startY;

      if (resizeDirection.includes('e')) newWidth = Math.max(350, startWidth + dx);
      if (resizeDirection.includes('s')) newHeight = Math.max(150, startHeight + dy);
      if (resizeDirection.includes('w')) {
          const possibleWidth = startWidth - dx;
          if (possibleWidth >= 350) {
              newWidth = possibleWidth;
              newX = startX + dx;
          }
      }
      if (resizeDirection.includes('n')) {
          const possibleHeight = startHeight - dy;
          if (possibleHeight >= 150) {
              newHeight = possibleHeight;
              newY = startY + dy;
          }
      }

      onUpdate(id, { width: newWidth, height: newHeight, x: newX, y: newY });
  };

  const stopResize = () => {
      isResizing = false;
      resizeDirection = null;
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', stopResize);
  };
"""

content = content.replace("let scaledY = $derived(y * scale);", f"let scaledY = $derived(y * scale);\n{state_vars}")


# Replace the main container with the new logic
# We'll use python's re to find the main <div role="region"...> and add resize handles inside it.
container_regex = re.compile(r'<div\s+role="region"[\s\S]*?class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col will-change-transform transition-transform.*?style="left: \{x\}px; top: \{y\}px; width: \{isPresenting \? \'900px\' : \(\!isGenerated \? \'400px\' : width \+ \'px\'\)\}; height: \{isPresenting \? \'auto\' : \(\!isGenerated \? \'fit-content\' : height \+ \'px\'\)\}; min-height: \{isPresenting \? \'auto\' : \(\!isGenerated \? \'350px\' : height \+ \'px\'\)\}; z-index: \{isPresenting \? 9999 : zIndex\};">')

new_container_style = 'style="left: {x}px; top: {y}px; width: {isPresenting ? \'900px\' : width + \'px\'}; height: {isPresenting ? \'auto\' : height + \'px\'}; min-height: {isPresenting ? \'auto\' : \'150px\'}; z-index: {isPresenting ? 9999 : zIndex};"'

new_container = f"""
<div
    role="region"
    aria-roledescription="exercise block"
    draggable={{!isPresenting && !isResizing}}
    ondragstart={{(e) => {{
        if (!isPresenting && !isResizing) {{
            onFocus(id);
            if (e.dataTransfer) {{
                e.dataTransfer.setData('block-id', String(id));
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                e.dataTransfer.setData('offset-x', String((e.clientX - rect.left) / scale));
                e.dataTransfer.setData('offset-y', String((e.clientY - rect.top) / scale));
            }}
        }} else {{
            e.preventDefault();
        }}
    }}}}
    onmousedown={{() => onFocus(id)}}
    class="bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] flex flex-col will-change-transform border-4 {{colors.border}} {{isPresenting ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] scale-150 shadow-2xl !rounded-none !border-0 w-screen h-screen' : 'absolute cursor-grab active:cursor-grabbing'}}"
    {new_container_style}
>

    <!-- Resize Handles -->
    {{#if !isPresenting}}
        <div class="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'n')}} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 's')}} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'w')}} role="separator" aria-orientation="vertical" tabindex="-1"></div>
        <div class="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'e')}} role="separator" aria-orientation="vertical" tabindex="-1"></div>

        <div class="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'nw')}} role="separator" tabindex="-1"></div>
        <div class="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'ne')}} role="separator" tabindex="-1"></div>
        <div class="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'sw')}} role="separator" tabindex="-1"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-blue-500/20" onmousedown={{(e) => startResize(e, 'se')}} role="separator" tabindex="-1"></div>
    {{/if}}
"""

content = container_regex.sub(new_container, content)

with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
