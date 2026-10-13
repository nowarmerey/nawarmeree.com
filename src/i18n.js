import { content } from './content.js';

const SUPPORTED = ['ar', 'de', 'en'];
const STORAGE_KEY = 'nm-lang';
const listeners = new Set();

let current = detect();

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch {}
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : 'en';
}

/** Resolve a dotted key ("infra.steps.2.t") in the current dictionary. */
export function t(key, lang = current) {
  return key.split('.').reduce((obj, part) => (obj == null ? obj : obj[part]), content[lang]);
}

export const lang = () => current;
export const isRTL = () => current === 'ar';
export const onLangChange = (fn) => listeners.add(fn);

export function applyTexts(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (typeof value === 'string') el.textContent = value;
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    // format: "attr:key;attr2:key2"
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      const value = t(key);
      if (typeof value === 'string') el.setAttribute(attr, value);
    });
  });
}

export function setLang(next) {
  if (!SUPPORTED.includes(next)) return;
  current = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  const html = document.documentElement;
  html.lang = next;
  html.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  document.querySelectorAll('[data-lang-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langBtn === next)));
  applyTexts();
  listeners.forEach((fn) => fn(next));
}
