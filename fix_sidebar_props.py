import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Fix VocabularyFocus props in Sidebar.svelte
content = content.replace('onUpdateFocusVocabulary={(v) => onUpdateFocusVocabulary && onUpdateFocusVocabulary(v)}', 'onUpdateFocusVocabulary={onUpdateFocusVocabulary}')
content = content.replace('onUpdateInclusionRate={(r) => onUpdateInclusionRate && onUpdateInclusionRate(r)}', 'onUpdateInclusionRate={onUpdateInclusionRate}')

# Fix GrammarFocus props in Sidebar.svelte
content = content.replace('onUpdateFocusGrammar={(g) => onUpdateFocusGrammar && onUpdateFocusGrammar(g)}', 'onUpdateFocusGrammar={onUpdateFocusGrammar}')
content = content.replace('onUpdateGrammarInclusionRate={(r) => onUpdateGrammarInclusionRate && onUpdateGrammarInclusionRate(r)}', 'onUpdateGrammarInclusionRate={onUpdateGrammarInclusionRate}')


with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
