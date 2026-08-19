const fs = require('fs');

let appContent = fs.readFileSync('src/App.svelte', 'utf8');

// The radial menu was taking up the center of the screen, we're going to remove it from App.svelte
appContent = appContent.replace(/import RadialMenu from '\.\/components\/RadialMenu\.svelte';\n/g, '');
appContent = appContent.replace(/<RadialMenu[\s\S]*?\/>/g, '');

fs.writeFileSync('src/App.svelte', appContent);

let whiteboardContent = fs.readFileSync('src/components/Whiteboard.svelte', 'utf8');
// Fix the Whiteboard offset drop calculation
// The drop coordinate needs to take into account that the background element is translated
// e.clientX gives window coordinates.
// background is at -5000 + pan.x + (scale transform offset)
// In the legacy_react app, the background was just at 0, 0, and the container took up the whole screen.
// Wait, the legacy handleDrop logic:
// const x = (e.clientX - rect.left - pan.x) / scale;
// If the background is shifted by -5000, we must add 5000 to the x and y to place it visually where the mouse is!
whiteboardContent = whiteboardContent.replace(
    /const x = \(e\.clientX - rect\.left - pan\.x\) \/ scale;/g,
    `const x = (e.clientX - rect.left - pan.x) / scale + 5000;`
);
whiteboardContent = whiteboardContent.replace(
    /const y = \(e\.clientY - rect\.top - pan\.y\) \/ scale;/g,
    `const y = (e.clientY - rect.top - pan.y) / scale + 5000;`
);
// Make sure it doesn't break the first one that had offsets
whiteboardContent = whiteboardContent.replace(
    /const x = \(e\.clientX - rect\.left - pan\.x\) \/ scale \+ 5000 - offsetX;/g,
    `const x = (e.clientX - rect.left - pan.x) / scale + 5000 - offsetX;`
);
whiteboardContent = whiteboardContent.replace(
    /const y = \(e\.clientY - rect\.top - pan\.y\) \/ scale \+ 5000 - offsetY;/g,
    `const y = (e.clientY - rect.top - pan.y) / scale + 5000 - offsetY;`
);
fs.writeFileSync('src/components/Whiteboard.svelte', whiteboardContent);

// And we need to undo the App.svelte finalX/finalY + 5000 offset we added in fix_app2, because if Whiteboard is providing the +5000 correctly, App.svelte shouldn't ALSO add 5000...
// Wait, actually, let's keep the whiteboard providing the +5000 since it controls the visual layer! So Whiteboard passes 5500, App takes 5500.
let appContent2 = fs.readFileSync('src/App.svelte', 'utf8');
appContent2 = appContent2.replace(
    /finalX = Math\.round\(dropX \+ 5000 - width\/2\); \/\/ Apply whiteboard offset/g,
    `finalX = Math.round(dropX - width/2); // Offset already handled by Whiteboard`
);
appContent2 = appContent2.replace(
    /finalY = Math\.round\(dropY \+ 5000 - height\/2\);/g,
    `finalY = Math.round(dropY - height/2);`
);
fs.writeFileSync('src/App.svelte', appContent2);
