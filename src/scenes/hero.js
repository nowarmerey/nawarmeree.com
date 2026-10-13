// Chapter 0: boot sequence → avatar is "scanned" into existence → a cable leaves the </> logo.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t, onLangChange } from '../i18n.js';

const BOOT_LINES = [
  ['dim', '[ 0.000] BIOS v26.10 — nawarmeree.com'],
  ['', '[ 0.012] cpu0: curiosity @ 8 cores ............ <span class="ok">ok</span>'],
  ['', '[ 0.031] mounting /experience (4+ years) ...... <span class="ok">ok</span>'],
  ['', '[ 0.047] eth0: link up 1000Mb/s full-duplex'],
  ['', '[ 0.062] fortigate: policies loaded ........... <span class="ok">ok</span>'],
  ['', '[ 0.079] i18n: ar · de · en ................... <span class="ok">ok</span>'],
  ['dim', '[ 0.091] starting nawar.service'],
  ['', '&gt; initializing nawar.sys'],
];
const SCRAMBLE = '!<>-_\\/[]{}—=+*^?#01';

function runBoot() {
  const boot = document.getElementById('boot');
  const log = document.getElementById('bootLog');
  return new Promise((resolve) => {
    let done = false;
    const tl = gsap.timeline({ onComplete: finish });
    BOOT_LINES.forEach(([cls, text], i) => {
      tl.call(() => { log.innerHTML += `<span class="${cls}">${text}</span>\n`; }, null, i * 0.13);
    });
    const bar = { p: 0 };
    tl.call(() => { log.innerHTML += '<span id="bootBar"></span>'; });
    tl.to(bar, {
      p: 1, duration: 0.6, ease: 'power2.inOut',
      onUpdate: () => {
        const n = Math.round(bar.p * 20);
        const el = document.getElementById('bootBar');
        if (el) el.textContent = `> loading experience [${'█'.repeat(n)}${'·'.repeat(20 - n)}] ${Math.round(bar.p * 100)}%`;
      },
    });
    tl.to({}, { duration: 0.25 });

    function finish() {
      if (done) return;
      done = true;
      tl.kill();
      // CRT switch-off: collapse to a line, then to a dot
      gsap.timeline({ onComplete: () => { boot.remove(); resolve(); } })
        .to(boot, { scaleY: 0.004, duration: 0.28, ease: 'power3.in', backgroundColor: '#39ff9c' })
        .to(boot, { scaleX: 0, duration: 0.22, ease: 'power3.in' })
        .set(boot, { display: 'none' });
      boot.classList.add('is-off');
    }
    boot.addEventListener('click', finish, { once: true });
    window.addEventListener('keydown', finish, { once: true });
  });
}

function splitName(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ')
    .map((word) => `<span class="word">${[...word].map((c) => `<span class="ch" aria-hidden="true">${c}</span>`).join('')}</span>`)
    .join(' ');
  return [...el.querySelectorAll('.ch')];
}

function scramble(chars, duration = 1.4) {
  const finals = chars.map((c) => c.textContent);
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1, duration, ease: 'none',
    onUpdate: () => {
      chars.forEach((c, i) => {
        const settle = (i + 1) / chars.length;
        if (state.p >= settle) { c.textContent = finals[i]; c.classList.remove('is-scramble'); }
        else if (state.p > settle - 0.55) {
          c.textContent = SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
          c.classList.add('is-scramble');
        }
      });
    },
  });
}

function roleTyper(el) {
  let idx = 0;
  let tl;
  const cycle = () => {
    const roles = t('hero.roles');
    const word = roles[idx % roles.length];
    const s = { n: 0 };
    tl = gsap.timeline({ onComplete: () => { idx++; cycle(); } })
      .to(s, { n: word.length, duration: word.length * 0.045, ease: 'none', onUpdate: () => { el.textContent = word.slice(0, Math.round(s.n)); } })
      .to(s, { n: 0, duration: word.length * 0.025, ease: 'none', delay: 2, onUpdate: () => { el.textContent = word.slice(0, Math.round(s.n)); } });
  };
  cycle();
  onLangChange(() => { tl?.kill(); idx = 0; cycle(); });
}

export async function initHero(reduced) {
  const nameEl = document.getElementById('heroName');
  const chars = splitName(nameEl);
  const role = document.getElementById('heroRole');
  const cablePath = document.getElementById('heroCablePath');
  const len = cablePath.getTotalLength();
  const textBits = ['.hero__hello', '.hero__role', '.hero__tagline', '.hero__loc', '.hero__cta', '.scroll-hint'];

  if (reduced) {
    document.getElementById('boot').remove();
    role.textContent = t('hero.roles')[0];
    onLangChange(() => { role.textContent = t('hero.roles')[0]; });
    return;
  }

  gsap.set(textBits, { opacity: 0, y: 20 });
  gsap.set(chars, { opacity: 0 });
  gsap.set('.avatar__img', { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(['.avatar__halo', '.avatar__ring'], { opacity: 0, scale: 0.8 });
  gsap.set(cablePath, { strokeDasharray: len, strokeDashoffset: len });

  await runBoot();

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(['.avatar__halo', '.avatar__ring'], { opacity: 1, scale: 1, duration: 1.4 }, 0)
    // scan line sweeps up while the image is revealed beneath it
    .set('.avatar__scan', { opacity: 1, top: '100%' }, 0.1)
    .to('.avatar__scan', { top: '0%', duration: 1.3, ease: 'power2.inOut' }, 0.1)
    .to('.avatar__img', { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power2.inOut' }, 0.1)
    .to('.avatar__scan', { opacity: 0, duration: 0.3 }, 1.4)
    .fromTo('.avatar__img', { filter: 'brightness(2.2) saturate(0)' }, { filter: 'brightness(1) saturate(1)', duration: 1 }, 1.2)
    // the </> logo lights up and a cable leaves it
    .to('.avatar__logo-glow', { opacity: 1, duration: 0.3, ease: 'power2.out' }, 1.5)
    .to('.avatar__logo-glow', { scale: 2.2, repeat: 1, yoyo: true, duration: 0.25 }, 1.5)
    .to(cablePath, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 1.7)
    // name decodes
    .to(chars, { opacity: 1, duration: 0.01, stagger: 0.03 }, 0.3)
    .add(scramble(chars), 0.3)
    .to(textBits, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 1.0)
    .call(() => roleTyper(role), null, 1.2);

  // Leaving the hero: avatar floats up and fades, the cable stays attached
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to('.hero__text', { y: -120, opacity: 0, ease: 'none' }, 0)
    .to('.avatar', { y: -60, scale: 0.92, ease: 'none' }, 0)
    .to('.scroll-hint', { opacity: 0, ease: 'none' }, 0);

  // subtle parallax on the dot grid
  if (matchMedia('(hover: hover)').matches) {
    const gx = gsap.quickTo('.hero .grid-bg', 'x', { duration: 1.2, ease: 'power3' });
    const gy = gsap.quickTo('.hero .grid-bg', 'y', { duration: 1.2, ease: 'power3' });
    const ax = gsap.quickTo('.avatar__img', 'x', { duration: 1.2, ease: 'power3' });
    window.addEventListener('pointermove', (e) => {
      const dx = e.clientX / innerWidth - 0.5;
      const dy = e.clientY / innerHeight - 0.5;
      gx(dx * -24); gy(dy * -24); ax(dx * 10);
    });
  }
  ScrollTrigger.refresh();
}
