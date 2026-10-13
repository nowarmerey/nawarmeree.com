// Builds the repeated DOM structures once. Texts are filled by applyTexts() via data-i18n keys,
// so switching language never rebuilds the DOM (and never breaks running animations).
import { content, CONTACT } from './content.js';

const en = content.en;
const $ = (s) => document.querySelector(s);
const html = (el, markup) => { el.innerHTML = markup; };

export function renderAll() {
  html($('#railLayers'), en.layers.map((l, i) => `<li>${l}<span data-i18n="layerNames.${i}"></span></li>`).join(''));

  html($('#traits'), en.about.traits.map((_, i) => `<li data-i18n="about.traits.${i}"></li>`).join(''));

  const stats = [
    { v: 4, s: '+' }, { v: 1200, s: '' }, { v: 250, s: '' }, { v: 100, s: '' }, { v: 4, s: '' },
  ];
  html($('#stats'), stats.map((st, i) =>
    `<li class="reveal"><b data-count="${st.v}" data-suffix="${st.s}">0</b><span data-i18n="about.stats.${i}"></span></li>`).join(''));

  html($('#infraSteps'), en.infra.steps.map((_, i) =>
    `<li><span class="num">0${i + 1} / 0${en.infra.steps.length}</span><h3 data-i18n="infra.steps.${i}.t"></h3><p data-i18n="infra.steps.${i}.d"></p></li>`).join(''));

  html($('#timeline'), en.journey.stations.map((_, i) =>
    `<li class="reveal"><span class="year" data-i18n="journey.stations.${i}.y"></span><h3 data-i18n="journey.stations.${i}.t"></h3><p data-i18n="journey.stations.${i}.d"></p>${i === 2 ? '<span class="stamp" data-i18n="journey.stamp"></span>' : ''}</li>`).join(''));

  const icons = ['B.E', 'ZAB', 'IT'];
  html($('#credGrid'), en.credentials.cards.map((_, i) => `
    <div class="cred reveal" tabindex="0" role="button" aria-pressed="false">
      <div class="cred__inner">
        <div class="cred__face">
          <span class="cred__icon">${icons[i]}</span>
          <h3 data-i18n="credentials.cards.${i}.t"></h3>
          <p class="issuer" data-i18n="credentials.cards.${i}.s"></p>
          <p class="flip-hint" data-i18n="credentials.flip"></p>
        </div>
        <div class="cred__face cred__face--back">
          <span class="check">✓ verified</span>
          <p data-i18n="credentials.cards.${i}.b"></p>
        </div>
      </div>
    </div>`).join('') + `
    <div class="cred cred--langs reveal">
      <div class="cred__face">
        <span class="cred__icon">Aa</span>
        ${en.credentials.langs.map((_, i) => `
          <div class="lang-row"><div><span data-i18n="credentials.langs.${i}.n"></span><small data-i18n="credentials.langs.${i}.l"></small></div>
          <div class="lang-bar"><i data-w="${[100, 72, 72][i]}"></i></div></div>`).join('')}
      </div>
    </div>`);

  html($('#ragSteps'), en.projects.lexai.steps.map((_, i) => `<li data-i18n="projects.lexai.steps.${i}"></li>`).join(''));
  html($('#lexaiPoints'), en.projects.lexai.points.map((_, i) => `<li data-i18n="projects.lexai.points.${i}"></li>`).join(''));
  html($('#cobraPoints'), en.projects.cobra.points.map((_, i) => `<li data-i18n="projects.cobra.points.${i}"></li>`).join(''));
  html($('#lexaiTech'), en.lexai.tech.map((x) => `<li>${x}</li>`).join(''));
  html($('#cobraTech'), en.cobra.tech.map((x) => `<li>${x}</li>`).join(''));

  $('#lexaiLink').href = CONTACT.lexaiRepo;
  $('#ghBtn').href = CONTACT.github;
  $('#mailBtn').href = `mailto:${CONTACT.email}`;
  $('#requestDocs').href = `mailto:${CONTACT.email}?subject=Documents%20request`;
}
