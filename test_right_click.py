from playwright.sync_api import sync_playwright
import time

def test_right_click():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto('http://localhost:3000/')

        # Wait for canvas to be ready
        page.wait_for_selector('.bg-slate-50', timeout=10000)
        time.sleep(1) # wait for animations

        # Right click in the middle of the screen
        page.mouse.click(640, 360, button='right')
        time.sleep(1)

        # Click the first radial menu item if it exists, or just screenshot the menu
        page.screenshot(path='screenshot_menu.png')
        print("Menu screenshot taken")

        # Try to click on an exercise button in the radial menu
        # Looking at previous structure, maybe it's an SVG or button
        buttons = page.locator('button')
        print(f"Found {buttons.count()} buttons")

        # Find one that might be a radial menu item
        for i in range(buttons.count()):
            try:
                text = buttons.nth(i).inner_text()
                # Print button texts to help debugging
                # print(f"Button {i}: {text}")
                if "Picture" in text or "Dialogue" in text or "Notice" in text:
                    buttons.nth(i).click()
                    print(f"Clicked {text}")
                    time.sleep(2)
                    page.screenshot(path='screenshot_block.png')
                    break
            except:
                pass

        browser.close()

if __name__ == '__main__':
    test_right_click()
