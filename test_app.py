from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        # Click the canvas to open radial menu and add a block that way
        page.mouse.click(500, 500)
        time.sleep(1)

        # Click PPP in radial
        page.mouse.click(500, 450)
        time.sleep(1)

        # Click FITB in radial
        page.mouse.click(500, 400)
        time.sleep(1)

        # Resize it by dragging bottom right corner of the block
        # Assuming the block centers roughly at 500, 500 initially
        # We need to find the block's resize handle.
        # Since it's Svelte Motion maybe there isn't a handle, let's just grab the block and pull if it resizes?
        # Actually ExerciseBlock has `class="handle"` on the header but the container is what resizes...
        # Svelte version is currently implementing drag via framer-motion, resize is maybe not implemented in Svelte yet or relies on CSS?
        # Wait, if resize is implemented, how is it done? In legacy it was Rnd.

        page.screenshot(path="screenshot_add_radial.png")
        browser.close()

run()
