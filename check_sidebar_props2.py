with open('src/components/Sidebar.svelte', 'r') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines[25:50]):
    print(f"{i+26}: {line}")
