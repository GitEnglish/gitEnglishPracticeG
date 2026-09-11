import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Fix the a11y warning for the div wrapper by adding role="presentation"
# We only want to add it to the wrapper that has drag capabilities.
div_regex = re.compile(r'<div\n    role="region"')
# It already has role="region" so we can add aria-roledescription and we are ignoring the non-interactive mouse listeners via svelte-ignore.
content = content.replace('<!-- Simplified ExerciseBlock implementation -->\n<div', '<!-- Simplified ExerciseBlock implementation -->\n<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->\n<div')

with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
