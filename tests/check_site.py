"""Browser checks for PRY's scene navigation. Requires the Playwright test dependency."""
import functools
import http.server
import json
import os
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "qa"
OUTPUT.mkdir(exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def selected(page):
    return page.locator("body").get_attribute("data-scene")


def settled(page, name):
    page.wait_for_function("name => document.body.dataset.scene === name", arg=name)
    page.wait_for_timeout(1100)


def check_bounds(page):
    return page.evaluate("""() => {
      const scene = document.querySelector('.scene.is-current');
      const footer = document.querySelector('.site-footer').getBoundingClientRect();
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const copy = scene.querySelector('.copy, .soon-copy');
      const targets = [...copy.querySelectorAll('h1,h2,.description,.soon-description,.button'), ...scene.querySelectorAll('.visual,.work-visual p,.workbench-footer,.benefit a,.principle-tabs button,.principle-panel')]
        .filter(el => el.checkVisibility());
      return {
        documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        scrollY,
        overflow: targets.filter(el => {
          const r = el.getBoundingClientRect();
          return r.left < -1 || r.right > innerWidth + 1 || r.top < header.bottom - 1 || r.bottom > footer.top + 2;
        }).map(el => ({text: el.textContent.trim().slice(0,60), rect: el.getBoundingClientRect().toJSON()}))
      };
    }""")


def main():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    errors = []
    failures = []
    checks = {}
    with sync_playwright() as pw:
        options = {"headless": True, "chromium_sandbox": True}
        if os.environ.get("PRY_BROWSER_EXECUTABLE"):
            options["executable_path"] = os.environ["PRY_BROWSER_EXECUTABLE"]
        browser = pw.chromium.launch(**options)
        page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("response", lambda response: failures.append(response.url) if response.status >= 400 else None)
        page.goto(base)
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(1100)
        assert selected(page) == "start"
        page.screenshot(path=str(OUTPUT / "desktop-start.png"))
        page.mouse.wheel(0, 600)
        settled(page, "why")
        page.mouse.wheel(0, -600)
        settled(page, "start")
        page.get_by_role("link", name="Почему PRY", exact=True).click()
        settled(page, "why")
        assert page.locator(".benefit").count() == 4
        page.locator(".benefit a").first.click()
        settled(page, "models")
        checks["why_pry_and_benefit_links"] = True
        page.locator("[data-model='Ollama']").click()
        assert page.locator("#model-note").inner_text() == "Локальная модель"
        checks["model_selector"] = True
        page.evaluate("""async () => {
          for (let i=0;i<40;i++) {
            document.dispatchEvent(new WheelEvent('wheel',{deltaY:100,cancelable:true}));
            await new Promise(resolve=>setTimeout(resolve,30));
          }
        }""")
        assert selected(page) == "memory"
        assert page.evaluate("scrollY") == 0
        checks["one_scene_per_wheel_gesture"] = True
        page.wait_for_timeout(250)
        page.mouse.wheel(0, 600)
        settled(page, "work")
        page.get_by_role("tab", name="02 Изменения").click()
        assert page.locator("#panel-changes").is_visible()
        page.keyboard.press("ArrowRight")
        assert page.locator("#panel-checks").is_visible()
        checks["scenario_tabs_and_keyboard"] = True
        page.locator(".scene-nav [href='#principles']").click()
        settled(page, "principles")
        page.locator("#principle-tab-control").focus()
        page.keyboard.press("ArrowRight")
        assert page.locator("#principle-evidence").is_visible()
        page.keyboard.press("ArrowDown")
        assert page.locator("#principle-alternatives").is_visible()
        page.keyboard.press("End")
        assert page.locator("#principle-experience").is_visible()
        assert page.locator("#tab-checks").get_attribute("aria-selected") == "true"
        checks["principle_tabs_are_independent_and_keyboard_accessible"] = True
        page.locator("#principles-title").focus()
        page.keyboard.press("End")
        settled(page, "soon")
        assert page.get_by_role("heading", name="COMING SOON").is_visible()
        assert page.locator(".next").is_disabled()
        page.screenshot(path=str(OUTPUT / "desktop-soon.png"))
        page.keyboard.press("Home")
        settled(page, "start")
        checks["keyboard_and_end_boundaries"] = True
        page.locator(".motion-toggle").click()
        assert page.locator("body").get_attribute("data-motion") == "off"
        checks["motion_toggle"] = True
        sizes = [(1440,900),(1920,1080),(1200,630),(768,1024),(390,844),(360,667),(320,740),(844,390)]
        layouts = []
        for width, height in sizes:
            page.set_viewport_size({"width": width, "height": height})
            for index, name in enumerate(["start","why","models","memory","work","principles","soon"]):
                page.locator(f".scene-nav [data-scene-link='{index}']").click()
                page.wait_for_timeout(80)
                bounds = check_bounds(page)
                layouts.append({"width":width,"height":height,"scene":name,**bounds})
                if width in (390, 360, 1440):
                    page.screenshot(path=str(OUTPUT / f"{width}-{name}.png"))
                if name == "work" and height > 540:
                    for tab in ("context", "changes", "checks"):
                        page.locator(f"[data-work-tab='{tab}']").click()
                        layouts.append({"width":width,"height":height,"scene":f"work-{tab}",**check_bounds(page)})
                if name == "principles":
                    for key in ("control", "evidence", "alternatives", "recovery", "context", "experience"):
                        page.locator(f"#principle-tab-{key}").click()
                        layouts.append({"width":width,"height":height,"scene":f"principle-{key}",**check_bounds(page)})
                        if width in (1440, 390, 360) and key in ("control", "alternatives", "context"):
                            page.screenshot(path=str(OUTPUT / f"{width}-principle-{key}.png"))
        checks["layouts"] = layouts
        reduced = browser.new_page(viewport={"width":390,"height":844}, reduced_motion="reduce")
        reduced.goto(base + "/#memory")
        assert selected(reduced) == "memory"
        assert reduced.locator("body").get_attribute("data-motion") == "off"
        reduced.keyboard.press("End")
        reduced.wait_for_timeout(50)
        assert selected(reduced) == "soon"
        checks["deep_link_and_reduced_motion"] = True
        touch = browser.new_page(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True, reduced_motion="reduce")
        touch.goto(base)
        client = touch.context.new_cdp_session(touch)
        client.send("Input.dispatchTouchEvent", {"type":"touchStart","touchPoints":[{"x":200,"y":600}]})
        client.send("Input.dispatchTouchEvent", {"type":"touchMove","touchPoints":[{"x":200,"y":350}]})
        client.send("Input.dispatchTouchEvent", {"type":"touchEnd","touchPoints":[]})
        touch.wait_for_timeout(100)
        assert selected(touch) == "why"
        checks["touch_swipe"] = True
        plain = browser.new_page(java_script_enabled=False, viewport={"width":390,"height":844})
        plain.goto(base)
        assert plain.locator(".scene").count() == 7
        assert all(plain.locator(".scene").nth(i).is_visible() for i in range(7))
        plain.locator("#soon").scroll_into_view_if_needed()
        assert plain.get_by_role("link", name="Следить за проектом").is_visible()
        assert all(plain.locator(".principle-panel").nth(i).is_visible() for i in range(6))
        checks["readable_without_javascript"] = True
        checks["console_errors"] = errors
        checks["failed_resources"] = failures
        browser.close()
    server.shutdown()
    (OUTPUT / "checks.json").write_text(json.dumps(checks, ensure_ascii=False, indent=2) + "\n")
    bad = [entry for entry in checks["layouts"] if entry["documentOverflow"] or entry["overflow"] or entry["scrollY"]]
    print(json.dumps({"console_errors":errors,"failed_resources":failures,"layout_failures":bad,"checked_layouts":len(layouts)}, ensure_ascii=False, indent=2))
    assert not errors and not failures and not bad


if __name__ == "__main__":
    main()
