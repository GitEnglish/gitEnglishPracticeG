import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

content = content.replace('onFocusVocabularyChange={(v) => onFocusVocabularyChange(v)}', 'onUpdateFocusVocabulary={(v) => onUpdateFocusVocabulary && onUpdateFocusVocabulary(v)}')
content = content.replace('onInclusionRateChange={(r) => onInclusionRateChange(r)}', 'onUpdateInclusionRate={(r) => onUpdateInclusionRate && onUpdateInclusionRate(r)}')
content = content.replace('onFocusGrammarChange={(g) => onFocusGrammarChange(g)}', 'onUpdateFocusGrammar={(g) => onUpdateFocusGrammar && onUpdateFocusGrammar(g)}')
content = content.replace('onGrammarInclusionRateChange={(r) => onGrammarInclusionRateChange(r)}', 'onUpdateGrammarInclusionRate={(r) => onUpdateGrammarInclusionRate && onUpdateGrammarInclusionRate(r)}')

with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
