import re

with open('src/App.svelte', 'r') as f:
    content = f.read()

# Fix App.svelte Sidebar invocation - ensure all destructured prop errors in App.svelte are cleared. It might be complaining about Sidebar missing some props or App passing the wrong ones.
# Looking closely at the errors, it seems Sidebar isn't fully exporting these or something. Wait, App.svelte is the problem now because I passed 'onFocusVocabularyChange' and the type definition of Sidebar.svelte didn't pick it up, or App is using old names.
# Actually I see Sidebar has:
# let {
#    blocks,
#    onClearBoard,
#    focusVocabulary,
#    onFocusVocabularyChange,
#    ...
# } = $props<{

content = re.sub(
    r'onFocusVocabularyChange=\{\(v: string\[\]\) => \{ globalFocusVocabulary = v; localStorage\.setItem\(\'practiceGenie-focusVocabulary\', JSON\.stringify\(v\)\); \}\}',
    r'onFocusVocabularyChange={(v) => { globalFocusVocabulary = v; localStorage.setItem(\'practiceGenie-focusVocabulary\', JSON.stringify(v)); }}',
    content
)
content = re.sub(
    r'onInclusionRateChange=\{\(r: number\) => \{ globalInclusionRate = r; localStorage\.setItem\(\'practiceGenie-inclusionRate\', r\.toString\(\)\); \}\}',
    r'onInclusionRateChange={(r) => { globalInclusionRate = r; localStorage.setItem(\'practiceGenie-inclusionRate\', r.toString()); }}',
    content
)
content = re.sub(
    r'onFocusGrammarChange=\{\(g: string\[\]\) => \{ globalFocusGrammar = g; localStorage\.setItem\(\'practiceGenie-focusGrammar\', JSON\.stringify\(g\)\); \}\}',
    r'onFocusGrammarChange={(g) => { globalFocusGrammar = g; localStorage.setItem(\'practiceGenie-focusGrammar\', JSON.stringify(g)); }}',
    content
)
content = re.sub(
    r'onGrammarInclusionRateChange=\{\(r: number\) => \{ globalGrammarInclusionRate = r; localStorage\.setItem\(\'practiceGenie-grammarInclusionRate\', r\.toString\(\)\); \}\}',
    r'onGrammarInclusionRateChange={(r) => { globalGrammarInclusionRate = r; localStorage.setItem(\'practiceGenie-grammarInclusionRate\', r.toString()); }}',
    content
)

with open('src/App.svelte', 'w') as f:
    f.write(content)
