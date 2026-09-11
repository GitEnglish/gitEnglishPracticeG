import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Fix layout for the main body wrapper to allow content to grow naturally if needed,
# or simply removing max height constraints that hide stuff.
body_wrapper_regex = re.compile(r'<!-- Body -->\s*<div class="flex-grow p-5 bg-white overflow-hidden relative">')

new_body_wrapper = """<!-- Body -->
    <div class="flex-grow flex flex-col bg-paper-bg overflow-hidden relative w-full h-full">"""

content = body_wrapper_regex.sub(new_body_wrapper, content)

# Fix inner content wrapper for generated exercises so they fill properly
generated_wrapper_regex = re.compile(r'<div class="flex-grow overflow-y-auto min-h-0">\s*\{#if activeItem\?\.error\}')

new_generated_wrapper = """<div class="flex-grow overflow-y-auto p-5 custom-scrollbar-light h-full w-full">
                    {#if activeItem?.error}"""

content = generated_wrapper_regex.sub(new_generated_wrapper, content)


with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
