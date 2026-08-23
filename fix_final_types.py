import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Lines 73 and 85 are:
# onUpdateFocusVocabulary && onUpdateFocusVocabulary(focusVocabulary.filter(v => v !== vocabToRemove));
# Let's add types to v and g
content = content.replace('v => v !== vocabToRemove', '(v: string) => v !== vocabToRemove')
content = content.replace('g => g !== grammarToRemove', '(g: string) => g !== grammarToRemove')

with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
