# nawarmeree.com — Portfolio

An animated, story-driven portfolio: **"From the server room to the cloud"**.
The page climbs the OSI layers (L1 Physical → L7 Application) as the visitor scrolls.

| Chapter | Layer | What happens |
|---|---|---|
| Boot / Hero | — | Terminal boot, avatar scanned in, a cable leaves the `</>` logo |
| About | L1 | Real photo, counters |
| Infrastructure | L2–3 | Pinned scene: a 4-floor plant is wired floor by floor |
| Journey | L4 | Flight path Homs → Leverkusen, timeline, ZAB stamp |
| Credentials | L5 | Flip cards + languages |
| Skills | L6 | Live network topology (skills ↔ projects) |
| Projects | L7 | LexAI RAG explainer (pinned) + Cobra SaaS sync diagram |
| Contact | ✓ | Cable plugs into RJ45, interactive terminal |

Languages: German (default, `/`), English (`/en/`), Arabic RTL (`/ar/`). Every page is **pre-rendered at build
time** (full text in the HTML, hreflang, JSON-LD) by the `portfolio-pages` plugin in `vite.config.js`.
Respects `prefers-reduced-motion` (static version, no smooth scroll).

Privacy & security: self-hosted fonts, no cookies, no tracking, no browser storage, strict CSP.
Security/cache headers are defined once in `vite.config.js` → written to `dist/_headers` (Netlify) and used by `vite preview`.

## Stack
Vite · vanilla JS · GSAP (ScrollTrigger, MotionPath) · Lenis

## Commands
```bash
npm install
npm run dev        # http://localhost:5180  (/, /en/, /ar/, /impressum/, /datenschutz/)
npm run build      # → dist/  (fails until the Impressum address is filled in src/legal.js)
npm run preview    # serves dist/ with the production security headers
npm run cv         # regenerates public/cv/*.pdf (needs Edge or Chrome)
```
For a local test build without the address: `ALLOW_INCOMPLETE_LEGAL=1 npm run build`.

## Editing content
- Texts, translations, links, skills, stats: `src/content.js`
- Impressum / Datenschutz: `src/legal.js`
- CV content: `tools/cv/build-cv.mjs` (then `npm run cv`)

## Deploy
`netlify.toml` is ready (build `npm run build`, publish `dist`, Node 22, `www` → apex redirect).
Point `nawarmeree.com` to the Netlify site in the domain settings.
