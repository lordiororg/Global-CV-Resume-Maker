"""End-to-end smoke test: serves dist/ locally and drives the real app in headless Chromium.
Third-party CDN requests are blocked so the test never depends on external services."""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), '..', 'dist')
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
handler = functools.partial(Quiet, directory=ROOT)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/'
fails = []

def check(cond, msg):
    print(('PASS ' if cond else 'FAIL ') + msg)
    if not cond: fails.append(msg)

def pick_country(pg, name):
    pg.fill('#cty', name); pg.dispatch_event('#cty', 'input')

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 900})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(URL) else r.abort())
    pg.goto(URL)
    check(pg.inner_text('#steps button.on') .strip().endswith('Start'), 'opens on the Start step')

    # Country rules set the Show options automatically
    pg.click('#sample'); pick_country(pg, 'United States'); pg.click('#n2')
    us = {k: pg.is_checked(f'#tog input[data-t="{k}"]') for k in ('ph', 'dob', 'nat', 'mar')}
    check(not any(us.values()), 'United States: photo, DOB, nationality, marital status are off')
    check(pg.input_value('#tog select[data-t="ref"]') == '0', 'United States: references = none')
    pg.click('#steps button[data-s="2"]'); pick_country(pg, 'Germany'); pg.click('#n2')
    check(pg.is_checked('#tog input[data-t="ph"]') and pg.is_checked('#tog input[data-t="dob"]'), 'Germany: photo and DOB are on')
    check(pg.query_selector('#paper img.logo') is not None, 'Germany: Europass logo is shown')
    check(pg.query_selector('.phn') is not None, 'Germany: photo upload is requested when missing')
    pg.click('#steps button[data-s="2"]'); pick_country(pg, 'Kenya'); pg.click('#n2')
    check(pg.input_value('#tog select[data-t="ref"]') == '2', 'Kenya: referees are listed')

    # Edits survive stepping back and forth, and a reload
    pg.fill('[data-p="name"]', 'Persisted Name'); pg.fill('[data-p="exp.0.role"]', 'Persisted Role')
    pg.uncheck('#tog input[data-t="ph"]')
    pg.click('#steps button[data-s="4"]')
    check('Persisted Name' in pg.inner_text('#paper2 h1'), 'review shows the edited name')
    pg.click('#steps button[data-s="3"]')
    check(pg.input_value('[data-p="name"]') == 'Persisted Name', 'edits survive Review -> Edit')
    pg.click('#steps button[data-s="2"]'); pg.click('#steps button[data-s="3"]')
    check(pg.input_value('[data-p="exp.0.role"]') == 'Persisted Role', 'edits survive going back a step')
    pg.click('#steps button[data-s="4"]'); pg.wait_for_timeout(100); pg.reload()
    check(pg.inner_text('#steps button.on').strip().endswith('Review & download'), 'reload returns to the same step')
    pg.click('#steps button[data-s="3"]')
    check(pg.input_value('[data-p="name"]') == 'Persisted Name' and not pg.is_checked('#tog input[data-t="ph"]'), 'reload restores fields and toggles')

    # Start-step safety: browsing the tabs changes nothing; starting a new CV needs a confirming click
    pg.click('#steps button[data-s="1"]')
    for m in ('paste', 'man', 'up'): pg.click(f'#seg button[data-m="{m}"]')
    pg.click('#seg button[data-m="man"]'); pg.click('#manual')
    check('already have a CV' in pg.inner_text('#emsg'), 'starting over warns first')
    pg.click('#steps button[data-s="3"]')
    check(pg.input_value('[data-p="name"]') == 'Persisted Name', 'nothing changed after the warning')

    # Paste flow maps text into fields
    pg.click('#steps button[data-s="1"]'); pg.click('#seg button[data-m="paste"]')
    pg.fill('#pt', 'Sam Example\nsam@example.com | +254 700 111 222 | Nairobi, Kenya\nWORK EXPERIENCE\nForeman\nAcme Ltd, Mombasa\n2019 - 2022\n• Led crews of 20 people on site\nEDUCATION\nDiploma in Building\nMombasa Polytechnic\n2015 - 2017\nSKILLS\nAutoCAD, Revit')
    pg.click('#pgo')
    if pg.inner_text('#steps button.on').strip().endswith('Start'): pg.click('#pgo')  # first click may only arm the replace warning
    pick_country(pg, 'Kenya'); pg.click('#n2')
    check(pg.input_value('[data-p="name"]') == 'Sam Example' and pg.input_value('[data-p="exp.0.company"]').startswith('Acme'), 'pasted text is mapped into the form')
    check(pg.is_visible('#drw'), 'extraction review drawer is shown')
    check(not errs, f'no page errors {errs[:2]}')
    b.close()

srv.shutdown()
print(f'\n{len(fails)} failure(s)')
sys.exit(1 if fails else 0)
