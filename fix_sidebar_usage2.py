import re

with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Let's fix lines 188-197 again
# Currently they look like:
#                 onUpdateFocusVocabulary={(v) => onUpdateFocusVocabulary && onUpdateFocusVocabulary(v)}
#                 {inclusionRate}
#                 onUpdateInclusionRate={(r) => onUpdateInclusionRate && onUpdateInclusionRate(r)}
#             />
#
#             <GrammarFocus
#                 {focusGrammar}
#                 onUpdateFocusGrammar={(g) => onUpdateFocusGrammar && onUpdateFocusGrammar(g)}
#                 {grammarInclusionRate}
#                 onUpdateGrammarInclusionRate={(r) => onUpdateGrammarInclusionRate && onUpdateGrammarInclusionRate(r)}
#             />

content = content.replace(
'''                  onUpdateFocusVocabulary={(v) => onUpdateFocusVocabulary && onUpdateFocusVocabulary(v)}''',
'''                  onUpdateFocusVocabulary={onUpdateFocusVocabulary || (() => {})}'''
)
content = content.replace(
'''                  onUpdateInclusionRate={(r) => onUpdateInclusionRate && onUpdateInclusionRate(r)}''',
'''                  onUpdateInclusionRate={onUpdateInclusionRate || (() => {})}'''
)
content = content.replace(
'''                  onUpdateFocusGrammar={(g) => onUpdateFocusGrammar && onUpdateFocusGrammar(g)}''',
'''                  onUpdateFocusGrammar={onUpdateFocusGrammar || (() => {})}'''
)
content = content.replace(
'''                  onUpdateGrammarInclusionRate={(r) => onUpdateGrammarInclusionRate && onUpdateGrammarInclusionRate(r)}''',
'''                  onUpdateGrammarInclusionRate={onUpdateGrammarInclusionRate || (() => {})}'''
)

with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
