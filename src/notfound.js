// 404 page ("host unreachable · packet lost"). Static, no framework; served by Netlify for every unknown URL.
// The requested path is filled in by /404.js (an external script, so the strict CSP stays untouched).
import { LANG_PATHS } from './content.js';

const TEXT = {
  de: { title: 'Seite nicht gefunden', lead: 'Das Paket ist unterwegs verloren gegangen. Diese Seite existiert nicht (mehr).', home: 'Zur Startseite' },
  en: { title: 'Page not found', lead: 'The packet got lost on its way. This page does not exist (anymore).', home: 'Back to the homepage' },
  ar: { title: 'الصفحة غير موجودة', lead: 'ضاعت الحزمة في الطريق. هذه الصفحة غير موجودة (أو لم تعد موجودة).', home: 'العودة إلى الرئيسية' },
};

export function renderNotFound() {
  const blocks = Object.entries(TEXT).map(([lang, t]) => `
      <section class="nf__lang" lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <h2>${t.title}</h2>
        <p>${t.lead}</p>
        <a class="nf__btn" href="${LANG_PATHS[lang]}">${t.home}</a>
      </section>`).join('');

  return `<!doctype html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>404 · Host unreachable — Nawar Meree</title>
  <meta name="robots" content="noindex" />
  <meta name="color-scheme" content="dark" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/404.css" />
  <script src="/404.js" defer></script>
</head>
<body>
  <main class="nf">
    <a class="nf__logo" href="/" aria-label="nawarmeree.com"><span>&lt;/&gt;</span> nawar</a>

    <div class="nf__cable" aria-hidden="true">
      <span class="nf__plug"></span><span class="nf__wire nf__wire--a"></span>
      <span class="nf__spark"></span>
      <span class="nf__wire nf__wire--b"></span><span class="nf__plug nf__plug--b"></span>
    </div>

    <h1 class="nf__code">404</h1>

    <div class="nf__term" role="log" aria-label="ping">
      <div class="nf__bar"><i></i><i></i><i></i><span>nawar@nawarmeree.com</span></div>
      <pre class="nf__out"><span class="nf__cmd">$ ping nawarmeree.com<span id="nfPath"></span></span>
<span class="nf__l1">PING: request timed out.</span>
<span class="nf__l2">PING: request timed out.</span>
<span class="nf__l3">--- 3 packets transmitted, 0 received, 100% packet loss ---</span>
<span class="nf__err">Destination host unreachable · HTTP 404</span></pre>
    </div>

    <div class="nf__langs">${blocks}
    </div>
  </main>
</body>
</html>
`;
}
