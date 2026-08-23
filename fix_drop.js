const fs = require('fs');

let content = fs.readFileSync('src/components/Whiteboard.svelte', 'utf8');

content = content.replace(
    "const handleDrop = (e: DragEvent) => {",
    "const handleDrop = (e: DragEvent) => {\n    e.preventDefault();\n    console.log('Drop event fired', e.dataTransfer?.getData('exercise-type'));"
)

fs.writeFileSync('src/components/Whiteboard.svelte', content);
