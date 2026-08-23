import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Add definitions for onUpdateFocusVocabulary and onUpdateFocusGrammar in Sidebar component props
content = content.replace('onUpdateFocusVocabulary?: (vocab: string[]) => void;', 'onUpdateFocusVocabulary?: (vocab: string[]) => void;\n      onUpdateInclusionRate?: (rate: number) => void;')
content = content.replace('onUpdateFocusGrammar?: (grammar: string[]) => void;', 'onUpdateFocusGrammar?: (grammar: string[]) => void;\n      onUpdateGrammarInclusionRate?: (rate: number) => void;')

# wait, checking `check_sidebar_props2.py` output, they are ALREADY there:
# 45:       focusVocabulary?: string[];
# 46:       onUpdateFocusVocabulary?: (vocab: string[]) => void;
# 47:       inclusionRate?: number;
# 48:       onUpdateInclusionRate?: (rate: number) => void;
# 49:       focusGrammar?: string[];
# 50:       onUpdateFocusGrammar?: (grammar: string[]) => void;

# The errors are from using the optional callbacks without asserting they exist:
# `onUpdateFocusVocabulary && onUpdateFocusVocabulary(...)`
