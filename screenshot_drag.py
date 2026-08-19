from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto('http://localhost:3000/')
        page.wait_for_timeout(2000)

        fill_in_the_blank = page.locator("div[role='button']:has-text('Fill-in-the-Blank')")
        canvas = page.locator("main#whiteboard-main")

        fill_in_the_blank.drag_to(canvas, target_position={"x": 500, "y": 300})

        page.wait_for_timeout(1000)
        page.screenshot(path='screenshot_after_drag.png')
        browser.close()

run()
