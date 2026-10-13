// Chapter 2: a 4-floor plant is wired up floor by floor while the visitor scrolls (pinned scene).
import { gsap } from 'gsap';
import { scope } from '../lib/scene.js';
import { svgEl as el } from '../lib/svg.js';

const CX = 300, HW = 200, HH = 80, FLOOR_GAP = 110, BASE_Y = 500, FLOORS = 4;

const floorY = (i) => BASE_Y - i * FLOOR_GAP;
// isometric point on floor i; s → towards right corner, t → towards left corner
const P = (i, s, t) => [CX + HW * s - HW * t, floorY(i) - HH + HH * s + HH * t];

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function buildScene(svg) {
  const g = { floors: [], pillars: [], racks: [], leds: [], cables: [], wifi: [], devices: [], packets: [] };
  const rand = rng(42);

  for (let i = 0; i < FLOORS; i++) {
    const y = floorY(i);
    const floor = el('g', { class: 'floor' }, svg);
    const top = `${CX},${y - HH} ${CX + HW},${y} ${CX},${y + HH} ${CX - HW},${y}`;
    const sides = `${CX - HW},${y} ${CX},${y + HH} ${CX + HW},${y} ${CX + HW},${y + 9} ${CX},${y + HH + 9} ${CX - HW},${y + 9}`;
    el('polygon', { points: sides, class: 'slab slab--side' }, floor);
    el('polygon', { points: top, class: 'slab' }, floor);
    el('text', { x: CX + HW + 14, y: y + 4, class: 'label' }, floor).textContent = `F${i + 1}`;
    g.floors.push(floor);

    if (i < FLOORS - 1) {
      [[CX - HW, y], [CX + HW, y], [CX, y + HH]].forEach(([x, yy]) => {
        g.pillars.push(el('line', { x1: x, y1: yy, x2: x, y2: yy - FLOOR_GAP, class: 'pillar' }, svg));
      });
    }
  }

  // devices first so racks/wifi render above them
  for (let i = 0; i < FLOORS; i++) {
    for (let k = 0; k < 22; k++) {
      const s = 0.3 + rand() * 0.62, t = 0.08 + rand() * 0.84;
      if (s < 0.42 && t < 0.42) continue;
      const [x, y] = P(i, s, t);
      g.devices.push(el('rect', { x: x - 3, y: y - 2, width: 6, height: 4, rx: 1, class: 'device' }, svg));
    }
  }

  // backbone cable up through the server rooms, plus a horizontal run on every floor
  const rackPos = (i) => P(i, 0.2, 0.22);
  for (let i = 0; i < FLOORS; i++) {
    const [x, y] = rackPos(i);
    const [ax, ay] = P(i, 0.2, 0.82);
    const [bx, by] = P(i, 0.85, 0.82);
    g.cables.push(el('path', { d: `M${x} ${y} L${ax} ${ay} L${bx} ${by}`, class: 'cable' }, svg));
  }
  const [x0, y0] = rackPos(0);
  const [x3, y3] = rackPos(FLOORS - 1);
  const backbone = el('path', { d: `M${x0} ${y0} L${x3} ${y3}`, class: 'cable' }, svg);
  g.cables.unshift(backbone);

  for (let i = 0; i < FLOORS; i++) {
    const [x, y] = rackPos(i);
    const rack = el('g', {}, svg);
    el('rect', { x: x - 10, y: y - 30, width: 20, height: 30, rx: 2, class: 'rack' }, rack);
    for (let r = 0; r < 4; r++) {
      g.leds.push(el('circle', { cx: x - 4, cy: y - 25 + r * 7, r: 1.6, class: 'rack-led' }, rack));
    }
    g.racks.push(rack);

    const [wx, wy] = P(i, 0.62, 0.38);
    const w = el('g', { class: 'wifi-g' }, svg);
    [8, 14, 20].forEach((r) => el('path', { d: `M${wx - r} ${wy - 4 - r * 0.3} Q${wx} ${wy - 4 - r * 0.9} ${wx + r} ${wy - 4 - r * 0.3}`, class: 'wifi' }, w));
    el('circle', { cx: wx, cy: wy - 3, r: 2.5, class: 'rack-led' }, w);
    g.wifi.push(w);
  }

  g.shield = el('ellipse', { cx: CX, cy: 330, rx: 268, ry: 300, class: 'shield' }, svg);
  for (let k = 0; k < 9; k++) {
    const a = rand() * Math.PI * 2;
    g.packets.push({
      node: el('circle', { cx: CX + Math.cos(a) * 430, cy: 330 + Math.sin(a) * 420, r: 4, class: 'packet' }, svg),
      a,
    });
  }
  return g;
}

const dash = (node) => {
  const len = node.getTotalLength();
  gsap.set(node, { strokeDasharray: len, strokeDashoffset: len });
};

/**
 * @param {HTMLElement} root  #infra
 * @param {{ reduced: boolean, mm: gsap.MatchMedia }} opts
 */
export function initInfra(root, { reduced, mm }) {
  const { $, $$ } = scope(root);
  const svg = $('#building');
  const g = buildScene(svg);
  const steps = $$('#infraSteps li');
  const hud = { devices: $('#hudDevices'), floors: $('#hudFloors'), time: $('#hudTime') };
  const counters = { devices: 0, floors: 0, time: 100 };
  const renderHud = () => {
    hud.devices.textContent = String(Math.round(counters.devices));
    hud.floors.textContent = `${Math.round(counters.floors)}/4`;
    hud.time.textContent = `${Math.round(counters.time)}%`;
  };

  g.floors.forEach((f) => f.querySelectorAll('polygon').forEach(dash));
  g.pillars.forEach(dash);
  g.cables.forEach(dash);
  gsap.set(g.floors, { opacity: 0 });
  gsap.set(g.racks, { opacity: 0, y: 12 });
  gsap.set(g.wifi, { opacity: 0, scale: 0.4, transformOrigin: '50% 100%' });
  gsap.set(g.devices, { opacity: 0.15 });
  dash(g.shield);
  gsap.set(g.shield, { fillOpacity: 0 });
  gsap.set(g.packets.map((p) => p.node), { opacity: 0 });

  // Each step builds its own timeline with positions relative to its start. The master timeline places
  // them one after another under a label, so adding, removing or re-timing a step never shifts the others.
  /** @type {Array<() => gsap.core.Timeline>} */
  const STEP_SCENES = [
    // 1 · floors
    () => {
      const t = gsap.timeline();
      g.floors.forEach((f, i) => {
        t.to(f, { opacity: 1, duration: 0.1 }, i * 0.2)
          .to(f.querySelectorAll('polygon'), { strokeDashoffset: 0, duration: 0.5 }, i * 0.2);
      });
      return t.to(g.pillars, { strokeDashoffset: 0, duration: 0.5, stagger: 0.03 }, 0.3)
        .to(counters, { floors: 4, duration: 0.8, onUpdate: renderHud }, 0.1);
    },
    // 2 · server rooms
    () => gsap.timeline()
      .to(g.racks, { opacity: 1, y: 0, duration: 0.4, stagger: 0.12, ease: 'back.out(2)' }, 0)
      .to(g.leds, { fill: '#ffffff', duration: 0.05, stagger: { each: 0.02, from: 'random' } }, 0.3),
    // 3 · cabling + wifi
    () => gsap.timeline()
      .to(g.cables, { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 }, 0)
      .to(g.wifi, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' }, 0.5),
    // 4 · devices light up
    () => gsap.timeline()
      .to(g.devices, {
        opacity: 1, duration: 0.05, stagger: { each: 0.012, from: 'random' },
        onStart: () => g.devices.forEach((d) => d.classList.add('is-on')),
        onReverseComplete: () => g.devices.forEach((d) => d.classList.remove('is-on')),
      }, 0)
      .to(counters, { devices: 250, duration: 1, ease: 'none', onUpdate: renderHud }, 0),
    // 5 · firewall shield blocks incoming packets
    () => {
      const t = gsap.timeline()
        .to(g.shield, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0)
        .to(g.shield, { fillOpacity: 1, duration: 0.4 }, 0.4);
      g.packets.forEach((p, k) => {
        const at = 0.2 + k * 0.08;
        t.to(p.node, { opacity: 1, duration: 0.05 }, at)
          .to(p.node, { attr: { cx: CX + Math.cos(p.a) * 268, cy: 330 + Math.sin(p.a) * 300 }, duration: 0.35, ease: 'power1.in' }, at)
          .to(p.node, { attr: { r: 14 }, opacity: 0, duration: 0.2 }, at + 0.35);
      });
      return t;
    },
    // 6 · automation
    () => gsap.timeline()
      .to(counters, { time: 40, duration: 0.8, ease: 'power2.inOut', onUpdate: renderHud }, 0)
      .to(g.leds, { fill: '#39ff9c', duration: 0.05, stagger: 0.01 }, 0),
  ];

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: true });
  STEP_SCENES.forEach((build, i) => {
    const label = `step${i + 1}`;
    tl.addLabel(label, i === 0 ? 0 : '+=0.1');
    if (i > 0) tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power2.out' }, `${label}-=0.05`);
    tl.to(steps[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, label)
      .add(build(), `${label}+=0.1`);
  });
  tl.to({}, { duration: 0.5 }); // hold the final state before the pin releases

  gsap.set(steps, { autoAlpha: 0, y: 24 });
  renderHud();

  if (reduced) {
    tl.progress(1);
    gsap.set(steps, { autoAlpha: 1, y: 0 });
    $('.infra__steps').classList.add('is-static');
    return;
  }

  const progressBar = $('#infraProgress');
  mm.add('all', () => {
    gsap.to(tl, {
      progress: 1, ease: 'none',
      scrollTrigger: {
        trigger: $('.infra__pin'), pin: true, start: 'top top', end: () => `+=${innerHeight * 3.2}`, scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => { progressBar.style.width = `${self.progress * 100}%`; },
      },
    });
  });
}
