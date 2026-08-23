from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        page.goto('http://localhost:3001/')
        time.sleep(2)

        # In Sidebar, each sub-item is an <li> that looks like it might have a drag event. But wait, if drag doesn't work, let's see if click works on them in Sidebar.
        page.click("text=PPP")
        time.sleep(1)

        # Click the info button of the first item
        page.click("text=INFO")
        time.sleep(1)

        page.screenshot(path="screenshot_after_info.png")

        browser.close()

run()
