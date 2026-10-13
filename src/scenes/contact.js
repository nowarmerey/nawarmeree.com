// Final chapter: the cable plugs into an RJ45 port and a small terminal accepts commands.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t, lang, goToLang } from '../i18n.js';
import { CONTACT, CV_FILES, LANG_PATHS } from '../content.js';

export function initContact(reduced) {
  const body = document.getElementById('termBody');
  const form = document.getElementById('termForm');
  const input = document.getElementById('termInput');

  /**
   * Append one output line. `parts` are plain strings (inserted as text, never as HTML)
   * or { href, label } link descriptors, so typed input can never inject markup.
   */
  const print = (parts, cls = '') => {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    if (lang() === 'ar' && !cls.includes('cmd')) line.classList.add('rtl');
    for (const part of [].concat(parts)) {
      if (typeof part === 'string') { line.append(part); continue; }
      const a = document.createElement('a');
      a.href = part.href;
      a.textContent = part.label;
      if (!part.href.startsWith('mailto:') && !part.href.startsWith('/')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      line.append(a);
    }
    body.append(line);
    body.scrollTop = body.scrollHeight;
  };
  const strip = (url) => url.replace(/^https:\/\/(www\.)?/, '');
  const LINKS = {
    email: { href: `mailto:${CONTACT.email}`, label: CONTACT.email },
    github: { href: CONTACT.github, label: strip(CONTACT.github) },
    linkedin: { href: CONTACT.linkedin, label: strip(CONTACT.linkedin) },
    cv: { href: CV_FILES[lang()], label: CV_FILES[lang()].split('/').pop() },
  };
  const open = (link) => {
    if (link.href.startsWith('mailto:')) window.location.href = link.href;
    else window.open(link.href, '_blank', 'noopener,noreferrer');
  };

  const COMMANDS = {
    help: () => print(t('contact.termHelp')),
    contact: () => ['email', 'linkedin', 'github'].forEach((k) => print([`${k.padEnd(8)} → `, LINKS[k]])),
    email: () => { print(LINKS.email); open(LINKS.email); },
    github: () => { print(LINKS.github); open(LINKS.github); },
    linkedin: () => { print(LINKS.linkedin); open(LINKS.linkedin); },
    cv: () => print(['↓ ', LINKS.cv]),
    about: () => print(t('contact.termAbout')),
    whoami: () => print(`Nawar Meree — ${t('hero.roles').join(' · ')}`),
    clear: () => { body.replaceChildren(); },
    'sudo hire nawar': () => {
      print('[sudo] permission granted ✓');
      setTimeout(() => { window.location.href = `mailto:${CONTACT.email}?subject=Job%20opportunity`; }, 600);
    },
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;
    print(raw.trim().slice(0, 120), 'cmd');
    if (cmd.startsWith('lang ')) {
      const l = cmd.split(' ')[1];
      if (Object.hasOwn(LANG_PATHS, l)) { print(`→ ${LANG_PATHS[l]}`); goToLang(l); } else print('lang ar|de|en');
      return;
    }
    if (Object.hasOwn(COMMANDS, cmd)) COMMANDS[cmd]();
    else print(t('contact.termUnknown'));
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
