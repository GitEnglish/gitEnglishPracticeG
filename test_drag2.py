from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")

        page.wait_for_selector("text=gitEnglish", timeout=5000)

        # First add a block
        drag_button = page.get_by_role("button", name="Add Fill-in-the-Blank exercise")
        box = drag_button.bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        page.wait_for_timeout(500)
        page.mouse.move(600, 400, steps=10)
        page.wait_for_timeout(500)
        page.mouse.up()
        page.wait_for_timeout(1000)

        page.screenshot(path="screenshot_test_block_spawned.png")

        # Now simulate a drag from the whiteboard block
        box = page.locator("[aria-roledescription='exercise block']").first.bounding_box()
        if box:
            page.mouse.move(box["x"] + 20, box["y"] + 20)
            page.mouse.down()
            page.wait_for_timeout(500)

            # Move mouse
            page.mouse.move(box["x"] + 150, box["y"] + 150, steps=10)
            page.wait_for_timeout(500)

            # Drop
            page.mouse.up()
            page.wait_for_timeout(1000)

            page.screenshot(path="screenshot_test_block_moved.png")

        browser.close()

if __name__ == "__main__":
    run()
