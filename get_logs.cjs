const playwright = require('playwright');
(async () => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);

    // Drag FITB
    const item = page.locator("div[role='button']:has-text('Fill-in-the-Blank')");
    const target = page.locator("main#whiteboard-main");
    await item.dragTo(target, {targetPosition: {x: 400, y: 400}});
    await page.waitForTimeout(1000);

    await browser.close();
})();
