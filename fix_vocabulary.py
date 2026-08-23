import re

# Update VocabularyFocus.svelte
with open('src/components/VocabularyFocus.svelte', 'r') as f:
    content = f.read()

content = content.replace('onFocusVocabularyChange =', 'onUpdateFocusVocabulary =')
content = content.replace('onInclusionRateChange =', 'onUpdateInclusionRate =')
content = content.replace('onFocusVocabularyChange(focusVocabulary)', 'onUpdateFocusVocabulary && onUpdateFocusVocabulary(focusVocabulary)')
content = content.replace('onInclusionRateChange(Number(e.currentTarget.value))', 'onUpdateInclusionRate && onUpdateInclusionRate(Number(e.currentTarget.value))')
content = content.replace('onFocusVocabularyChange?: (vocab: string[]) => void;', 'onUpdateFocusVocabulary?: (vocab: string[]) => void;')
content = content.replace('onInclusionRateChange?: (rate: number) => void;', 'onUpdateInclusionRate?: (rate: number) => void;')


with open('src/components/VocabularyFocus.svelte', 'w') as f:
    f.write(content)

# Update GrammarFocus.svelte
with open('src/components/GrammarFocus.svelte', 'r') as f:
    content = f.read()

content = content.replace('onFocusGrammarChange =', 'onUpdateFocusGrammar =')
content = content.replace('onGrammarInclusionRateChange =', 'onUpdateGrammarInclusionRate =')
content = content.replace('onFocusGrammarChange(focusGrammar)', 'onUpdateFocusGrammar && onUpdateFocusGrammar(focusGrammar)')
content = content.replace('onGrammarInclusionRateChange(Number(e.currentTarget.value))', 'onUpdateGrammarInclusionRate && onUpdateGrammarInclusionRate(Number(e.currentTarget.value))')
content = content.replace('onFocusGrammarChange?: (grammar: string[]) => void;', 'onUpdateFocusGrammar?: (grammar: string[]) => void;')
content = content.replace('onGrammarInclusionRateChange?: (rate: number) => void;', 'onUpdateGrammarInclusionRate?: (rate: number) => void;')


with open('src/components/GrammarFocus.svelte', 'w') as f:
    f.write(content)
