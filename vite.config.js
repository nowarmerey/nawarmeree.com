import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import { renderPage } from './src/render.js';
import { LANG_PATHS, SITE, CONTACT } from './src/content.js';
import { renderLegal, LEGAL_PAGES, legalComplete } from './src/legal.js';
import { renderNotFound } from './src/notfound.js';

/**
 * Security headers: single source of truth for production (written to dist/_headers for Netlify)
 * and for `vite preview`, so the CSP is tested locally before it is deployed.
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

const CACHE_RULES = {
  '/assets/*': 'public, max-age=31536000, immutable',
  '/img/*': 'public, max-age=2592000',
  '/cv/*': 'public, max-age=86400',
};

const langFromUrl = (url) => {
  const clean = url.split(/[?#]/)[0].replace(/\/?$/, '/');
  return Object.entries(LANG_PATHS).find(([, p]) => p === clean)?.[0];
};

function writeFile(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** Pre-renders index.html per language (/, /en/, /ar/) plus the legal pages. */
function portfolioPages() {
  let outDir;
  let root;
  let isBuild = false;
  return {
    name: 'portfolio-pages',
    configResolved(config) {
      root = config.root;
      isBuild = config.command === 'build';
      outDir = path.resolve(config.root, config.build.outDir);
    },
    buildStart() {
      // the dev server shows a visible placeholder instead; only a deployable build is blocked
      if (isBuild && !legalComplete() && !process.env.ALLOW_INCOMPLETE_LEGAL) {
        this.error('Impressum address missing: fill LEGAL.street and LEGAL.city in src/legal.js '
          + '(or set ALLOW_INCOMPLETE_LEGAL=1 for a local test build).');
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split('?')[0];
        if (url === '/404.html') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(renderNotFound());
          return;
        }
        const legal = url.match(/^\/(impressum|datenschutz)\/?$/);
        if (legal) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(renderLegal(legal[1]));
          return;
        }
        const lang = langFromUrl(url);
        if (lang && lang !== 'de') {
          const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
          const html = await server.transformIndexHtml(url, renderPage(template, lang));
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
          return;
        }
        next();
      });
    },
    transformIndexHtml: {
      order: 'pre',
      // dev server: "/" is German. In a build the template stays untouched; closeBundle renders it.
      handler: (html, ctx) => (ctx.server && html.includes('%%LANG%%') ? renderPage(html, 'de') : html),
    },
    closeBundle() {
      const templateFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(templateFile)) return;
      // preload the two Space Grotesk files the hero needs, so the font swap cannot shift the layout
      const fontPreloads = fs.readdirSync(path.join(outDir, 'assets'))
        .filter((f) => /^space-grotesk-latin-(400|700)-normal-.*\.woff2$/.test(f))
        .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
        .join('\n  ');
      const template = fs.readFileSync(templateFile, 'utf8').replace('</title>', `</title>\n  ${fontPreloads}`);
      for (const [lang, route] of Object.entries(LANG_PATHS)) {
        writeFile(path.join(outDir, route, 'index.html'), renderPage(template, lang));
      }
      for (const page of LEGAL_PAGES) writeFile(path.join(outDir, page, 'index.html'), renderLegal(page));
      writeFile(path.join(outDir, '404.html'), renderNotFound()); // Netlify serves it for every unknown URL

      const headers = ['/*', ...Object.entries(SECURITY_HEADERS).map(([k, v]) => `  ${k}: ${v}`)];
      for (const [pattern, value] of Object.entries(CACHE_RULES)) headers.push(pattern, `  Cache-Control: ${value}`);
      writeFile(path.join(outDir, '_headers'), `${headers.join('\n')}\n`);

      // RFC 9116: Expires must be less than a year ahead, so it is renewed with every deploy
      const expires = new Date(Date.now() + 364 * 24 * 3600 * 1000).toISOString();
      writeFile(path.join(outDir, '.well-known', 'security.txt'), [
        `Contact: mailto:${CONTACT.email}`,
        `Expires: ${expires}`,
        'Preferred-Languages: de, en, ar',
        `Canonical: ${SITE}/.well-known/security.txt`,
        '',
      ].join('\n'));

      const urls = Object.values(LANG_PATHS).map((route) => `  <url>
    <loc>${SITE}${route}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
${Object.entries(LANG_PATHS).map(([l, r]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${r}" />`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />
  </url>`).join('\n');
      writeFile(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`);
    },
  };
}

export default defineConfig({
  plugins: [portfolioPages()],
  server: { port: 5180 },
  preview: { port: 5181, headers: SECURITY_HEADERS },
});
