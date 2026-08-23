import re

with open('src/App.svelte', 'r') as f:
    content = f.read()

content = re.sub(
    r'onFocusVocabularyChange=\{\(v\) =>',
    r'onFocusVocabularyChange={(v: string[]) =>',
    content
)
content = re.sub(
    r'onInclusionRateChange=\{\(r\) =>',
    r'onInclusionRateChange={(r: number) =>',
    content
)
content = re.sub(
    r'onFocusGrammarChange=\{\(g\) =>',
    r'onFocusGrammarChange={(g: string[]) =>',
    content
)
content = re.sub(
    r'onGrammarInclusionRateChange=\{\(r\) =>',
    r'onGrammarInclusionRateChange={(r: number) =>',
    content
)

with open('src/App.svelte', 'w') as f:
    f.write(content)
