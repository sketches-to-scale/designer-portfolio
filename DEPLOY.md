# portfolio-site

Everything the site needs to run, and nothing else. This folder is the deploy artifact: push its **contents** to the repo root, not the folder itself.

9 pages (index, 404, and 7 case/about pages, each its own folder), 1 stylesheet, 1 script, 89 images, plus 8 old-URL redirect stubs, `sitemap.xml`, `robots.txt`, and `.nojekyll`. Verified self-contained: every page is reachable from `index.html`, every reference resolves, and no file in here is unreferenced.

```
portfolio-site/
├── index.html                  ← home
├── 404.html
├── about/index.html
├── capstone/index.html
├── codefi-product/index.html
├── codefi-growth/index.html
├── codefi-tooling/index.html
├── congenius-product/index.html
├── congenius-growth/index.html
├── style.css
├── motion.js
├── .nojekyll
├── sitemap.xml
├── robots.txt
├── img/                         ← all 89 images
└── ux-at-congenius/, product-at-codefi/, leadsigma-internship/,
    microsoft/, hire-international-student/, toyota/,
    phone-addiction/, study-space/   ← redirect stubs, old URLs, see below
```

`img/` exists because dozens of image files at the repo root buries the pages that matter in a directory listing. `style.css` and `motion.js` stay at root deliberately: nesting two files under `css/` and `js/` adds path depth without making anything easier to find.

## Extensionless URLs

Done as of 2026-08-18. Every page except `index.html` and `404.html` (which have to stay at root) lives as `pagename/index.html`, so the public URL reads `/about/` rather than `/about.html`. This was flagged as a future option in an earlier version of this doc; it's no longer optional, it's the shipped structure.

Two consequences worth knowing if you ever add a page or move something:

- Every relative reference inside a page in a subfolder needs a leading `../`: images (`../img/...`), the stylesheet, the script, and the favicon. Pages at root (`index.html`, `404.html`) don't.
- Internal links between pages point at the folder, not a filename: `href="about/"`, `href="codefi-product/#latency"`, and `href="./"` or `href="../"` for links back to home depending on the linking page's own depth.

| Page | Public URL |
|---|---|
| `index.html` | `/` |
| `about/index.html` | `/about/` |
| `capstone/index.html` | `/capstone/` |
| `codefi-product/index.html` | `/codefi-product/` |
| `codefi-growth/index.html` | `/codefi-growth/` |
| `codefi-tooling/index.html` | `/codefi-tooling/` |
| `congenius-product/index.html` | `/congenius-product/` |
| `congenius-growth/index.html` | `/congenius-growth/` |

The old flat `.html` files (`about.html`, `codefi-product.html`, etc.) are gone. If you ever see them reappear in this folder, delete them before pushing: GitHub Pages would serve both the old and new URL for the same content at once.

## Redirects for the old site's URLs

Eight folders, each a single `index.html` that meta-refreshes to the new location (GitHub Pages has no server-side redirects, so this is the standard static-site workaround):

| Old URL | Redirects to |
|---|---|
| `/ux-at-congenius` | `/congenius-product/` |
| `/product-at-codefi` | `/codefi-product/` |
| `/leadsigma-internship`, `/microsoft`, `/hire-international-student`, `/toyota`, `/phone-addiction`, `/study-space` | `/` (no current equivalent page) |

## SEO files

`sitemap.xml` lists the 8 real pages (root + about + capstone + the 6 case pages), deliberately excluding `404.html` and the redirect stubs. `robots.txt` points crawlers at the sitemap. `.nojekyll` disables GitHub Pages' default Jekyll processing, which this site doesn't use and which silently drops any file or folder starting with `_`.

All three assume the custom domain (`shantanukashyap.me`), not the current `sketches-to-scale.github.io/designer-portfolio/` staging URL. That's fine while you're only sharing with a couple people for feedback; revisit before treating search visibility as live.

## What was deliberately left out

The whole `portfolio-*.html` set (the v1 site), `portfolio-style.css`, all `render-*.png` / `s-*.png` / `shot-*.png` review screenshots, unused hero variants, every résumé, and every planning `.md`. If a page looks wrong after deploy, the cause is more likely a missing file than a broken one.

---

## Resolved

### ~~The Resume link was dead~~ — RESOLVED

All pages link to a hosted Google Drive PDF now, not `href="#"`. Note the résumé file itself is deliberately not in this folder: it's linked externally rather than committed, so it isn't sitting in a public repo with your phone number and address on it.

### ~~Acumin Pro would not render~~ — RESOLVED 2026-08-13

Two families now, both loaded: Raleway and Lato. See git history for the full explanation if the label tier's letter-spacing or weight ever looks off again, it was tuned against a font that's no longer in use.

### ~~The GitHub link decision was open~~ — RESOLVED

The link is live in the footer of every page, pointing at `github.com/sketches-to-scale`. Decided as: that account doesn't carry anything you're not ready to have public.

### ~~Home hero and tiles were 8MB~~ — RESOLVED 2026-08-18

`hero-scene.png` and the 7 home-page tile images are now WebP: 8MB down to 725KB. This was the direct fix for a "content pops in instead of fading" bug, the reveal animations run on a fixed timer with no idea whether the image has actually downloaded yet, so a heavy image reliably lost that race on a real network even though it never did testing locally off disk.

---

## Flagged, not resolved

### The rest of `img/` is 83MB across 89 files

The home-page fix above only covered the images visible before any scrolling. Every case-study page pulls in its own screenshots, and those were never touched. The worst offenders:

| File | Size |
|---|---|
| `capstone-ideation-carglasses.gif` | 12MB |
| `codefi-growth-hero-vibeathon-brand.png` | 4.5MB |
| `capstone-2045-post-reflection-filmstrip.png` | 4.1MB |
| `capstone-2045-reflect-filmstrip.png` | 3.5MB |
| `codefi-growth-vibeathon-brand-ads.png` | 3.1MB |

A 12MB GIF is the standout: GIF is a poor format for anything but simple looping animation, the same content as an MP4 or WebP would likely be a fraction of the size. The four filmstrip/brand images are static screenshots that would convert to WebP the same way the home page ones did, likely 80-90% smaller with no visible loss, same as before.

Not fixed here because it's a bigger pass than "update the doc": 89 files across 7 pages, some need format conversion (GIF), most need WebP conversion and their `<img>` references updated to match. Worth doing before this goes past a 2-3-person feedback share, since these load as people actually scroll through a case study, not all at once like the home page was.

### `style.css` still carries dead `.zebra*` / `.cover*` rules

32 rule blocks, roughly 49 lines and 2.1KB, about 2.9% of the stylesheet. Existed to keep the original single-page Codefi and ConGenius layouts rendering during the split into product/growth/tooling pages; neither of those pages exists anymore, and no live page uses these classes. Labelled in place in the stylesheet, not removed because it's never been verified in a browser and 2.1KB isn't worth an unverified change to a file that drives every page.

---

## Deploy checklist

- [x] Push the **contents** of this folder to the repo root
- [x] Settings → Pages → deploy from branch, root
- [ ] Connect the custom domain (deliberately deferred, see `sketches-to-scale/designer-portfolio` conversation history)
- [ ] Load the deployed URL and click every nav item on two different pages
- [ ] Load a case page cold on a phone, not a resized desktop window
- [ ] Decide on the 83MB image folder above before sharing beyond a couple people

## Re-running the integrity check

If you add or rename anything, verify the folder is still self-contained before pushing. Ask me to re-run the graph check; it walks every link and reference from `index.html` and reports broken references and orphaned files.

## ⚠ This folder is the source of truth now

It has diverged from the working copies in `Career/` (flat filenames, images at root, `v2-` prefixes still in place there). **Edit here, not in `Career/`.** Copying a page down from `Career/` will reintroduce dead filenames, broken image paths, and the flat (non-extensionless) URL structure this folder has since moved past.
