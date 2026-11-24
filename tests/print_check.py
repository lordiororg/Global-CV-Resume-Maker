"""Prints long, multi-page CVs to real PDFs with Chromium and checks margins, completeness and page breaks."""
import functools, http.server, io, os, re, sys, threading
import logging
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), '..', 'dist')
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/'
MM = 72 / 25.4
MARGIN = 14 * MM
TOL = 2      # points, left/right
TOL_Y = 6    # points: glyph boxes extend slightly above/below the text line, so top/bottom get more room
fails = []
def check(ok, msg):
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok: fails.append(msg)

LONGEN = """(()=>{for(let i=0;i<6;i++)d.exp.push({role:'Site Engineer '+i,company:'Coastal Builders '+i+' Ltd',loc:'Mombasa',start:'Jan 20'+(10+i),end:'Dec 20'+(11+i),bul:'Directed day-to-day site operations, managing budgets, subcontractors and resources to deliver projects on programme\\nEnforced health, safety and quality compliance while acting as primary liaison between clients and consultants\\nPrepared weekly progress reports and material test records for the project team'});
d.vol='Mentor, engineering students society\\nVolunteer surveyor, community water project';d.proj='Bridge rehabilitation, 40 m span\\nDrainage design for 15 km of rural road';d.awards='Best graduate engineer 2019';d.certs='Registered engineer (EBK)\\nHealth and safety level 2';d.pubs='Low-cost road materials, Journal of Engineering 2021';d.hob='Chess, hiking, football';
renderAll();printPrep()})()"""

CASES = [('United States', 'letter'), ('Germany', 'a4'), ('Kenya', 'a4'), ('United Arab Emirates', 'a4'), ('Japan', 'a4'), ('Serbia', 'a4')]
with sync_playwright() as p:
    b = p.chromium.launch()
    for country, size in CASES:
        pg = b.new_page(viewport={'width': 1280, 'height': 900})
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(URL) else r.abort())
        pg.goto(URL); pg.click('#sample'); pg.fill('#cty', country); pg.dispatch_event('#cty', 'input'); pg.click('#n2')
        pg.evaluate(LONGEN)
        dom = pg.evaluate("document.querySelector('#pa').innerHTML.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')")
        heads = pg.evaluate("[...document.querySelectorAll('#pa h3')].map(h=>h.textContent.trim().toLowerCase())")
        pdf = pg.pdf(prefer_css_page_size=True, print_background=True)
        with pdfplumber.open(io.BytesIO(pdf)) as doc:
            W, H = doc.pages[0].width, doc.pages[0].height
            exp_w, exp_h = (612, 792) if size == 'letter' else (595.3, 841.9)
            check(abs(W - exp_w) < 2 and abs(H - exp_h) < 2, f'{country}: paper is {size.upper()} ({W:.0f}x{H:.0f}pt)')
            check(len(doc.pages) >= 2, f'{country}: long CV runs over {len(doc.pages)} pages')
            bad = []
            text_all = ''
            for i, page in enumerate(doc.pages, 1):
                words = page.extract_words()
                if not words: bad.append(f'page {i} is empty'); continue
                text_all += ' ' + ' '.join(w['text'] for w in words)
                x0 = min(w['x0'] for w in words); x1 = max(w['x1'] for w in words)
                t = min(w['top'] for w in words); bt = max(w['bottom'] for w in words)
                if x0 < MARGIN - TOL or x1 > page.width - MARGIN + TOL or t < MARGIN - TOL_Y or bt > page.height - MARGIN + TOL_Y:
                    bad.append(f'page {i}: text box x {x0:.0f}-{x1:.0f}, y {t:.0f}-{bt:.0f}')
                for r in page.rects:
                    if r['width'] < page.width * 0.97 and (r['x0'] < MARGIN - TOL or r['x1'] > page.width - MARGIN + TOL):
                        bad.append(f'page {i}: shape outside margins x {r["x0"]:.0f}-{r["x1"]:.0f}')
                lines = page.extract_text().strip().split('\n')
                if i < len(doc.pages) and lines[-1].strip().lower() in heads:
                    bad.append(f'page {i} ends with a stranded heading "{lines[-1]}"')
            check(not bad, f'{country}: every page keeps 14 mm margins, no stranded headings' + (f' -> {bad[:3]}' if bad else ''))
            norm = lambda s: set(re.findall(r'[a-z0-9]{3,}', s.lower()))
            missing = norm(dom) - norm(text_all)
            check(not missing, f'{country}: nothing cut off (all CV words are in the PDF)' + (f' -> missing {sorted(missing)[:6]}' if missing else ''))
        pg.close()
    b.close()
srv.shutdown()
print(f'\n{len(fails)} failure(s)')
sys.exit(1 if fails else 0)
