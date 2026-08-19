const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.svelte', 'utf8');

// The original UI used specific icons and styled the buttons very nicely.
// It looks like `ExerciseType.MultipleChoice` has `Difficulty.A2`, but in `screenshot_sidebar.png` it says `A1`.
// This is because `info.difficulty` doesn't exist, we must use `info.difficultyRating`?
// Let's check src/lib/exerciseInfo.ts.
const info = fs.readFileSync('src/lib/exerciseInfo.ts', 'utf8');
// Let's see what difficulty property exists
const match = info.match(/difficulty:\s*Difficulty\.([A-Za-z0-9_]+)/g);
// Yeah, it's `difficulty: Difficulty.A1`
// Wait, `DifficultyIndicatorIcon` expects `rating: string` which matches A1, A2 etc.
