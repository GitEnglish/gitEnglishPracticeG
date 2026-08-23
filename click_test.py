from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        # Open PPP
        page.locator("text=PPP").first.click()
        time.sleep(1)

        # Click the info button of the first item
        page.locator("text=INFO").first.click()
        time.sleep(1)

        # The Info modal has an "Add to Canvas" button. Let's see if we can click it.
        # It's an Info Modal.
        page.screenshot(path="screenshot_after_info_modal.png")

        # Click Add to Canvas
        add_btn = page.locator("text=Add to Canvas")
        if add_btn.count() > 0:
            add_btn.click()
            time.sleep(1)
            page.screenshot(path="screenshot_after_add_from_info.png")

            # Now let's try to simulate a resize. Since Svelte uses Framer Motion without Rnd, let's see how resizing works.
            # In legacy it used React-Rnd. Let's see if ExerciseBlock in Svelte has resize handlers.
            # Reading ExerciseBlock.svelte earlier, it just has absolute positioning and draggable. It doesn't seem to implement resizing yet in the Svelte version!
            # Wait, let me check the Svelte ExerciseBlock code.

        browser.close()

run()
