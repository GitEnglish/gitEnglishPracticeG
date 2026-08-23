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

        # Now click the first exercise type inside it
        page.click("text=FITB")
        time.sleep(1)

        page.screenshot(path="screenshot_sidebar_click.png")

        browser.close()

run()
