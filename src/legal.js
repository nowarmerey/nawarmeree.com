// Impressum & Datenschutzerklärung (German is the legally binding language).
// Rendered to /impressum/ and /datenschutz/ at build time. No JS, no external resources.
import { CONTACT } from './content.js';
import { escapeHtml } from './render.js';

/**
 * Address for § 5 DDG. Must be a real postal address ("ladungsfähige Anschrift").
 * The production build refuses to run while this is null (see vite.config.js).
 */
export const LEGAL = {
  name: 'Nawar Meree',
  street: null, // e.g. 'Musterstraße 1'
  city: null, //   e.g. '51373 Leverkusen'
  country: 'Deutschland',
  email: CONTACT.email,
  updated: 'Oktober 2026',
};

export const legalComplete = () => Boolean(LEGAL.street && LEGAL.city);

const address = () => [
  LEGAL.name,
  LEGAL.street ?? '[Straße und Hausnummer fehlen]',
  LEGAL.city ?? '[PLZ und Ort fehlen]',
  LEGAL.country,
].map(escapeHtml).join('<br />');

const mail = () => `<a href="mailto:${escapeHtml(LEGAL.email)}">${escapeHtml(LEGAL.email)}</a>`;

const PAGES = {
  impressum: {
    title: 'Impressum',
    body: () => `
      <h1>Impressum</h1>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>${address()}</p>
      <h2>Kontakt</h2>
      <p>E-Mail: ${mail()}</p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>${address()}</p>
      <h2>Haftung für Links</h2>
      <p>Diese Website enthält Links zu externen Websites Dritter (z.&nbsp;B. GitHub, LinkedIn), auf deren Inhalte ich keinen Einfluss habe.
      Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
      Bei Bekanntwerden von Rechtsverletzungen werden derartige Links umgehend entfernt.</p>`,
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    body: () => `
      <h1>Datenschutzerklärung</h1>
      <h2>1. Verantwortlicher</h2>
      <p>${address()}<br />E-Mail: ${mail()}</p>

      <h2>2. Überblick</h2>
      <p>Diese Website ist eine persönliche Portfolio-Seite. Sie verwendet <strong>keine Cookies</strong>, <strong>kein Tracking</strong>,
      keine Analyse-Werkzeuge und speichert keine Daten in Ihrem Browser (kein Local Storage). Schriftarten und alle anderen Ressourcen
      werden ausschließlich von dieser Domain geladen; es werden keine Inhalte von Drittanbietern eingebunden.</p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>Die Website wird bei Netlify, Inc. (USA) gehostet. Beim Aufruf der Website verarbeitet der Hoster automatisch technisch notwendige
      Daten in Server-Logfiles: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene URL, Referrer-URL sowie Browser- und Betriebssysteminformationen.
      Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO; das berechtigte Interesse liegt in der sicheren und stabilen Bereitstellung der Website.
      Eine Übermittlung in die USA ist dabei möglich. Weitere Informationen: <a href="https://www.netlify.com/privacy/" rel="noopener noreferrer">netlify.com/privacy</a>.</p>

      <h2>4. Kontakt per E-Mail</h2>
      <p>Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre Angaben (E-Mail-Adresse, Name, Inhalt der Nachricht) ausschließlich zur Bearbeitung
      Ihrer Anfrage. Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO (Anbahnung eines Arbeitsverhältnisses) bzw. lit.&nbsp;f DSGVO.
      Die Daten werden gelöscht, sobald sie für den Zweck nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>

      <h2>5. Externe Links</h2>
      <p>Links zu GitHub und LinkedIn sind einfache Verweise. Erst wenn Sie einen Link anklicken, werden Daten an den jeweiligen Anbieter übertragen;
      dafür gelten dessen Datenschutzbestimmungen.</p>

      <h2>6. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft (Art.&nbsp;15 DSGVO), Berichtigung (Art.&nbsp;16), Löschung (Art.&nbsp;17), Einschränkung der Verarbeitung (Art.&nbsp;18),
      Datenübertragbarkeit (Art.&nbsp;20) und Widerspruch (Art.&nbsp;21). Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren
      (Art.&nbsp;77 DSGVO), z.&nbsp;B. bei der Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.</p>

      <p class="updated">Stand: ${escapeHtml(LEGAL.updated)}</p>`,
  },
};

export const LEGAL_PAGES = Object.keys(PAGES);

export function renderLegal(page) {
  const p = PAGES[page];
  return `<!doctype html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${p.title} — Nawar Meree</title>
  <meta name="robots" content="noindex, follow" />
  <meta name="color-scheme" content="dark" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/legal.css" />
</head>
<body>
  <main class="legal">
    <a class="back" href="/">← nawarmeree.com</a>
    ${p.body()}
    <nav class="legal__nav"><a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></nav>
  </main>
</body>
</html>
`;
}
