from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        # Click add block button directly instead of using radial menu because radial menu is hidden behind canvas maybe?

        # We need to simulate a drag from the Sidebar
        # Actually in App.svelte there is a global onDragStart which sets the dataTransfer. Let's see if we can trigger the add block directly via evaluating a function on window.
        page.evaluate('''
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('exercise-type', 'FITB');

            const dropEvent = new DragEvent('drop', {
                clientX: 500,
                clientY: 500,
                dataTransfer: dataTransfer
            });

            // App.svelte binds ondrop to the window or a top level div? Let's dispatch to document.body
            document.body.dispatchEvent(dropEvent);
        ''')

        time.sleep(1)

        # Take a screenshot to see if it dropped
        page.screenshot(path="screenshot_drop_body.png")

        browser.close()

run()
