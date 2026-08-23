import re

with open('src/App.svelte', 'r') as f:
    content = f.read()

content = content.replace('onFocusVocabularyChange={(v) => { globalFocusVocabulary = v; localStorage.setItem(\'practiceGenie-focusVocabulary\', JSON.stringify(v)); }}', 'onUpdateFocusVocabulary={(v: string[]) => { globalFocusVocabulary = v; localStorage.setItem(\'practiceGenie-focusVocabulary\', JSON.stringify(v)); }}')
content = content.replace('onInclusionRateChange={(r) => { globalInclusionRate = r; localStorage.setItem(\'practiceGenie-inclusionRate\', r.toString()); }}', 'onUpdateInclusionRate={(r: number) => { globalInclusionRate = r; localStorage.setItem(\'practiceGenie-inclusionRate\', r.toString()); }}')
content = content.replace('onFocusGrammarChange={(g) => { globalFocusGrammar = g; localStorage.setItem(\'practiceGenie-focusGrammar\', JSON.stringify(g)); }}', 'onUpdateFocusGrammar={(g: string[]) => { globalFocusGrammar = g; localStorage.setItem(\'practiceGenie-focusGrammar\', JSON.stringify(g)); }}')
content = content.replace('onGrammarInclusionRateChange={(r) => { globalGrammarInclusionRate = r; localStorage.setItem(\'practiceGenie-grammarInclusionRate\', r.toString()); }}', 'onUpdateGrammarInclusionRate={(r: number) => { globalGrammarInclusionRate = r; localStorage.setItem(\'practiceGenie-grammarInclusionRate\', r.toString()); }}')

with open('src/App.svelte', 'w') as f:
    f.write(content)
