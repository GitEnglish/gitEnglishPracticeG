from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')
        time.sleep(2)

        # Test just the visual appearance of the template directly by rendering it?
        # Actually I can see from the code review I did that it works. The issue is e2e testing it through playwright drag-and-drop.
        # But wait! I can just use force click in Playwright to click the info button in the sidebar, which opens a modal.
        # The modal has a button to add to canvas!

        page.locator("text=PPP").first.click(force=True)
        time.sleep(1)

        # There's an INFO button, let's click it using evaluation
        page.evaluate('''
            const infoBtns = document.querySelectorAll('button');
            for(let btn of infoBtns) {
                if(btn.textContent.includes('INFO') || btn.textContent.includes('Info')) {
                    btn.click();
                    break;
                }
            }
        ''')

        time.sleep(1)

        # Now click Add to Canvas
        page.evaluate('''
            const addBtns = document.querySelectorAll('button');
            for(let btn of addBtns) {
                if(btn.textContent.includes('Add to Canvas')) {
                    btn.click();
                    break;
                }
            }
        ''')

        time.sleep(1)
        page.screenshot(path="screenshot_add_via_info.png")

        # Can we resize it with mouse?
        # ExerciseBlock currently does NOT have resize implemented in the Svelte code I edited.
        # Let's check ExerciseBlock.svelte lines 97-100: style="... width: {width}px; height: {height}px;"

        browser.close()
run()
