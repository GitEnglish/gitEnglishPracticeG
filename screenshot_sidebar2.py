from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        # Click the PPP category in the sidebar to expand it
        page.click("text=PPP")
        time.sleep(1)

        # We need to simulate a drag and drop from the sidebar to the whiteboard
        # Let's get the bounding boxes
        sidebar_item = page.locator("text=Fill-in-the-Blank").first

        box = sidebar_item.bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()

        # Move to the center of the screen
        page.mouse.move(500, 500, steps=10)
        page.mouse.up()

        time.sleep(2)

        page.screenshot(path="screenshot_after_drag_real.png")

        # Now find the handle on the new block
        # The new block should be absolute positioned with a resize handle or we can just drag its corner
        # Rnd handles are usually classed
        block = page.locator(".will-change-transform").first
        if block.count() > 0:
             box = block.bounding_box()

             # The resize handle in the Svelte app using Framer Motion or similar might not have a handle explicitly
             # Let's check how ExerciseBlock handles resize. Oh wait, ExerciseBlock in Svelte doesn't have Rnd imported!

        browser.close()

run()
