from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')
        time.sleep(2)

        # Test just the visual appearance of the template directly by rendering it?
        page.evaluate('''
            const evt = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: 500,
                clientY: 500
            });
            document.querySelector('.whiteboard-container').dispatchEvent(evt);
        ''')

        time.sleep(1)

        page.locator("text=PPP").first.click(force=True)
        time.sleep(1)

        page.locator("text=Fill-in-the-Blank").first.click(force=True)
        time.sleep(1)

        page.screenshot(path="screenshot_radial.png")

        # Now we have a block! Try to resize it by updating state manually since playwright drag is hard
        page.evaluate('''
            // It's hard to update Svelte state from outside, but we can just use CSS to resize the wrapper to see if it recalculates... No, derived state only runs if the Svelte state changes.
        ''')

        browser.close()
run()
