const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.svelte', 'utf8');

content = content.replace(
    /rating=\{info\?\.difficultyRating \|\| 1\}/g,
    `rating={info?.difficulty || 'A1'}`
);

fs.writeFileSync('src/components/Sidebar.svelte', content);
