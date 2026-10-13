import fs from 'node:fs';
import { describe, expect, test } from 'vitest';
import { renderPage, escapeHtml } from '../src/render.js';
import { renderLegal, LEGAL_PAGES } from '../src/legal.js';
import { LANGS, LANG_PATHS, SITE, content } from '../src/content.js';

const template = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('escapeHtml', () => {
  test('neutralises markup', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)"> & co')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; co');
  });
});

describe.each(LANGS)('pre-rendered page "%s"', (lang) => {
  const html = renderPage(template, lang);

  test('no unresolved template tokens', () => {
    expect(html).not.toMatch(/%%[A-Z_]+%%/);
  });

  test('every translated element has text (crawlers see real content)', () => {
    const empty = [...html.matchAll(/<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*><\/\1>/g)].map((m) => m[2]);
    expect(empty).toEqual([]);
  });

  test('every translated element shows exactly its own language (no leftover template text)', () => {
    const get = (key) => key.split('.').reduce((o, k) => o?.[k], content[lang]);
    const wrong = [...html.matchAll(/<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g)]
      .filter(([, , key, text]) => text !== escapeHtml(get(key)))
      .map(([, , key, text]) => `${key}: "${text}"`);
    expect(wrong).toEqual([]);
  });

  test('html lang/dir, canonical and hreflang are correct', () => {
    expect(html).toContain(`<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`);
    expect(html).toContain(`<link rel="canonical" href="${SITE}${LANG_PATHS[lang]}" />`);
    for (const l of LANGS) expect(html).toContain(`hreflang="${l}" href="${SITE}${LANG_PATHS[l]}"`);
    expect(html).toContain('hreflang="x-default"');
  });

  test('JSON-LD is valid and cannot break out of its script tag', () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    expect(json).not.toContain('<');
    expect(JSON.parse(json)['@type']).toBe('Person');
  });

  test('no inline styles or inline event handlers (CSP: style-src/script-src self)', () => {
    expect(html).not.toMatch(/\sstyle="/);
    expect(html).not.toMatch(/\son[a-z]+="/);
  });

  test('external links never leak the opener', () => {
    for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) expect(tag).toContain('rel="noopener noreferrer"');
  });

  test('exactly one h1', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });
});

describe('legal pages', () => {
  test.each(LEGAL_PAGES)('%s renders in German without external resources', (page) => {
    const html = renderLegal(page);
    expect(html).toContain('<html lang="de"');
    expect(html).not.toMatch(/(src|href)="https?:\/\/(?!www\.netlify\.com\/privacy)/);
  });
});
