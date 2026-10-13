// Chapter 6: skills as a live network topology. Skill nodes link to the projects (hubs) where they were used.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isRTL, onLangChange } from '../i18n.js';

const HUBS = [
  { id: 'sada', y: 14 },
  { id: 'berger', y: 38 },
  { id: 'cobra', y: 62 },
  { id: 'lexai', y: 86 },
];
const INFRA = [
  ['Windows Server', ['sada', 'berger']],
  ['Active Directory · GPO', ['sada']],
  ['MikroTik', ['sada']],
  ['Huawei', ['sada']],
  ['FortiGate', ['sada']],
  ['Backup & Recovery', ['sada', 'berger', 'cobra']],
  ['Zabbix', ['sada']],
  ['Helpdesk · Remote', ['sada', 'berger']],
  ['Microsoft 365', ['berger']],
  ['ZKTeco', ['sada']],
  ['Linux', ['cobra']],
];
const SOFT = [
  ['VBA', ['sada']],
  ['Python', ['lexai']],
  ['FastAPI', ['lexai']],
  ['PostgreSQL', ['lexai', 'cobra']],
  ['pgvector · RAG', ['lexai']],
  ['Gemini AI', ['lexai']],
  ['JWT · Auth', ['lexai', 'cobra']],
  ['TypeScript', ['cobra']],
  ['React', ['cobra']],
  ['Electron', ['cobra']],
  ['HTML · CSS · JS', ['lexai', 'cobra']],
];

export function initSkills(reduced) {
  const topo = document.getElementById('topo');
  const svg = document.getElementById('topoLines');
  const nodes = [];
  const hubNodes = {};

  const hubWrap = document.createElement('div');
  hubWrap.className = 'topo__hubs';
  topo.appendChild(hubWrap);

  HUBS.forEach((h) => {
    const b = document.createElement('button');
    b.className = 'node node--hub';
    b.dataset.i18n = `skills.hubs.${h.id}`;
    b.style.setProperty('--x', 50); b.style.setProperty('--y', h.y);
    hubWrap.appendChild(b);
    hubNodes[h.id] = { el: b, x: 50, y: h.y, links: [] };
  });

  const addGroup = (list, side) => list.forEach(([label, hubs], i) => {
    const b = document.createElement('button');
    b.className = `node node--${side}`;
    b.textContent = label;
    const y = 5 + (i * 90) / (list.length - 1);
    const zig = i % 2 ? 9 : 0;
    const x = side === 'infra' ? 10 + zig : 90 - zig;
    topo.appendChild(b);
    const n = { el: b, x, y, hubs, lines: [] };
    nodes.push(n);
    hubs.forEach((h) => hubNodes[h].links.push(n));
  });
  addGroup(INFRA, 'infra');
  addGroup(SOFT, 'soft');

  const legend = document.createElement('div');
  legend.className = 'topo__legend';
  legend.innerHTML = '<span data-i18n="skills.groups.0"></span><span data-i18n="skills.groups.1"></span>';
  topo.appendChild(legend);

  // lines (one per skill→hub link)
  const lines = [];
  nodes.forEach((n) => n.hubs.forEach((h) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    svg.appendChild(line);
    const rec = { line, skill: n, hub: hubNodes[h] };
    n.lines.push(rec);
    hubNodes[h].lines = hubNodes[h].lines || [];
    hubNodes[h].lines.push(rec);
    lines.push(rec);
  }));

  const layout = () => {
    const w = topo.clientWidth, h = topo.clientHeight;
    const mx = (x) => (isRTL() ? 100 - x : x);
    [...nodes, ...Object.values(hubNodes)].forEach((n) => {
      n.el.style.left = `${mx(n.x)}%`;
      n.el.style.top = `${n.y}%`;
    });
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    lines.forEach(({ line, skill, hub }) => {
      line.setAttribute('x1', (mx(skill.x) / 100) * w); line.setAttribute('y1', (skill.y / 100) * h);
      line.setAttribute('x2', (mx(hub.x) / 100) * w); line.setAttribute('y2', (hub.y / 100) * h);
    });
  };
  layout();
  window.addEventListener('resize', layout);
  onLangChange(() => requestAnimationFrame(layout));

  // highlight
  const clear = () => {
    topo.classList.remove('has-focus');
    topo.querySelectorAll('.is-lit').forEach((e) => e.classList.remove('is-lit'));
  };
  const lightSkill = (n) => {
    clear(); topo.classList.add('has-focus');
    n.el.classList.add('is-lit');
    n.lines.forEach((r) => { r.line.classList.add('is-lit'); r.hub.el.classList.add('is-lit'); });
  };
  const lightHub = (hub) => {
    clear(); topo.classList.add('has-focus');
    hub.el.classList.add('is-lit');
    hub.lines.forEach((r) => { r.line.classList.add('is-lit'); r.skill.el.classList.add('is-lit'); });
  };
  nodes.forEach((n) => {
    n.el.addEventListener('pointerenter', () => lightSkill(n));
    n.el.addEventListener('focus', () => lightSkill(n));
    n.el.addEventListener('click', () => lightSkill(n));
  });
  Object.values(hubNodes).forEach((hub) => {
    hub.el.addEventListener('pointerenter', () => lightHub(hub));
    hub.el.addEventListener('focus', () => lightHub(hub));
    hub.el.addEventListener('click', () => lightHub(hub));
  });
  topo.addEventListener('pointerleave', clear);

  if (reduced) return;

  // entrance + idle "traffic" packets travelling along random links
  const all = [...Object.values(hubNodes).map((h) => h.el), ...nodes.map((n) => n.el)];
  gsap.set(all, { opacity: 0, scale: 0.6 });
  gsap.set(svg, { opacity: 0 });
  let trafficOn = false;
  ScrollTrigger.create({
    trigger: topo, start: 'top 75%', once: true,
    onEnter: () => {
      gsap.to(Object.values(hubNodes).map((h) => h.el), { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' });
      gsap.to(nodes.map((n) => n.el), { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(2)', delay: 0.3 });
      gsap.to(svg, { opacity: 1, duration: 1, delay: 0.6, onComplete: () => { trafficOn = true; } });
    },
  });

  const sendPacket = () => {
    if (trafficOn && lines.length && document.visibilityState === 'visible' && svg.getBoundingClientRect().height) {
      const { line } = lines[(Math.random() * lines.length) | 0];
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', 2.5); c.setAttribute('class', 'packet');
      const x1 = +line.getAttribute('x1'), y1 = +line.getAttribute('y1');
      const x2 = +line.getAttribute('x2'), y2 = +line.getAttribute('y2');
      c.setAttribute('cx', x1); c.setAttribute('cy', y1);
      svg.appendChild(c);
      gsap.to(c, { attr: { cx: x2, cy: y2 }, duration: 1.2, ease: 'power1.inOut', onComplete: () => c.remove() });
    }
    gsap.delayedCall(0.35, sendPacket);
  };
  sendPacket();
}
