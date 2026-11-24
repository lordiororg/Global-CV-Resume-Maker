# Global CV & Resume Maker

Country-aware CV and resume builder. Pick a target country and the template, length, section order and personal-detail fields follow local hiring norms (Europass for the EU and EFTA, Resume for North America, boxed forms for East Asia, and so on). Upload or paste an existing CV, edit it beside a live preview, then download Word or PDF.

Everything runs in the browser. CV data never leaves the device (it is saved in `localStorage`).

## Get it on GitHub Pages (one command)

Install the [GitHub CLI](https://cli.github.com), run `gh auth login`, then from this folder:

```bash
./scripts/setup-github.sh cv-maker
```

This creates the repository, switches Pages to **GitHub Actions**, and pushes the code. The first deploy takes about two minutes and publishes at `https://<your-username>.github.io/cv-maker/`.

Prefer clicking? Create a repo, push this folder to `main`, then go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## What is automated

| Trigger | What runs |
|---|---|
| Pull request | Unit tests, build, end-to-end browser test, print/PDF margin test |
| Push to `main` | The same checks, then deploy to GitHub Pages (only if all pass) |
| Every Monday | Link check of the pinned CDN scripts and fonts |
| Weekly | Dependabot proposes GitHub Actions updates |

Workflows live in `.github/workflows/`. Asset URLs are stamped with the commit SHA at build time, so visitors never get stale code.

## Project layout

```
index.html          page shell and markup
src/rules.js        countries, regional rule sets, per-country overrides, sources
src/parser.js       PDF reading order, section detection, field mapping (no DOM)
src/app.js          state, form, live preview, layouts, Word/PDF export, saving
src/styles.css      interface and CV layouts
tests/              unit tests (node:test), synthetic fixtures, browser end-to-end test
scripts/            build, link check, GitHub setup
```

## Develop locally

```bash
npm test                 # unit tests (Node 20+, no dependencies to install)
npm run build            # writes dist/
npm run serve            # builds and serves http://localhost:8080
pip install playwright && python -m playwright install chromium
npm run e2e              # browser test against dist/
pip install pdfplumber
npm run print-check      # prints long CVs to PDF and checks margins and page breaks
```

To change a country's template, edit `src/rules.js` (regional rule sets in `P`, country groups in `G`, one-off overrides in `X`). The unit tests check that every country resolves to a complete template.

## Notes

- Third-party libraries load from pinned CDN versions: pdf.js 3.11.174, mammoth 1.6.0, html2pdf.js 0.10.1, docx 7.8.2.
- The Europass logo in `src/rules.js` is a cropped copy from a Europass CV. Europass is a European Union trademark, so check the [Europass terms of use](https://europass.europa.eu/) for your use.
- The optional "Refine with Claude" button only appears when the app runs inside Claude. On GitHub Pages it is hidden.
- **Download PDF** is written by the app itself (real, selectable text, exact 14 mm margins) for Latin-script CVs; CVs in other scripts (for example Chinese or Arabic) fall back to an image-based export. **Print / Save as PDF** uses the browser's print engine and works for every script.
- Test fixtures are synthetic. Never commit real people's CVs.
