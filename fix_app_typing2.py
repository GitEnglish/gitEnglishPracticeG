import re

with open('src/App.svelte', 'r') as f:
    content = f.read()

# Fix App.svelte mock data error. Svelte 5 expects proper component prop mappings when using $props.
content = re.sub(
    r'onFocusVocabularyChange=\{\(v: string\[\]\) => \{',
    r'onFocusVocabularyChange={(v) => {',
    content
)
content = re.sub(
    r'onInclusionRateChange=\{\(r: number\) => \{',
    r'onInclusionRateChange={(r) => {',
    content
)
content = re.sub(
    r'onFocusGrammarChange=\{\(g: string\[\]\) => \{',
    r'onFocusGrammarChange={(g) => {',
    content
)
content = re.sub(
    r'onGrammarInclusionRateChange=\{\(r: number\) => \{',
    r'onGrammarInclusionRateChange={(r) => {',
    content
)

with open('src/App.svelte', 'w') as f:
    f.write(content)
