import re

with open('src/App.svelte', 'r') as f:
    content = f.read()

# Make sure we add type definitions for the event handlers in App.svelte where they are passed to Sidebar
# Actually the errors are:
# Error: Object literal may only specify known properties, and '"onFocusVocabularyChange"' does not exist in type '$$ComponentProps'. (ts)
# This means Sidebar does not accept these props in its definition!
