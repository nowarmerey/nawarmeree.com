// Self-hosted fonts (GDPR: no request to Google). Only the latin (incl. umlauts) and arabic subsets are
// shipped; unicode-range keeps the Arabic files off non-Arabic pages.
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { mount } from './lib/scene.js';
import {
  initCursor, initHeader, initMenu, initRail, initAccentJourney, initReveals, initCounters, initMagnets, initTilt, initCredentials,
} from './scenes/ui.js';
import { initHero } from './scenes/hero.js';
import { initInfra } from './scenes/infra.js';
import { initJourney } from './scenes/journey.js';
import { initSkills } from './scenes/skills.js';
import { initProjects } from './scenes/projects.js';
import { initContact } from './scenes/contact.js';

gsap.registerPlugin(ScrollTrigger);

// the story always starts at the beginning (unless a #section was linked)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!window.location.hash) window.scrollTo(0, 0);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
if (reduced) document.documentElement.classList.add('reduced');

// ── smooth scroll ──
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToTarget = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  else target.scrollIntoView();
  // move keyboard focus with the scroll (skip link, nav)
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
};
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
  });
});

// ── scenes ──
// Above the fold first; everything below is initialised when the main thread is idle (lower TBT on phones).
initCursor();
initMenu();
mount('hero', '#hero', initHero, { reduced });

const mm = gsap.matchMedia();
const opts = { reduced, mm };
/**
 * Below-the-fold work, one small task per scene, run in this order (pinned scenes first: triggers created
 * later then account for the pin spacing). Yielding between tasks keeps every task short (low TBT on phones).
 */
const BELOW_THE_FOLD = [
  () => mount('infra', '#infra', initInfra, opts),
  () => mount('projects', '#projects', initProjects, opts),
  () => mount('journey', '#journey', initJourney, opts),
  () => mount('skills', '#skills', initSkills, opts),
  () => mount('contact', '#contact', initContact, opts),
  () => {
    initCredentials(reduced);
    initHeader();
    initRail();
    initAccentJourney();
    if (!reduced) { initReveals(); initMagnets(); initTilt(); }
    initCounters(reduced);
  },
  () => {
    ScrollTrigger.refresh();
    // a deep link (#skills) must land on the section's final position, after the pins exist
    const target = window.location.hash && document.querySelector(window.location.hash);
    if (target) scrollToTarget(target);
  },
];
const idle = (fn) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 800 }) : setTimeout(fn, 50));
const runNext = () => {
  const task = BELOW_THE_FOLD.shift();
  if (!task) return;
  task();
  idle(runNext);
};
idle(runNext);

// fonts change layout heights → recompute pins once they are ready
document.fonts?.ready.then(() => ScrollTrigger.refresh());
