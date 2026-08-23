from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')
        time.sleep(2)

        # Test just the visual appearance of the template directly by rendering it?
        # Actually I can see from the code review I did that it works. The issue is e2e testing it through playwright drag-and-drop.
        # But wait! I can just use force click in Playwright to click the info button

        page.locator("text=PPP").first.click(force=True)
        time.sleep(1)

        page.locator("text=INFO").first.click(force=True)
        time.sleep(1)

        page.screenshot(path="screenshot_forced.png")
        browser.close()
run()
