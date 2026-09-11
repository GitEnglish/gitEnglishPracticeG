import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Fix the main container div to correctly apply sizing logic and resize handles
# We noticed that the earlier python replace didn't work because of single-quotes inside Svelte's templating
# We'll use a precise replacement instead

old_div = """<!-- Simplified ExerciseBlock implementation -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    role="region"
    aria-roledescription="exercise block"
    draggable={!isPresenting}
    ondragstart={(e) => {
        if (!isPresenting) {
            onFocus(id);
            // We'll calculate a basic drag offset
            if (e.dataTransfer) {
                e.dataTransfer.setData('block-id', String(id));
                // Set offset
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                e.dataTransfer.setData('offset-x', String((e.clientX - rect.left) / scale));
                e.dataTransfer.setData('offset-y', String((e.clientY - rect.top) / scale));
            }
        }
    }}
    onmousedown={() => onFocus(id)}
    class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col will-change-transform transition-transform {isPresenting ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] scale-150 shadow-2xl' : 'absolute cursor-grab active:cursor-grabbing'}"
    style="left: {x}px; top: {y}px; width: {isPresenting ? '900px' : (!isGenerated ? '400px' : width + 'px')}; height: {isPresenting ? 'auto' : (!isGenerated ? 'fit-content' : height + 'px')}; min-height: {isPresenting ? 'auto' : (!isGenerated ? '350px' : height + 'px')}; z-index: {isPresenting ? 9999 : zIndex};"
>"""

new_div = """<!-- Simplified ExerciseBlock implementation -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    role="region"
    aria-roledescription="exercise block"
    draggable={!isPresenting && !isResizing}
    ondragstart={(e) => {
        if (!isPresenting && !isResizing) {
            onFocus(id);
            if (e.dataTransfer) {
                e.dataTransfer.setData('block-id', String(id));
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                e.dataTransfer.setData('offset-x', String((e.clientX - rect.left) / scale));
                e.dataTransfer.setData('offset-y', String((e.clientY - rect.top) / scale));
            }
        } else {
            e.preventDefault();
        }
    }}
    onmousedown={() => onFocus(id)}
    class="bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] overflow-hidden border-4 {colors.border} flex flex-col will-change-transform {isPresenting ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] scale-150 shadow-2xl !rounded-none !border-0 w-screen h-screen' : 'absolute cursor-grab active:cursor-grabbing'}"
    style="left: {x}px; top: {y}px; width: {isPresenting ? '900px' : width + 'px'}; height: {isPresenting ? 'auto' : height + 'px'}; min-height: {isPresenting ? 'auto' : '150px'}; z-index: {isPresenting ? 9999 : zIndex};"
>
    <!-- Resize Handles -->
    {#if !isPresenting}
        <div class="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'n')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 's')} role="separator" aria-orientation="horizontal" tabindex="-1"></div>
        <div class="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'w')} role="separator" aria-orientation="vertical" tabindex="-1"></div>
        <div class="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'e')} role="separator" aria-orientation="vertical" tabindex="-1"></div>

        <div class="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'nw')} role="separator" tabindex="-1"></div>
        <div class="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'ne')} role="separator" tabindex="-1"></div>
        <div class="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'sw')} role="separator" tabindex="-1"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-blue-500/20" onmousedown={(e) => startResize(e, 'se')} role="separator" tabindex="-1"></div>
    {/if}
"""

content = content.replace(old_div, new_div)

with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
