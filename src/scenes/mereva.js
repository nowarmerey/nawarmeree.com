// Mereva Wallet live demo: KPIs count up, a cash-flow chart with forecast draws itself, the Stripe plan
// activates — then the whole app switches language (EN → DE → AR, with RTL), showing its i18n.
import { gsap } from 'gsap';
import { content } from '../content.js';
import { scope } from '../lib/scene.js';

const DEMO_LANGS = ['en', 'de', 'ar'];
const LANG_BADGE = { en: 'EN', de: 'DE', ar: 'ع' };
const BALANCE = 3240;
const BUDGET = 72;

/** @param {HTMLElement} el  #merevaDemo */
export function initMerevaDemo(el) {
  const { $, $$ } = scope(el);
  const body = $('#mwBody');
  const balance = $('#mwBalance');
  const meter = $('#mwBudget');
  const pct = $('#mwBudgetPct');
  const line = /** @type {SVGPathElement} */ ($('#mwLine'));
  const forecast = /** @type {SVGPathElement} */ ($('#mwForecast'));
  const area = $('#mwArea');
  const check = $('#mwCheck');
  const labels = $$('[data-mw]');
  const badge = $('#mwLang');
  // start in the page's own language, then cycle through the other two
  let langIndex = Math.max(0, DEMO_LANGS.indexOf(document.documentElement.lang));

  const fmt = (lang, value) => new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(value);

  const applyLang = () => {
    const lang = DEMO_LANGS[langIndex];
    const words = content[lang].projects.mereva.demo;
    labels.forEach((l) => { l.textContent = words[l.dataset.mw]; });
    badge.textContent = LANG_BADGE[lang];
    body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };
  applyLang();

  const lengths = [line, forecast].map((p) => p.getTotalLength());
  const state = { balance: 0, budget: 0 };
  const render = () => {
    balance.textContent = fmt(DEMO_LANGS[langIndex], Math.round(state.balance));
    meter.style.width = `${state.budget}%`;
    pct.textContent = `${Math.round(state.budget)}%`;
  };

  const tl = gsap.timeline({ paused: true, repeat: -1 });
  tl.call(() => {
    state.balance = 0;
    state.budget = 0;
    render();
  })
    .set(line, { strokeDasharray: lengths[0], strokeDashoffset: lengths[0] })
    .set(forecast, { strokeDasharray: '4 5', strokeDashoffset: lengths[1], opacity: 0 })
    .set(area, { opacity: 0 })
    .set(check, { scale: 0, opacity: 0 })
    .to(body, { opacity: 1, duration: 0.3 })
    .to(state, { balance: BALANCE, duration: 1.2, ease: 'power2.out', onUpdate: render }, '<')
    .to(state, { budget: BUDGET, duration: 1, ease: 'power2.out', onUpdate: render }, '<0.2')
    .to(line, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, '<0.1')
    .to(area, { opacity: 1, duration: 0.6 }, '>-0.3')
    .to(forecast, { opacity: 1, strokeDashoffset: 0, duration: 0.8, ease: 'none' }, '>-0.1')
    .to(check, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(3)' }, '>')
    .to({}, { duration: 1.6 })
    .to(body, { opacity: 0, duration: 0.3 })
    .call(() => {
      langIndex = (langIndex + 1) % DEMO_LANGS.length;
      applyLang();
    });

  render();
  return {
    play: () => tl.play(),
    pause: () => tl.pause(),
    /** final, static frame (reduced motion) */
    settle: () => {
      tl.progress(0.75).pause();
    },
  };
}
