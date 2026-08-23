from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        page.mouse.click(600, 400, button="right")
        time.sleep(1)

        page.mouse.click(600, 320)
        time.sleep(1)

        page.mouse.click(600, 320)
        time.sleep(1)

        # After it's added, let's grab it by its header and drag to make sure it's placed and then grab its resize handles.
        # Actually in Svelte we don't have Rnd, let me check how the block is being dragged.
        # ExerciseBlock.svelte has draggable={!isPresenting}
        # It's native HTML5 drag on the whole block.
        # Wait, how is resize implemented?

        page.screenshot(path="screenshot_final.png")
        browser.close()

run()
