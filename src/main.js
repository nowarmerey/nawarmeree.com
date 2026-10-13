import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

import { lang, setLang, onLangChange, applyTexts } from './i18n.js';
import { renderAll } from './render.js';
import { initCursor, initHeader, initRail, initAccentJourney, initReveals, initCounters, initMagnets, initTilt, initCredentials } from './scenes/ui.js';
import { initHero } from './scenes/hero.js';
import { initInfra } from './scenes/infra.js';
import { initJourney } from './scenes/journey.js';
import { initSkills } from './scenes/skills.js';
import { initProjects } from './scenes/projects.js';
import { initContact } from './scenes/contact.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// the story always starts at the beginning
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
if (reduced) document.documentElement.classList.add('reduced');

// ── content & language ──
renderAll();
setLang(lang());
document.querySelectorAll('[data-lang-btn]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.langBtn)));

// ── smooth scroll ──
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else target.scrollIntoView();
  });
});

// ── scenes ──
// pinned scenes first: triggers created later then account for the pin spacing
const mm = gsap.matchMedia();
initInfra(reduced, mm);
const projects = initProjects(reduced, mm);
initJourney(reduced);
initCredentials(reduced);
initSkills(reduced);
initContact(reduced);
initCursor();
initHeader();
const rail = initRail();
initAccentJourney();
if (!reduced) { initReveals(); initMagnets(); initTilt(); }
initCounters(reduced);
applyTexts(); // scenes above create nodes with data-i18n keys
initHero(reduced);

onLangChange(() => {
  rail.refresh();
  projects.renderTyped();
  requestAnimationFrame(() => ScrollTrigger.refresh());
});

// fonts change layout heights → recompute pins once they are ready
document.fonts?.ready.then(() => ScrollTrigger.refresh());
