// Copies the static site into dist/ and stamps asset URLs with the commit SHA so browsers never serve stale code.
import fs from 'node:fs';
const out = 'dist';
const build = (process.env.GITHUB_SHA || String(Date.now())).slice(0, 8);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(`${out}/src`, { recursive: true });
for (const f of fs.readdirSync('src')) fs.copyFileSync(`src/${f}`, `${out}/src/${f}`);
fs.writeFileSync(`${out}/index.html`, fs.readFileSync('index.html', 'utf8').replaceAll('__BUILD__', build));
fs.writeFileSync(`${out}/.nojekyll`, '');
console.log(`Built ${out}/ (build ${build})`);
