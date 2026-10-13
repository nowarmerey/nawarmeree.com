// Pure HTML builders, run at build time (and by the dev server) to pre-render every language.
// No DOM access here: this module is imported by vite.config.js under Node.
import {
  content, CONTACT, SITE, LANG_PATHS, LANGS, CV_FILES, STATS, LANG_LEVELS, SKILLS, SKILL_HUBS,
} from './content.js';

export const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const get = (obj, key) => key.split('.').reduce((o, p) => (o == null ? o : o[p]), obj);

/** Lists and repeated structures, keyed by the id of their (empty) container in index.html. */
function lists(lang) {
  const c = content[lang];
  const k = (key) => `data-i18n="${key}"`;
  return {
    railLayers: c.layers.map((l, i) => `<li>${l}<span ${k(`layerNames.${i}`)}></span></li>`).join(''),
    traits: c.about.traits.map((_, i) => `<li ${k(`about.traits.${i}`)}></li>`).join(''),
    stats: STATS.map((st, i) =>
      `<li class="reveal"><b data-count="${st.value}" data-suffix="${st.suffix}">${st.value.toLocaleString('en-US')}</b><span ${k(`about.stats.${i}`)}></span></li>`).join(''),
    infraSteps: c.infra.steps.map((_, i) =>
      `<li><span class="num">0${i + 1} / 0${c.infra.steps.length}</span><h3 ${k(`infra.steps.${i}.t`)}></h3><p ${k(`infra.steps.${i}.d`)}></p></li>`).join(''),
    infraStepsSr: c.infra.steps.map((_, i) => `<li><span ${k(`infra.steps.${i}.t`)}></span>: <span ${k(`infra.steps.${i}.d`)}></span></li>`).join(''),
    heroRolesSr: escapeHtml(c.hero.roles.join(' · ')),
    timeline: c.journey.stations.map((_, i) =>
      `<li class="reveal"><span class="year" ${k(`journey.stations.${i}.y`)}></span><h3 ${k(`journey.stations.${i}.t`)}></h3><p ${k(`journey.stations.${i}.d`)}></p>${i === 2 ? `<span class="stamp" ${k('journey.stamp')}></span>` : ''}</li>`).join(''),
    credGrid: c.credentials.cards.map((_, i) => `
      <div class="cred reveal" tabindex="0" role="button" aria-pressed="false">
        <div class="cred__inner">
          <div class="cred__face">
            <span class="cred__icon" aria-hidden="true">${['B.E', 'ZAB', 'IT'][i]}</span>
            <h3 ${k(`credentials.cards.${i}.t`)}></h3>
            <p class="issuer" ${k(`credentials.cards.${i}.s`)}></p>
            <p class="flip-hint" aria-hidden="true" ${k('credentials.flip')}></p>
          </div>
          <div class="cred__face cred__face--back">
            <span class="check" aria-hidden="true">✓ verified</span>
            <p ${k(`credentials.cards.${i}.b`)}></p>
          </div>
        </div>
      </div>`).join('') + `
      <div class="cred cred--langs reveal">
        <div class="cred__face">
          <span class="cred__icon" aria-hidden="true">Aa</span>
          <h3 class="sr-only" ${k('credentials.langTitle')}></h3>
          ${c.credentials.langs.map((_, i) => `
          <div class="lang-row"><div><span ${k(`credentials.langs.${i}.n`)}></span><small ${k(`credentials.langs.${i}.l`)}></small></div>
          <div class="lang-bar" aria-hidden="true"><i data-w="${LANG_LEVELS[i]}"></i></div></div>`).join('')}
        </div>
      </div>`,
    skillsSr: [...SKILLS.infra, ...SKILLS.soft]
      .map(([name, hubs]) => `<li>${escapeHtml(name)} — ${hubs.map((h) => escapeHtml(c.skills.hubs[h])).join(', ')}</li>`).join(''),
    ragSteps: c.projects.lexai.steps.map((_, i) => `<li ${k(`projects.lexai.steps.${i}`)}></li>`).join(''),
    lexaiPoints: c.projects.lexai.points.map((_, i) => `<li ${k(`projects.lexai.points.${i}`)}></li>`).join(''),
    cobraPoints: c.projects.cobra.points.map((_, i) => `<li ${k(`projects.cobra.points.${i}`)}></li>`).join(''),
    lexaiTech: c.lexai.tech.map((x) => `<li>${escapeHtml(x)}</li>`).join(''),
    cobraTech: c.cobra.tech.map((x) => `<li>${escapeHtml(x)}</li>`).join(''),
    langSwitch: LANGS.map((l) =>
      `<a href="${LANG_PATHS[l]}" hreflang="${l}" lang="${l}" aria-label="${escapeHtml(c.langNames[l])}"${l === lang ? ' aria-current="true"' : ''} data-lang-btn="${l}">${l === 'ar' ? 'ع' : l.toUpperCase()}</a>`).join(''),
  };
}

function jsonLd(lang) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nawar Meree',
    url: SITE + LANG_PATHS[lang],
    image: `${SITE}/img/og.png`,
    jobTitle: content[lang].hero.roles[0],
    address: { '@type': 'PostalAddress', addressLocality: 'Leverkusen', addressCountry: 'DE' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Al-Baath University' },
    knowsLanguage: ['ar', 'de', 'en'],
    knowsAbout: [...SKILLS.infra, ...SKILLS.soft].map(([n]) => n),
    sameAs: [CONTACT.github, CONTACT.linkedin],
  };
  // "<" is escaped so the JSON can never close the script element
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function tokens(lang) {
  const c = content[lang];
  const url = SITE + LANG_PATHS[lang];
  return {
    LANG: lang,
    DIR: lang === 'ar' ? 'rtl' : 'ltr',
    TITLE: escapeHtml(c.meta.title),
    DESCRIPTION: escapeHtml(c.meta.description),
    CANONICAL: url,
    OG_LOCALE: c.ogLocale,
    OG_LOCALE_ALT: LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${content[l].ogLocale}" />`).join('\n  '),
    HREFLANG: [...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${LANG_PATHS[l]}" />`),
      `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`].join('\n  '),
    JSONLD: jsonLd(lang),
    MAILTO: `mailto:${CONTACT.email}`,
    REQUEST_DOCS: `mailto:${CONTACT.email}?subject=Documents%20request`,
    GITHUB: CONTACT.github,
    LINKEDIN: CONTACT.linkedin,
    LEXAI: CONTACT.lexaiRepo,
    CV: CV_FILES[lang],
    LANG_DE: LANG_PATHS.de,
  };
}

/** Turn the index.html template into a fully rendered page for one language. */
export function renderPage(template, lang) {
  const c = content[lang];
  const tok = tokens(lang);
  let html = template.replace(/%%([A-Z_]+)%%/g, (m, name) => (name in tok ? tok[name] : m));

  const blocks = lists(lang);
  html = html.replace(/(<(\w+)\b[^>]*\bid="([\w-]+)"[^>]*>)(<\/\2>)/g,
    (m, open, tag, id, close) => (id in blocks ? open + blocks[id] + close : m));

  html = html.replace(/(<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)(<\/\2>)/g, (m, open, tag, key, close) => {
    const value = get(c, key);
    if (typeof value !== 'string') throw new Error(`[render] missing text "${key}" (${lang})`);
    return open + escapeHtml(value) + close;
  });
  html = html.replace(/data-i18n-attr="([^"]+)"/g, (m, spec) => {
    const attrs = spec.split(';').map((pair) => {
      const [attr, key] = pair.split(':');
      return `${attr}="${escapeHtml(get(c, key))}"`;
    });
    return `${m} ${attrs.join(' ')}`;
  });
  return html;
}
