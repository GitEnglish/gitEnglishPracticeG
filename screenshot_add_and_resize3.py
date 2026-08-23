from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3001/')

        time.sleep(2)

        page.evaluate('''
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('exercise-type', 'FITB');

            const dropEvent = new DragEvent('drop', {
                clientX: 500,
                clientY: 500,
                dataTransfer: dataTransfer
            });

            // Whiteboard component has class "bg-slate-50 absolute inset-0 ..." Let's try dispatching on that div
            const whiteboard = document.querySelector('.absolute.inset-0.overflow-hidden');
            if (whiteboard) whiteboard.dispatchEvent(dropEvent);
        ''')

        time.sleep(2)

        page.screenshot(path="screenshot_drop_whiteboard.png")

        browser.close()

run()
