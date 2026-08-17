# portfolio-site

Everything the site needs to run, and nothing else. This folder is the deploy artifact: push its **contents** to the repo root, not the folder itself.

8 pages, 1 stylesheet, 1 script, 15 images. Verified self-contained: every page is reachable from `index.html`, every reference resolves, and no file in here is unreferenced.

```
portfolio-site/
├── index.html                  ← home (was v2-home.html)
├── about.html
├── capstone.html
├── codefi-product.html
├── codefi-growth.html
├── codefi-tooling.html
├── congenius-product.html
├── congenius-growth.html
├── style.css
├── motion.js
└── img/                        ← all 15 images
```

`img/` exists because 15 image files at the repo root buries the 8 pages that matter in a directory listing. `style.css` and `motion.js` stay at root deliberately: nesting two files under `css/` and `js/` adds path depth without making anything easier to find. If you later add more scripts, that's the moment to split them out.

All image references were rewritten to `img/…`. They were all plain `src` attributes in `index.html` and `about.html`; there were no `url()` references in the CSS, no `og:image` tags, and no `srcset`, so nothing else needed touching.

## Filenames are URLs

Every name here is a public, permanent address. `v2-` was a working prefix from the rebuild and had no business in the address bar, so it's gone.

| Was | Now | Public URL |
|---|---|---|
| `v2-home.html` | `index.html` | `/` |
| `v2-about.html` | `about.html` | `/about.html` |
| `v2-about-capstone.html` | `capstone.html` | `/capstone.html` |
| `v2-codefi-product.html` | `codefi-product.html` | `/codefi-product.html` |
| `v2-codefi-growth.html` | `codefi-growth.html` | `/codefi-growth.html` |
| `v2-codefi-tooling.html` | `codefi-tooling.html` | `/codefi-tooling.html` |
| `v2-congenius-product.html` | `congenius-product.html` | `/congenius-product.html` |
| `v2-congenius-growth.html` | `congenius-growth.html` | `/congenius-growth.html` |
| `v2-style.css` | `style.css` | — |
| `v2-motion.js` | `motion.js` | — |

Every reference was rewritten in the same pass, and the link graph re-verified afterwards.

Build-history comments were also removed from the shipped pages ("v2 visual refactor. Originals untouched"), since they describe a process no reader has context for and they're visible in View Source.

**If you want extensionless URLs** (`/about` rather than `/about.html`), that's a different structure: each page becomes `about/index.html`, and every relative link and image path has to move up a level. Worth doing once, badly worth doing twice. Say so before you push rather than after, because changing URLs after they're shared breaks them.

## What was deliberately left out

`v2-codefi.html` and `v2-congenius.html` are **not** here. They are unreachable from the site graph, superseded by the split product/growth/tooling pages. Same for the whole `portfolio-*.html` set (the v1 site), `portfolio-style.css`, all `render-*.png` / `s-*.png` / `shot-*.png` review screenshots, unused hero variants (`hero-figure.svg`, `hero-motif-*.svg`, `hero-scene.svg`, `hero-shot-finn-panel.png`, `v2-hero-shot.jpg`, `about-capstone-visual.png`), every résumé, and every planning `.md`.

If a page looks wrong after deploy, the cause is more likely a missing file than a broken one. Re-run the graph check rather than copying files across by hand.

---

## ⚠ Three things to resolve before this goes public

These are pre-existing, flagged in the markup itself, and none of them are cosmetic.

### 1. The Resume link is dead on all 8 pages

```html
<a href="#" target="_blank" rel="noopener"><!-- TBD: resume link --> Resume</a>
```

Every page ships a nav item that goes nowhere. A reviewer clicking it gets nothing and reads the site as unfinished. Either point it at a hosted PDF or remove the nav item until there is one. Do not ship it as `#`.

Note the résumé PDFs were deliberately excluded from this folder. If you want the link to resolve locally, copy the chosen PDF in and point the href at it. Be deliberate about which one: putting a résumé in a public repo makes your phone number and address permanently public and crawlable.

### 2. ~~Acumin Pro will not render~~ — RESOLVED 2026-08-13

The type system is now **two families, both loaded**: Raleway and Lato. No further action needed.

What it was: the stylesheet called for three families. Acumin Pro carried the entire metadata tier (chapter kickers, case-fact keys, rail numbers, pager labels, status chips, section numbers) across 21 declarations, more than Raleway and Lato combined. It was never loaded, because it is Adobe-exclusive and there was no Typekit embed. The fallback chain resolved to Futura on macOS, Century Gothic on Windows with Office installed, and generic sans everywhere else, so the label tier rendered as three different typefaces depending on the reader. It looked deliberate during review only because review happened on a Mac.

What changed: all 21 Acumin declarations now use Raleway, which was already loaded and already the display/UI face. Raleway is also now requested at weight 400 alongside 500/600/700, because 18 of those rules carry no explicit weight and inherit 400; without it the browser would have substituted the nearest available weight.

**Worth an eye before you push.** The letter-spacing on the label tier (0.06em to 0.09em on uppercase text) was tuned against Acumin's widths. Raleway is a wider face, so those labels may now read loose. If they do, the fix is to shave the `letter-spacing` values, not to change the font. Similarly, Raleway runs light at 400; if the small uppercase metadata looks thin, bump those rules to `font-weight: 500`.

### 3. The GitHub link decision is still open

`index.html` carries this note from session 1:

> the GitHub link is deliberately NOT on this page yet ... a public profile may expose SoldNearYou commits

Publishing this repo makes your GitHub profile easier to find regardless of whether you link to it. Decide before pushing: private repos, a curated pinned view, or accept it.

---

## Deploy checklist

- [ ] Resolve the three items above
- [ ] Push the **contents** of this folder to the repo root
- [ ] Settings → Pages → deploy from branch, root
- [ ] Load the deployed URL and click every nav item on two different pages
- [ ] Load a case page cold on a phone, not a resized desktop window
- [ ] Confirm no `file://` assumptions: everything here uses relative paths, so this should be clean, but check one image loads

## Re-running the integrity check

If you add or rename anything, verify the folder is still self-contained before pushing. Ask me to re-run the graph check; it walks every link and reference from `index.html` and reports broken references and orphaned files.

## ⚠ This folder is the source of truth now

It has diverged from the working copies in `Career/` in three ways: every file is renamed, images live in `img/`, and build-history comments are stripped. The `Career/` copies still use the old `v2-` names and flat image paths.

**Edit here, not in `Career/`.** Copying a page down from `Career/` will reintroduce dead filenames and broken image paths.

## Known dead code, not removed

`style.css` still carries the `.zebra*` and `.cover*` rules: 32 rule blocks, roughly 49 lines and 2.1KB, about 2.9% of the stylesheet. They existed to keep the original single-page Codefi and ConGenius pages rendering during the split into product/growth/tooling. Neither of those pages is in the deployed site, and no live page uses any of those classes.

It is safe to delete and it is labelled in place in the stylesheet. It has **not** been deleted because that has not been verified in a browser, and 2.1KB is not worth shipping an unverified change to a stylesheet that drives eight pages. Delete it when you have the site running locally and can look at it.

## Image weight

12MB across 15 files, and four of the tiles are over 850KB each:

| File | Size |
|---|---|
| `tile-congenius-marketing.png` | 1.5MB |
| `tile-congenius-estimating.png` | 1.5MB |
| `tile-congenius-catalog.png` | 1.0MB |
| `tile-designing-scale.png` | 888KB |

Not a blocker for GitHub Pages, which has no per-file limit that these approach. But a reviewer opening the home page on a phone downloads most of that before the tiles resolve. These are screenshots of UI, which compress well: converting the tiles to WebP would likely take the folder under 3MB with no visible loss. Worth doing before you push, since the home page is where the tiles all load at once.
