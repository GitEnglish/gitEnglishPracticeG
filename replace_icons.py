import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Replace import statements
content = re.sub(
    r'// Icon Imports\n.*?(?=\n\s*// Exercise Components)',
    "// Icon Imports\n  import { Trash2, Settings, Play, X, ChevronLeft, ChevronRight, Wand2 } from 'lucide-svelte';",
    content,
    flags=re.DOTALL
)

# Replace icon components
content = content.replace('<TrashIcon', '<Trash2')
content = content.replace('</TrashIcon>', '</Trash2>')
content = content.replace('<SettingsIcon', '<Settings')
content = content.replace('</SettingsIcon>', '</Settings>')
content = content.replace('<PlayIcon', '<Play')
content = content.replace('</PlayIcon>', '</Play>')
content = content.replace('<XMarkIcon', '<X')
content = content.replace('</XMarkIcon>', '</X>')
content = content.replace('<ChevronLeftIcon', '<ChevronLeft')
content = content.replace('</ChevronLeftIcon>', '</ChevronLeft>')
content = content.replace('<ChevronRightIcon', '<ChevronRight')
content = content.replace('</ChevronRightIcon>', '</ChevronRight>')
content = content.replace('<MagicWandIcon', '<Wand2')
content = content.replace('</MagicWandIcon>', '</Wand2>')

with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
