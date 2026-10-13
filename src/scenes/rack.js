// The production rack of chapter 7: a 15U CSS-3D server cabinet. Every project is a unit; the active one
// slides out like a drawer. Purely decorative (aria-hidden) — the project text lives in the <article>s.

const U = 20; // px per rack unit

/** Top → bottom. `id` of a project unit must match the data-unit of its <article>. */
export const RACK_UNITS = [
  { type: 'patch', u: 1 },
  { type: 'blank', u: 1 },
  { type: 'project', id: 'cobra', u: 4, name: 'COBRA-SAAS', meta: '4U · PRIVATE', lcd: 'v2 · 500+ commits', bays: 8 },
  { type: 'blank', u: 1 },
  { type: 'project', id: 'lexai', u: 2, name: 'LEXAI', meta: '2U · OPEN SOURCE', lcd: 'rag · pgvector' },
  { type: 'blank', u: 1 },
  { type: 'project', id: 'mereva', u: 2, name: 'MEREVA-WALLET', meta: '2U · OPEN SOURCE', lcd: 'stripe · nextauth' },
  { type: 'blank', u: 1 },
  { type: 'ups', u: 2, name: 'UPS 1500VA' },
];

const div = (cls, parent, text) => {
  const e = document.createElement('div');
  e.className = cls;
  if (text) e.textContent = text;
  parent?.appendChild(e);
  return e;
};

function leds(parent, n, extra = '') {
  const wrap = div('unit__leds', parent);
  for (let k = 0; k < n; k++) div(`led ${k === n - 1 ? 'led--act' : ''} ${extra}`.trim(), wrap);
  return wrap;
}

function buildFront(front, unit) {
  if (unit.type === 'patch') {
    const ports = div('unit__ports', front);
    for (let k = 0; k < 12; k++) div('port', ports).appendChild(Object.assign(document.createElement('i'), { className: 'led' }));
    return;
  }
  if (unit.type === 'blank') return;
  if (unit.type === 'ups') {
    const label = div('unit__label', front);
    div('unit__name', label, unit.name);
    div('unit__meta', label, 'ONLINE · 100%');
    const bars = div('unit__battery', front);
    for (let k = 0; k < 5; k++) div('led', bars);
    return;
  }
  const label = div('unit__label', front);
  div('unit__name', label, unit.name);
  div('unit__meta', label, unit.meta);
  if (unit.bays) {
    const bays = div('unit__bays', front);
    for (let k = 0; k < unit.bays; k++) div('bay', bays).appendChild(Object.assign(document.createElement('i'), { className: 'led led--act' }));
  }
  div('unit__lcd', front, unit.lcd);
  leds(front, 3);
}

/** @param {HTMLElement} el  the .rack container */
export function buildRack(el) {
  const body = div('rack__body', el);
  div('rack__back', body);
  div('rack__side', body);
  div('rack__top', body);
  div('rack__rail rack__rail--l', body);
  div('rack__rail rack__rail--r', body);
  const holder = div('rack__units', body);

  const units = {};
  let top = 0;
  RACK_UNITS.forEach((unit, index) => {
    const u = div(`unit unit--${unit.type}`, holder);
    u.style.top = `${top * U}px`;
    u.style.height = `${unit.u * U}px`;
    u.style.setProperty('--d', `${(index * 0.09).toFixed(2)}s`); // boot order, top to bottom
    buildFront(div('unit__front', u), unit);
    div('unit__side', u);
    div('unit__top', u);
    if (unit.id) units[unit.id] = u;
    top += unit.u;
  });
  body.style.setProperty('--rack-h', `${top * U}px`);

  return {
    body,
    /** power on / off every LED (reversible under scroll scrub) */
    boot: (on) => el.classList.toggle('is-booted', on),
    /** slide one unit out (or none with null) */
    setActive: (id) => Object.entries(units).forEach(([key, u]) => u.classList.toggle('is-out', key === id)),
  };
}
