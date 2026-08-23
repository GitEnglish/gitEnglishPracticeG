import re

with open('src/components/GrammarFocus.svelte', 'r') as f:
    content = f.read()

content = re.sub(
    r'let {\n\s*focusGrammar,\n\s*setFocusGrammar,\n\s*grammarInclusionRate,\n\s*setGrammarInclusionRate\n} = \$props<\{',
    r'let {\n    focusGrammar,\n    onFocusGrammarChange,\n    grammarInclusionRate,\n    onGrammarInclusionRateChange\n  } = $props<{',
    content
)

content = re.sub(
    r'setFocusGrammar: \(g: string\[\]\) => void;\n\s*grammarInclusionRate: number;\n\s*setGrammarInclusionRate: \(r: number\) => void;',
    r'onFocusGrammarChange: (g: string[]) => void;\n    grammarInclusionRate: number;\n    onGrammarInclusionRateChange: (r: number) => void;',
    content
)

content = re.sub(
    r'onUpdateFocusGrammar && onUpdateFocusGrammar',
    r'onFocusGrammarChange && onFocusGrammarChange',
    content
)

content = re.sub(
    r'setFocusGrammar\(focusGrammar\.filter\(g => g !== grammarToRemove\)\)',
    r'onFocusGrammarChange(focusGrammar.filter(g => g !== grammarToRemove))',
    content
)
content = re.sub(
    r'setFocusGrammar\(\[...focusGrammar, newGrammar\.trim\(\)\]\)',
    r'onFocusGrammarChange([...focusGrammar, newGrammar.trim()])',
    content
)
content = re.sub(
    r'setGrammarInclusionRate\(Number\(\(e\.target as HTMLInputElement\)\.value\)\)',
    r'onGrammarInclusionRateChange(Number((e.target as HTMLInputElement).value))',
    content
)

with open('src/components/GrammarFocus.svelte', 'w') as f:
    f.write(content)
