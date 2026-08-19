const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.svelte', 'utf8');

content = content.replace(
    /rating=\{info\?\.difficulty \|\| 'A1'\}/g,
    `rating={info?.difficultyRating || 'A1'}`
);

fs.writeFileSync('src/components/Sidebar.svelte', content);
