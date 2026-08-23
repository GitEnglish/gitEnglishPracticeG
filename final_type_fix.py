with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

# Let's completely remove the callbacks if they don't exist in ComponentProps
# We don't actually need them inline on the components, we can just use the function passed in
content = content.replace('onUpdateFocusVocabulary={onUpdateFocusVocabulary as any}', 'onUpdateFocusVocabulary={onUpdateFocusVocabulary}')
content = content.replace('onUpdateFocusGrammar={onUpdateFocusGrammar as any}', 'onUpdateFocusGrammar={onUpdateFocusGrammar}')

with open('src/components/Sidebar.svelte', 'w') as f:
    f.write(content)
