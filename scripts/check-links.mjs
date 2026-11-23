// Verifies that every pinned third-party script and font URL in index.html still resolves.
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const urls = [...new Set([...html.matchAll(/(?:src|href)="(https:\/\/[^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&')))];
let bad = 0;
for (const u of urls) {
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(20000) });
    console.log(r.ok ? 'ok  ' : 'FAIL', r.status, u);
    if (!r.ok) bad++;
  } catch (e) { console.log('FAIL', e.message, u); bad++; }
}
process.exit(bad ? 1 : 0);
