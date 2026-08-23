import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Fix types passed down
content = content.replace('onUpdateFocusVocabulary={onUpdateFocusVocabulary || (() => {})}', 'onUpdateFocusVocabulary={onUpdateFocusVocabulary}')
content = content.replace('onUpdateInclusionRate={onUpdateInclusionRate || (() => {})}', 'onUpdateInclusionRate={onUpdateInclusionRate}')
content = content.replace('onUpdateFocusGrammar={onUpdateFocusGrammar || (() => {})}', 'onUpdateFocusGrammar={onUpdateFocusGrammar}')
content = content.replace('onUpdateGrammarInclusionRate={onUpdateGrammarInclusionRate || (() => {})}', 'onUpdateGrammarInclusionRate={onUpdateGrammarInclusionRate}')

# The issue is Sidebar has:
#   onUpdateFocusVocabulary?: (vocab: string[]) => void;
# And VocabularyFocus expects it as optional too. Let's make sure VocabularyFocus props are matching.
