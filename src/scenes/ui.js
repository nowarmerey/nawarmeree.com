// Global UI behaviour: cursor, header, OSI rail, accent colour journey, reveals, counters, magnets, tilt.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t } from '../i18n.js';

const ACCENTS = {
  green: { c: '#39ff9c', rgb: '57, 255, 156' },
  cyan: { c: '#4cc9ff', rgb: '76, 201, 255' },
  violet: { c: '#a98bff', rgb: '169, 139, 255' },
};

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.add('is-on');
    xTo(e.clientX); yTo(e.clientY);
  });
  document.addEventListener('pointerover', (e) => {
    cursor.classList.toggle('is-hover', !!(/** @type {Element} */ (e.target)).closest('a, button, .node, .cred, input'));
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
}

export function initHeader() {
  const header = document.getElementById('header');
  let last = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > 400 && y > last);
      last = y;
    },
  });
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  links.forEach((a) => {
    const section = document.querySelector(a.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => self.isActive && links.forEach((l) => l.classList.toggle('is-active', l === a)),
    });
  });
}

/** The glowing thread + OSI layer indicator. */
export function initRail() {
  const rail = document.getElementById('rail');
  const fill = document.getElementById('railFill');
  const chip = document.getElementById('layerChip');
  const items = [...document.querySelectorAll('#railLayers li')];

  const setLayer = (i) => {
    items.forEach((li, k) => {
      li.classList.toggle('is-active', k === i);
      li.classList.toggle('is-past', k < i || i >= items.length);
    });
    if (i >= items.length) {
      chip.querySelector('b').textContent = '✓';
      chip.querySelector('span').textContent = t('contact.status');
    } else {
      chip.querySelector('b').textContent = `L${i + 1}`;
      chip.querySelector('span').textContent = t(`layerNames.${i}`);
    }
  };

  ScrollTrigger.create({
    trigger: '#about', start: 'top 80%', endTrigger: '#contact', end: 'bottom bottom',
    onUpdate: (self) => { fill.style.height = `${self.progress * 100}%`; },
    onToggle: (self) => {
      rail.classList.toggle('is-on', self.isActive);
      chip.classList.toggle('is-on', self.isActive);
    },
  });

  (/** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[data-layer]'))).forEach((section) => {
    const layer = Number(section.dataset.layer);
    ScrollTrigger.create({
      trigger: section, start: 'top 55%', end: 'bottom 55%',
      onEnter: () => setLayer(layer), onEnterBack: () => setLayer(layer),
    });
  });
  setLayer(0);
}

/** Mobile navigation: the header nav becomes a full-screen panel behind a menu button. */
export function initMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', t(open ? 'a11y.close' : 'a11y.menu'));
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if ((/** @type {Element} */ (e.target)).closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/** The accent colour changes with the story's altitude. */
export function initAccentJourney() {
  const root = document.documentElement;
  const go = (name) => gsap.to(root, { '--accent': ACCENTS[name].c, '--accent-rgb': ACCENTS[name].rgb, duration: 1.2, ease: 'power2.out', overwrite: true });
  const zones = [
    ['#hero', 'green'], ['#about', 'green'], ['#infra', 'green'], ['#journey', 'green'],
    ['#credentials', 'cyan'], ['#skills', 'cyan'], ['#projects', 'violet'], ['#contact', 'green'],
  ];
  zones.forEach(([sel, name]) => {
    ScrollTrigger.create({ trigger: sel, start: 'top 55%', end: 'bottom 55%', onEnter: () => go(name), onEnterBack: () => go(name) });
  });
}

export function initReveals() {
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
}

export function initCounters(reduced) {
  (/** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[data-count]'))).forEach((el) => {
    const target = Number(el.dataset.count);
    const fmt = (v) => Math.round(v).toLocaleString('en-US');
    if (reduced) { el.textContent = fmt(target); return; }
    const obj = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(obj.v); } }),
    });
  });
}

export function initMagnets() {
  if (!matchMedia('(hover: hover)').matches) return;
  (/** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.magnetic'))).forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

export function initTilt() {
  if (!matchMedia('(hover: hover)').matches) return;
  (/** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.tilt'))).forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(el, { transformPerspective: 1000 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

export function initCredentials(reduced) {
  (/** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.cred[role="button"]'))).forEach((card) => {
    const flip = () => {
      card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(card.classList.contains('is-flipped')));
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
  (/** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.lang-bar i'))).forEach((bar) => {
    const w = `${bar.dataset.w}%`;
    if (reduced) { bar.style.width = w; return; }
    ScrollTrigger.create({ trigger: bar, start: 'top 92%', once: true, onEnter: () => gsap.to(bar, { width: w, duration: 1.6, ease: 'expo.out' }) });
  });
}
