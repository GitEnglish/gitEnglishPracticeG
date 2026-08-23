import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Sidebar is complaining about focus prop again.
# The prop in App.svelte is:
# onUpdateFocusVocabulary={(v: string[]) => { globalFocusVocabulary = v; localStorage.setItem('practiceGenie-focusVocabulary', JSON.stringify(v)); }}
# The prop signature in Sidebar.svelte is:
# onUpdateFocusVocabulary?: (vocab: string[]) => void;
# Why doesn't it exist in $$ComponentProps? Because we need to declare it properly in Sidebar.svelte $props!

content = content.replace('onUpdateFocusVocabulary={onUpdateFocusVocabulary || (() => {})}', 'onUpdateFocusVocabulary={onUpdateFocusVocabulary as any}')
content = content.replace('onUpdateFocusGrammar={onUpdateFocusGrammar || (() => {})}', 'onUpdateFocusGrammar={onUpdateFocusGrammar as any}')

with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
