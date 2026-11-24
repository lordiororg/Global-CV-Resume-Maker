# Global CV & Resume Maker

Country-aware CV and resume builder. Pick a target country and the template, length, section order and personal-detail fields follow local hiring norms (Europass for the EU and EFTA, Resume for North America, boxed forms for East Asia, and so on). Upload or paste an existing CV, edit it beside a live preview, then download Word or PDF.

Everything runs in the browser. CV data never leaves the device (it is saved in `localStorage`).

## Template pools by country

Choosing a country sets a **pool** of layouts that local recruiters accept. The first entry is the style recruiters see most often there and is applied automatically; the others can be picked in **step 2 → Template pool**, which changes only the layout, never the content or the country rules. Word, PDF and print all follow the chosen template.

| Region (countries) | Pool, most preferred first |
|---|---|
| Australia, New Zealand | Classic → Sidebar → Tabular → Minimal |
| United Kingdom, Ireland, Jamaica, Caribbean, Fiji, PNG | Classic → Minimal → Tabular |
| United States, Canada | Classic → Minimal → Tabular |
| Singapore, Hong Kong | Classic → Sidebar → Tabular |
| Germany, Austria, Switzerland, France, Spain, Italy, Benelux, Nordics, Central Europe | Europass → Classic → Tabular |
| Netherlands, Denmark, Sweden, Finland, Norway, Iceland, Ireland | Europass → Classic → Tabular |
| Balkans, Russia, Ukraine, Türkiye, Caucasus, Central Asia | Tabular → Classic → Europass |
| Gulf, Middle East, North Africa | Sidebar → Classic → Boxed |
| Japan, Korea, China, Taiwan, Mongolia | Boxed → Classic → Tabular |
| India, Pakistan, Bangladesh, Sri Lanka, Nepal, Afghanistan | Classic → Sidebar → Tabular |
| Philippines, Indonesia, Thailand, Vietnam, Malaysia | Sidebar → Classic → Minimal |
| Mexico, Brazil, Argentina, Chile, Colombia, Peru | Tabular → Sidebar → Classic |
| Kenya, Nigeria, South Africa, Ghana and the rest of Africa | Classic → Sidebar → Tabular → Minimal |
| Any country without a specific group | Classic → Minimal → Tabular → Sidebar |

A single country can override its region with `X[country].tp = 'id'` in `src/rules.js`.

## Download checks

Word, PDF and Print stay locked until the CV is complete for the chosen country. Clicking any of them lists the failing codes in step 4 with what to do, and the same checklist sits under the review chips. If a detail is left out on purpose, untick it under **Show** in step 2 and its check disappears.

| Code | What is missing |
|---|---|
| CV-101 / CV-102 | Full name / target role |
| CV-103 / CV-104 | Email missing / email not in `name@example.com` form |
| CV-105 / CV-106 | Phone missing / phone too short for a country code |
| CV-107 | City and country |
| CV-108 | Summary or personal statement |
| CV-109 / CV-110 | No work experience / an entry without job title, company or start date |
| CV-111 / CV-112 | No education / an entry without qualification, institution or year |
| CV-113 | No skills |
| CV-114 | The country expects a photo |
| CV-115 | The country expects a date of birth |
| CV-116 | The country expects a nationality |
| CV-117 | The country expects work authorisation or visa status |
| CV-118 | The country expects a full address |
| CV-119 | The country expects named referees |

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
src/rules.js        countries, regional rule sets, per-country overrides, template pools, sources
src/ai.js           optional AI remap (own free Gemini key, browser only)
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

To change a country's template, edit `src/rules.js` (regional rule sets in `P`, country groups in `G`, one-off overrides in `X`, layout pools in `TPL`). The unit tests check that every country resolves to a complete template.

## Notes

- Third-party libraries load from pinned CDN versions: pdf.js 3.11.174, mammoth 1.6.0, html2pdf.js 0.10.1, docx 7.8.2.
- The Europass logo in `src/rules.js` is a cropped copy from a Europass CV. Europass is a European Union trademark, so check the [Europass terms of use](https://europass.europa.eu/) for your use.
- The optional "Refine with Claude" button only appears when the app runs inside Claude. On GitHub Pages it is hidden.
- **Download PDF** is written by the app itself (real, selectable text, exact 14 mm margins) for Latin-script CVs; CVs in other scripts (for example Chinese or Arabic) fall back to an image-based export. **Print / Save as PDF** uses the browser's print engine and works for every script.
- Test fixtures are synthetic. Never commit real people's CVs.
