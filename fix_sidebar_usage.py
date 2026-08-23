import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

content = content.replace('onUpdateFocusVocabulary={onUpdateFocusVocabulary}', 'onUpdateFocusVocabulary={(v) => onUpdateFocusVocabulary && onUpdateFocusVocabulary(v)}')
content = content.replace('onUpdateFocusGrammar={onUpdateFocusGrammar}', 'onUpdateFocusGrammar={(g) => onUpdateFocusGrammar && onUpdateFocusGrammar(g)}')

with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
