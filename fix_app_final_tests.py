import re

with open('src/App.svelte', 'r') as f:
    content = f.read()

# Fix App.svelte mock data error. It was causing some crashes maybe?
content = re.sub(
    r'onFocusVocabularyChange=\{\(v\) => \{ globalFocusVocabulary = v; localStorage\.setItem\(',
    r'onFocusVocabularyChange={(v: string[]) => { globalFocusVocabulary = v; localStorage.setItem(',
    content
)
content = re.sub(
    r'onInclusionRateChange=\{\(r\) => \{ globalInclusionRate = r; localStorage\.setItem\(',
    r'onInclusionRateChange={(r: number) => { globalInclusionRate = r; localStorage.setItem(',
    content
)
content = re.sub(
    r'onFocusGrammarChange=\{\(g\) => \{ globalFocusGrammar = g; localStorage\.setItem\(',
    r'onFocusGrammarChange={(g: string[]) => { globalFocusGrammar = g; localStorage.setItem(',
    content
)
content = re.sub(
    r'onGrammarInclusionRateChange=\{\(r\) => \{ globalGrammarInclusionRate = r; localStorage\.setItem\(',
    r'onGrammarInclusionRateChange={(r: number) => { globalGrammarInclusionRate = r; localStorage.setItem(',
    content
)

with open('src/App.svelte', 'w') as f:
    f.write(content)
