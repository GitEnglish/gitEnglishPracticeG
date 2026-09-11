from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3000/')
        page.wait_for_selector('text=Practice Genie', timeout=5000)

        # Open a category to see exercise blocks
        # page.click('text=PPP')

        # Try to drag an exercise block
        exercise = page.locator('text=Fill-in-the-Blank').first
        whiteboard = page.locator('#whiteboard-main')

        exercise.drag_to(whiteboard)
        page.screenshot(path='screenshot_after_drag_test.png')
        print("Dragged. Checking blocks...")

        # Click
        exercise.click()
        page.screenshot(path='screenshot_after_click_test.png')
        print("Clicked. Checking blocks...")

        blocks = page.locator('[role="region"][aria-roledescription="exercise block"]').count()
        print(f"Number of exercise blocks: {blocks}")

        browser.close()

if __name__ == '__main__':
    run()
