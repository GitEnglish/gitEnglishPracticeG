from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        page.locator("text=PPP").first.click()
        time.sleep(1)

        # Try a different way to dispatch drag events since native drag is tricky in playwright

        page.evaluate('''
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('exercise-type', 'FITB');

            const dropEvent = new DragEvent('drop', {
                clientX: 500,
                clientY: 500,
                dataTransfer: dataTransfer
            });

            document.querySelector('.canvas-bg').dispatchEvent(dropEvent);
        ''')

        time.sleep(2)
        page.screenshot(path="screenshot_after_drop.png")

        browser.close()

run()
