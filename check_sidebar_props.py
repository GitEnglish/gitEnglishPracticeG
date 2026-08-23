with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines[:30]):
    print(f"{i+1}: {line}")
