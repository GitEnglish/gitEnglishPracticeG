const fs = require('fs');

// In App.svelte:
// x: x - 5000 is for when x is in viewport coordinates (like 500), Whiteboard is rendered offset by 5000.
// BUT Whiteboard drop target computes:
// const x = (e.clientX - rect.left - pan.x) / scale;
// Whiteboard background has: left: -5000px, top: -5000px.
// Wait, the Whiteboard has a background element with `-5000px`.
// When e.clientX is used, we get a value around 500. `rect.left` is the Whiteboard's bounds.
// The `Whiteboard` component itself uses `onAddBlock` with these values.
// In `legacy_react`, handleDrop was:
// const x = (e.clientX - rect.left - pan.x) / scale;
// ... onAddBlock(type, x, y)
// And in App.tsx:
// let positionFound = false;
// finalPos = { x: Math.max(0, dropX - newBlockWidth / 2), y: Math.max(0, dropY - newBlockHeight / 2) }
// And the block was rendered with `style={{ left: x, top: y }}` in `Whiteboard.tsx`.
// BUT in Svelte port, `App.svelte` did:
// finalX = Math.round(dropX - 5000); // Apply whiteboard offset
// This implies the Svelte dev thought that `x` needed an offset. If `Whiteboard` background is at -5000,
// then a block rendered inside it with `left: 0` will appear at `-5000` relative to the container!
// Actually, `legacy_react/components/Whiteboard.tsx` had:
// <div className="absolute ... origin-top-left" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
// Oh, the legacy react app didn't use a `-5000px` background origin. It just started at 0.
// The Svelte version introduced a `10000x10000` grid at `left: -5000px, top: -5000px`.
// This means if I want a block to appear under the mouse (where `e.clientX - rect.left` is 500),
// I need `x` inside the background element to be `5000 + 500 = 5500`.
// Because the background is shifted by -5000, `5500 - 5000 = +500` visible.
// So `dropX` is 500, we should SET `finalX = dropX + 5000`. Wait.
// Let's look at Whiteboard.svelte:
/*
          const x = (e.clientX - rect.left - pan.x) / scale;
          const y = (e.clientY - rect.top - pan.y) / scale;
          onAddBlock(exerciseType, Math.round(x), Math.round(y));
*/
// And App.svelte had:
// finalX = dropX - 5000
// That means it was at `500 - 5000 = -4500` inside the container.
// The container is at -5000. So `left: -4500` means it's shifted 4500 pixels right of -5000, which is `x: -500` in the window. That's outside the view!
// If we want it at `500` in the window, it needs to be `5000 + 500 = 5500` inside the container.
// So `finalX = dropX + 5000`.

let appContent = fs.readFileSync('src/App.svelte', 'utf8');

appContent = appContent.replace(
    /finalX = Math\.round\(dropX - 5000\); \/\/ Apply whiteboard offset/g,
    `finalX = Math.round(dropX + 5000 - width/2); // Apply whiteboard offset`
);
appContent = appContent.replace(
    /finalY = Math\.round\(dropY - 5000\);/g,
    `finalY = Math.round(dropY + 5000 - height/2);`
);

// We need to fix the case where dropX is undefined (clicking from sidebar)
// It was doing:
/*
          finalX = -5000 + 100;
          finalY = -5000 + 100;
*/
// It should be 5000 + 100 to be at `100` window coordinates!
appContent = appContent.replace(
    /finalX = -5000 \+ 100;/g,
    `finalX = 5000 + 100;`
);
appContent = appContent.replace(
    /finalY = -5000 \+ 100;/g,
    `finalY = 5000 + 100;`
);
appContent = appContent.replace(
    /checkX = -5000 \+ x;/g,
    `checkX = 5000 + x;`
);
appContent = appContent.replace(
    /checkY = -5000 \+ y;/g,
    `checkY = 5000 + y;`
);


fs.writeFileSync('src/App.svelte', appContent);

// Wait, why was drag failing?
// The Whiteboard check:
// const exerciseType = e.dataTransfer?.getData('exercise-type');
// But in standard HTML5 Drag & Drop, dropping a button doesn't always work if it's not setup correctly.
// Also, Whiteboard.svelte has:
//   ondragover={(e) => e.preventDefault()}
// That's required for dropping.
// Does sidebar setup dataTransfer properly?
// e.dataTransfer?.setData('exercise-type', type) is used ondragstart.
// That should work. Let's test again now that coordinates are fixed!
