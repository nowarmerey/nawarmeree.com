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

Languages: Arabic (RTL), German, English — all texts live in `src/content.js`.
Respects `prefers-reduced-motion` (static version, no smooth scroll).

## Stack
Vite · vanilla JS · GSAP (ScrollTrigger, MotionPath) · Lenis

## Commands
```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # → dist/
```

## Editing content
- Texts / translations: `src/content.js`
- Email & links: `CONTACT` at the top of `src/content.js`
- Skills map: `src/scenes/skills.js`

## Deploy
`netlify.toml` is ready (build `npm run build`, publish `dist`, `www` → apex redirect).
Point `nawarmeree.com` to the Netlify site in the domain settings.
