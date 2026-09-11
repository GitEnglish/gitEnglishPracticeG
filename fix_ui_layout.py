import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Fix layout of Pre-Generated UI
pre_gen_regex = re.compile(r'<div class="h-full flex flex-col items-center justify-start p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-y-auto">\s*<div class="flex flex-col items-center sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 py-4 w-full border-b border-slate-200/50 mb-6">\s*<p class="text-sm text-slate-500 mb-4 max-w-sm text-center">\s*This <strong class="text-slate-700">\{exerciseType\}</strong> block is ready to generate. Configure settings using the gear icon, then click Generate.\s*</p>\s*<button onclick=\{handleGenerate\} class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 active:scale-95">\s*<Wand2 class="w-5 h-5" />\s*Generate Exercise \(\{generateAmount\}\)\s*</button>\s*</div>\s*<div class="w-full space-y-4 max-w-2xl">')

new_pre_gen = """
<div class="h-full flex flex-col p-5 bg-paper-bg overflow-y-auto custom-scrollbar-light">
    <!-- Slimmer, compact header for pre-gen state instead of huge sticky block -->
    <div class="flex flex-col items-center justify-center py-3 px-4 w-full bg-slate-50/80 rounded-lg border border-slate-200 mb-4 shadow-sm flex-shrink-0">
        <div class="flex items-center justify-between w-full">
            <span class="text-sm text-slate-600">Ready to generate <strong>{exerciseType}</strong></span>
            <button onclick={handleGenerate} class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded shadow hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95">
                <Wand2 class="w-4 h-4" />
                Generate ({generateAmount})
            </button>
        </div>
    </div>

    <div class="w-full flex-grow space-y-4 max-w-2xl mx-auto flex flex-col justify-start">
"""

content = pre_gen_regex.sub(new_pre_gen, content)

with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
