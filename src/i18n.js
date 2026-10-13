// Runtime i18n. Pages are pre-rendered per language (/, /en/, /ar/), so the language is read from
// <html lang> and switching language is a real navigation. applyTexts() only fills nodes that
// scenes create at runtime.
import { content, LANG_PATHS } from './content.js';

const current = content[document.documentElement.lang] ? document.documentElement.lang : 'de';

export const lang = () => current;
export const isRTL = () => current === 'ar';

/** Resolve a dotted key ("infra.steps.2.t") in the current dictionary. */
export function t(key) {
  const value = key.split('.').reduce((obj, part) => (obj == null ? obj : obj[part]), content[current]);
  if (import.meta.env.DEV && value === undefined) console.warn(`[i18n] missing "${key}" (${current})`);
  return value;
}

export function applyTexts(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (typeof value === 'string') el.textContent = value;
  });
}

export function goToLang(next) {
  if (Object.hasOwn(LANG_PATHS, next) && next !== current) window.location.href = LANG_PATHS[next] + window.location.hash;
}
