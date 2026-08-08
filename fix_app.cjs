const fs = require('fs');

let appContent = fs.readFileSync('src/App.svelte', 'utf8');

// The App currently does this for handleAddBlock:
//   const handleAddBlock = (typeStr: string, x: number, y: number) => {
// It expects x and y. But clicking doesn't have an exact x/y drop target.
// Let's modify handleAddBlock to provide a fallback coordinate (like in legacy react App.tsx)

const legacyFallbackCode = `
          // Find a free spot if added via button/key (fallback)
          const PADDING = 50;
          const GRID_STEP = 50;
          let positionFound = false;
          finalPos = { x: PADDING, y: PADDING };

          // Simple search for non-overlapping space in the top-left area
          for (let y = PADDING; y < 3000 && !positionFound; y += GRID_STEP) {
            for (let x = PADDING; x < 3000 && !positionFound; x += GRID_STEP) {
               const newRect = { x: x, y: y, width: newBlockWidth, height: newBlockHeight };
               let hasOverlap = false;
`;

appContent = appContent.replace(
`  const handleAddBlock = (typeStr: string, x: number, y: number) => {
      const type = typeStr as ExerciseType;
      const newBlock: ExerciseBlockState = {
          id: nextId,
          exerciseType: type,
          x: x - 5000, // Offset due to whiteboard grid coordinate system (left/top -5000)
          y: y - 5000,
          width: 350,
          height: 250,
          zIndex: maxZIndex + 1,
          difficulty: globalDifficulty,
          tone: globalTone,
          theme: globalTheme || 'General English',
          focusVocabulary: [],
          inclusionRate: 0.5,
          focusGrammar: [],
          grammarInclusionRate: 0.5,
          isGenerated: false
      };
      blocks = [...blocks, newBlock];
  };`,
`  const handleAddBlock = (typeStr: string, dropX?: number, dropY?: number) => {
      const type = typeStr as ExerciseType;
      let finalX = 0;
      let finalY = 0;
      const width = 350;
      const height = 250;

      if (dropX !== undefined && dropY !== undefined) {
          finalX = Math.round(dropX - 5000); // Apply whiteboard offset
          finalY = Math.round(dropY - 5000);
      } else {
          // Find free position logic equivalent to React version
          // the legacy app used standard screen bounds, here the whiteboard origin is at -5000, -5000
          // Let's place it near the center of the current view by default, or just at a fixed offset
          // To be simple and match the "fallback" logic, let's put it around 0,0 relative to whiteboard center
          finalX = -5000 + 100;
          finalY = -5000 + 100;

          let positionFound = false;
          for (let y = 100; y < 3000 && !positionFound; y += 50) {
              for (let x = 100; x < 3000 && !positionFound; x += 50) {
                  const checkX = -5000 + x;
                  const checkY = -5000 + y;
                  let hasOverlap = false;
                  for (const block of blocks) {
                      if (
                          checkX < block.x + block.width &&
                          checkX + width > block.x &&
                          checkY < block.y + block.height &&
                          checkY + height > block.y
                      ) {
                          hasOverlap = true;
                          break;
                      }
                  }
                  if (!hasOverlap) {
                      finalX = checkX;
                      finalY = checkY;
                      positionFound = true;
                  }
              }
          }
      }

      const newBlock: ExerciseBlockState = {
          id: nextId,
          exerciseType: type,
          x: finalX,
          y: finalY,
          width,
          height,
          zIndex: maxZIndex + 1,
          difficulty: globalDifficulty,
          tone: globalTone,
          theme: globalTheme || 'General English',
          focusVocabulary: [],
          inclusionRate: 0.5,
          focusGrammar: [],
          grammarInclusionRate: 0.5,
          isGenerated: false
      };
      blocks = [...blocks, newBlock];
  };`
);

appContent = appContent.replace(
    `<Sidebar {isSidebarOpen} />`,
    `<Sidebar {isSidebarOpen} onAddExercise={(type) => handleAddBlock(type)} />`
);

fs.writeFileSync('src/App.svelte', appContent);

let sidebarContent = fs.readFileSync('src/components/Sidebar.svelte', 'utf8');

sidebarContent = sidebarContent.replace(
    `let { isSidebarOpen = true } = $props();`,
    `let { isSidebarOpen = true, onAddExercise } = $props<{ isSidebarOpen?: boolean; onAddExercise?: (type: string) => void; }>();`
);

sidebarContent = sidebarContent.replace(
    `class="cursor-grab hover:bg-slate-700 p-2 text-sm rounded transition-colors text-slate-300 flex items-center justify-between border border-slate-700/50"`,
    `class="cursor-grab hover:bg-slate-700 p-2 text-sm rounded transition-colors text-slate-300 flex items-center justify-between border border-slate-700/50" onclick={() => onAddExercise && onAddExercise(type)}`
);

fs.writeFileSync('src/components/Sidebar.svelte', sidebarContent);
