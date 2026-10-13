import { describe, expect, test } from 'vitest';
import { content, LANGS, LANG_PATHS, SKILLS, SKILL_HUBS } from '../src/content.js';

/** Flatten a dictionary into dotted keys; arrays of strings count as one leaf, arrays of objects are walked. */
const keys = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => {
  const path = `${prefix}${k}`;
  if (Array.isArray(v)) return v.every((x) => typeof x === 'string') ? [`${path}[${v.length}]`] : v.flatMap((x, i) => keys(x, `${path}.${i}.`));
  return v && typeof v === 'object' ? keys(v, `${path}.`) : [path];
});

describe('i18n dictionaries', () => {
  const reference = keys(content.en).sort();

  test.each(LANGS)('"%s" has exactly the same keys (and list lengths) as "en"', (lang) => {
    expect(keys(content[lang]).sort()).toEqual(reference);
  });

  test.each(LANGS)('"%s" has no empty strings', (lang) => {
    const empty = keys(content[lang]).filter((k) => {
      const value = k.replace(/\[\d+\]$/, '').split('.').reduce((o, p) => o?.[p], content[lang]);
      return typeof value === 'string' && value.trim() === '';
    });
    expect(empty).toEqual([]);
  });

  test('every language has a route', () => {
    expect(Object.keys(LANG_PATHS).sort()).toEqual([...LANGS].sort());
  });

  test('every skill links only to known hubs, and every hub has a label', () => {
    for (const [, hubs] of [...SKILLS.infra, ...SKILLS.soft]) {
      for (const hub of hubs) expect(SKILL_HUBS).toContain(hub);
    }
    for (const lang of LANGS) for (const hub of SKILL_HUBS) expect(content[lang].skills.hubs[hub]).toBeTruthy();
  });
});
