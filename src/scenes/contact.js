// Final chapter: the cable plugs into an RJ45 port and a small terminal accepts commands.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t, lang, setLang } from '../i18n.js';
import { CONTACT } from '../content.js';

export function initContact(reduced) {
  const body = document.getElementById('termBody');
  const form = document.getElementById('termForm');
  const input = document.getElementById('termInput');

  const print = (text, cls = '') => {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    if (lang() === 'ar' && !cls.includes('cmd')) line.classList.add('rtl');
    line.innerHTML = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };
  const link = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`;

  const COMMANDS = {
    help: () => print(t('contact.termHelp')),
    contact: () => { print(`email  → ${link(`mailto:${CONTACT.email}`, CONTACT.email)}`); print(`github → ${link(CONTACT.github, CONTACT.github.replace('https://', ''))}`); },
    email: () => { print(link(`mailto:${CONTACT.email}`, CONTACT.email)); window.location.href = `mailto:${CONTACT.email}`; },
    github: () => { print(link(CONTACT.github, CONTACT.github.replace('https://', ''))); window.open(CONTACT.github, '_blank', 'noopener'); },
    about: () => print(t('contact.termAbout')),
    whoami: () => print(`Nawar Meree — ${t('hero.roles').join(' · ')}`),
    clear: () => { body.innerHTML = ''; },
    'sudo hire nawar': () => { print('[sudo] permission granted ✓'); setTimeout(() => { window.location.href = `mailto:${CONTACT.email}?subject=Job%20opportunity`; }, 600); },
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;
    print(raw.trim(), 'cmd');
    if (cmd.startsWith('lang ')) {
      const l = cmd.split(' ')[1];
      if (['ar', 'de', 'en'].includes(l)) { setLang(l); print(`✓ ${l}`); } else print('lang ar|de|en');
      return;
    }
    (COMMANDS[cmd] || (() => print(t('contact.termUnknown'))))();
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });

  const leds = document.querySelectorAll('.port__led');
  const cable = document.getElementById('portCable');

  const greet = () => {
    if (body.childElementCount) return;
    const seq = ['whoami', 'help'];
    let delay = 0;
    seq.forEach((c) => {
      delay += 0.6;
      gsap.delayedCall(delay, () => run(c));
    });
  };

  if (reduced) { leds.forEach((l) => l.classList.add('is-on')); greet(); return; }

  gsap.set(cable, { y: -60 });
  ScrollTrigger.create({
    trigger: '#port', start: 'top 80%', once: true,
    onEnter: () => {
      gsap.timeline()
        .to(cable, { y: 0, duration: 0.8, ease: 'bounce.out' })
        .call(() => leds.forEach((l) => l.classList.add('is-on')))
        .fromTo('.port__status', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5 })
        .call(greet);
    },
  });
}
