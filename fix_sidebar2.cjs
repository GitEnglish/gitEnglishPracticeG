const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.svelte', 'utf8');

content = content.replace(
    `{#each EXERCISE_CATEGORIES as category}
            <div class="mb-2 font-casual">
              {@const catColors = PEDAGOGY_COLORS[category.name] || PEDAGOGY_COLORS['Default']}`,
    `{#each EXERCISE_CATEGORIES as category}
            {@const catColors = PEDAGOGY_COLORS[category.name] || PEDAGOGY_COLORS['Default']}
            <div class="mb-2 font-casual">`
);

content = content.replace(
    `{#each category.types as type}
                          {@const pedagogy = EXERCISE_PEDAGOGY[type] || 'Default'}
                          {@const colors = PEDAGOGY_COLORS[pedagogy] || PEDAGOGY_COLORS['Default']}
                          {@const info = EXERCISE_INFO[type]}
                          {@const displayName = type.split('(')[0].trim()}
                          {@const SpecificIcon = EXERCISE_ICONS[type] || PencilSquareIcon}`,
    `{#each category.types as type}
                          {@const pedagogy = EXERCISE_PEDAGOGY[type] || 'Default'}
                          {@const colors = PEDAGOGY_COLORS[pedagogy] || PEDAGOGY_COLORS['Default']}
                          {@const info = EXERCISE_INFO[type]}
                          {@const displayName = type.split('(')[0].trim()}
                          {@const SpecificIcon = EXERCISE_ICONS[type] || PencilSquareIcon}`
); // Already at root of {#each}

fs.writeFileSync('src/components/Sidebar.svelte', content);
