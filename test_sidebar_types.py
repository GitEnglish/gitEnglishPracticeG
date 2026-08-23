with open('src/components/VocabularyFocus.svelte', 'r') as f:
    content = f.read()

print("VocabularyFocus Props:")
lines = content.split('\n')
for i, line in enumerate(lines[:30]):
    print(f"{i}: {line}")
