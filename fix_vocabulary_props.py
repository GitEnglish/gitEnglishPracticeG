with open('src/components/VocabularyFocus.svelte', 'r') as f:
    content = f.read()

content = content.replace('onFocusVocabularyChange:', 'onUpdateFocusVocabulary:')
content = content.replace('onInclusionRateChange:', 'onUpdateInclusionRate:')
content = content.replace('setFocusVocabulary,', 'onUpdateFocusVocabulary,')
content = content.replace('setInclusionRate', 'onUpdateInclusionRate')
content = content.replace('setFocusVocabulary(', 'onUpdateFocusVocabulary(')
content = content.replace('setInclusionRate(', 'onUpdateInclusionRate(')

with open('src/components/VocabularyFocus.svelte', 'w') as f:
    f.write(content)


with open('src/components/GrammarFocus.svelte', 'r') as f:
    content = f.read()

content = content.replace('onFocusGrammarChange:', 'onUpdateFocusGrammar:')
content = content.replace('onGrammarInclusionRateChange:', 'onUpdateGrammarInclusionRate:')
content = content.replace('setFocusGrammar,', 'onUpdateFocusGrammar,')
content = content.replace('setGrammarInclusionRate', 'onUpdateGrammarInclusionRate')
content = content.replace('setFocusGrammar(', 'onUpdateFocusGrammar(')
content = content.replace('setGrammarInclusionRate(', 'onUpdateGrammarInclusionRate(')


with open('src/components/GrammarFocus.svelte', 'w') as f:
    f.write(content)
