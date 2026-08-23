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

        # We need to simulate a drag and drop onto the whiteboard
        exercise = page.locator("text=FITB").first
        whiteboard = page.locator(".whiteboard-container")
        if whiteboard.count() == 0:
             # Just drag it to the center of the screen
             exercise.drag_to(page.locator("body"))
        else:
             exercise.drag_to(whiteboard)

        time.sleep(1)

        page.screenshot(path="screenshot_drag.png")

        # Now try to expand the block by simulating a resize
        # Get the new block's bounds
        block = page.locator(".react-draggable").first
        if block.count() > 0:
             box = block.bounding_box()
             page.mouse.move(box["x"] + box["width"] - 5, box["y"] + box["height"] - 5)
             page.mouse.down()
             page.mouse.move(box["x"] + box["width"] - 5, box["y"] + box["height"] + 400)
             page.mouse.up()

             time.sleep(1)
             page.screenshot(path="screenshot_resized.png")

        browser.close()

run()
