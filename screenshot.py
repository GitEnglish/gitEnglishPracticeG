from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        # Give it a bit to render
        time.sleep(2)

        # Look for the radial menu and click it
        page.click("button:has(svg)")

        time.sleep(1)

        # Click the Add Block button (PPP one)
        buttons = page.query_selector_all("button")
        for btn in buttons:
             if 'FITB' in btn.inner_text() or 'PPP' in btn.inner_text():
                  btn.click()
                  break

        time.sleep(1)

        page.screenshot(path="screenshot1.png")

        # Now let's try to drag to resize it to see the skeletons update
        # Just grab the bottom right corner of a block.
        # Rnd handles are usually classed
        handle = page.query_selector(".react-resizable-handle-se, .handle, .resize-handle")
        if handle:
             box = handle.bounding_box()
             page.mouse.move(box["x"] + 5, box["y"] + 5)
             page.mouse.down()
             page.mouse.move(box["x"] + 5, box["y"] + 300)
             page.mouse.up()

        time.sleep(1)
        page.screenshot(path="screenshot2.png")

        browser.close()

run()
