"""Builds long, multi-page CVs as PDFs two ways and checks margins, completeness and page breaks:
1) the app's own PDF writer (the Download PDF button), 2) the browser print route (Print / Save as PDF)."""
import functools, http.server, io, logging, os, re, sys, threading
import pdfplumber
from playwright.sync_api import sync_playwright
logging.getLogger('pdfminer').setLevel(logging.ERROR)

ROOT = os.path.join(os.path.dirname(__file__), '..', 'dist')
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/'
MARGIN = 14 * 72 / 25.4
TOL, TOL_Y = 2, 6   # points; glyph boxes extend a little above/below the text line
fails = []
def check(ok, msg):
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok: fails.append(msg)

LONG = """(()=>{for(let i=0;i<6;i++)d.exp.push({role:'Site Engineer '+i,company:'Coastal Builders '+i+' Ltd',loc:'Mombasa',start:'Jan 20'+(10+i),end:'Dec 20'+(11+i),bul:'Directed day-to-day site operations, managing budgets, subcontractors and resources to deliver projects on programme\\nEnforced health, safety and quality compliance while acting as primary liaison between clients and consultants\\nPrepared weekly progress reports and material test records for the project team'});
d.vol='Mentor, engineering students society\\nVolunteer surveyor, community water project';d.proj='Bridge rehabilitation, 40 m span\\nDrainage design for 15 km of rural road';d.awards='Best graduate engineer 2019';d.certs='Registered engineer (EBK)\\nHealth and safety level 2';d.pubs='Low-cost road materials, Journal of Engineering 2021';d.hob='Chess, hiking, football';d.name="Lordvicus Mang’era";
const c=document.createElement('canvas');c.width=320;c.height=400;const x=c.getContext('2d');x.fillStyle='#8899aa';x.fillRect(0,0,320,400);d.photo=c.toDataURL('image/png');ov.ph=1;
renderAll();printPrep()})()"""
STRINGS = "(()=>{const o=[];(function w(v){if(typeof v=='string')o.push(v);else if(Array.isArray(v))v.forEach(w);else if(v&&typeof v=='object')Object.entries(v).forEach(([k,x])=>{if(k!='photo'&&k!='k'&&k!='pa'&&k!='p'&&k!='ed')w(x)})})(model());return o.join(' ')})()"

def analyze(label, pdf, expected_text, heads, size):
    words_of = lambda s: set(re.findall(r'[a-z0-9]{3,}', s.lower()))
    with pdfplumber.open(io.BytesIO(pdf)) as doc:
        W, H = doc.pages[0].width, doc.pages[0].height
        ew, eh = (612, 792) if size == 'letter' else (595.3, 841.9)
        check(abs(W - ew) < 2 and abs(H - eh) < 2, f'{label}: paper is {size.upper()}')
        check(len(doc.pages) >= 2, f'{label}: long CV runs over {len(doc.pages)} pages')
        bad, text_all = [], ''
        for i, page in enumerate(doc.pages, 1):
            words = page.extract_words()
            if not words: bad.append(f'page {i} is empty'); continue
            text_all += ' ' + ' '.join(w['text'] for w in words)
            x0, x1 = min(w['x0'] for w in words), max(w['x1'] for w in words)
            t, bt = min(w['top'] for w in words), max(w['bottom'] for w in words)
            if x0 < MARGIN - TOL or x1 > page.width - MARGIN + TOL or t < MARGIN - TOL_Y or bt > page.height - MARGIN + TOL_Y:
                bad.append(f'page {i}: text x {x0:.0f}-{x1:.0f}, y {t:.0f}-{bt:.0f}')
            for r in page.rects + page.images:
                if (r['x1'] - r['x0']) < page.width * 0.97 and (r['x0'] < MARGIN - TOL or r['x1'] > page.width - MARGIN + TOL):
                    bad.append(f'page {i}: shape outside margins x {r["x0"]:.0f}-{r["x1"]:.0f}')
            lines = (page.extract_text() or '').strip().split('\n')
            if i < len(doc.pages) and lines and lines[-1].strip().lower() in heads:
                bad.append(f'page {i} ends with a stranded heading "{lines[-1]}"')
        check(not bad, f'{label}: 14 mm margins on every page, no stranded headings' + (f' -> {bad[:3]}' if bad else ''))
        missing = words_of(expected_text) - words_of(text_all)
        check(not missing, f'{label}: nothing missing from the PDF' + (f' -> {sorted(missing)[:8]}' if missing else ''))

CASES = [('United States', 'letter'), ('Germany', 'a4'), ('Kenya', 'a4'), ('United Arab Emirates', 'a4'), ('Japan', 'a4'), ('Serbia', 'a4')]
with sync_playwright() as p:
    b = p.chromium.launch()
    for country, size in CASES:
        pg = b.new_page(viewport={'width': 1280, 'height': 900})
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(URL) else r.abort())
        pg.goto(URL); pg.click('#sample'); pg.fill('#cty', country); pg.dispatch_event('#cty', 'input'); pg.click('#n2')
        pg.evaluate(LONG)
        heads = pg.evaluate("[...document.querySelectorAll('#pa h3')].map(h=>h.textContent.trim().toLowerCase())")
        dom = pg.evaluate("document.querySelector('#pa').innerHTML.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')")
        vec = pg.evaluate("buildPDF().then(b=>b?b.arrayBuffer():null).then(a=>a?Array.from(new Uint8Array(a)):null)")
        check(vec is not None, f'{country}: app PDF writer produced a file')
        if vec:
            analyze(f'{country} [Download PDF]', bytes(vec), pg.evaluate(STRINGS), heads, size)
            if country in ('Germany', 'Kenya'): open(f'/tmp/vec_{country}.pdf', 'wb').write(bytes(vec))
        analyze(f'{country} [Print]', pg.pdf(prefer_css_page_size=True, print_background=True), dom, heads, size)
        pg.close()
    b.close()
srv.shutdown()
print(f'\n{len(fails)} failure(s)')
sys.exit(1 if fails else 0)
