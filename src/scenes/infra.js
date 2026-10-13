// Chapter 2: "from blueprint to a living plant". A real CSS-3D building (no WebGL): a floor plan is drawn on
// blueprint paper, the camera tilts, floors rise, explode apart, get wired, light up at night, are shielded,
// then the paperwork gets automated. Driven by labelled scroll steps (see STEP_SCENES).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scope } from '../lib/scene.js';
import { svgEl } from '../lib/svg.js';

const FLOORS = 4;
const PLAN = 300; // floor plan size in design px (the whole stage is scaled by --k)
const GAP = { built: 46, exploded: 78 };
const CAMERA = {
  plan: { rotationX: 0, rotationZ: 0, scale: 1.12 },
  iso: { rotationX: 58, rotationZ: -42, scale: 0.62 },
};

/* ───────── floor plan geometry (plan px) ───────── */
const WALLS = [
  'M10 10 H290 V290 H10 Z',
  'M10 140 H60 M80 140 H140 M160 140 H220 M240 140 H290',
  'M10 160 H100 M120 160 H140 M160 160 H200 M220 160 H290',
  'M140 10 V140 M160 10 V140 M140 160 V290 M160 160 V290',
  'M10 92 H92 M92 10 V64',
];
const CABLES = ['M50 46 V150 H285', 'M225 150 V20', 'M225 150 V280', 'M75 150 V280', 'M150 150 V20'];
const QUADRANTS = [[10, 10], [160, 10], [10, 160], [160, 160]];
const SERVER_ROOM = { x: 10, y: 10, w: 82, h: 82 };
const RACKS = [[22, 24], [52, 24]];
const RISER = { x: 74, y: 70 };
const LABELS = [['SERVER', 51, 80], ['OFFICE', 75, 130], ['OFFICE', 225, 130], ['OFFICE', 75, 280], ['OFFICE', 225, 280]];
const VBA_CODE = ['Sub ProcessPayroll()', '  For Each emp In Staff', '    emp.Calculate', '    emp.Export', '  Next emp', 'End Sub'];

const div = (cls, parent) => {
  const e = document.createElement('div');
  e.className = cls;
  parent?.appendChild(e);
  return e;
};

/** Desk positions of one floor: a 3×3 grid per quadrant, minus what the server room covers. */
function deskPositions() {
  const out = [];
  for (const [qx, qy] of QUADRANTS) {
    for (const dy of [18, 52, 86]) {
      for (const dx of [14, 46, 78]) {
        const x = qx + dx, y = qy + dy;
        const inServer = x < SERVER_ROOM.x + SERVER_ROOM.w + 2 && y < SERVER_ROOM.y + SERVER_ROOM.h + 2;
        if (!inServer) out.push([x, y]);
      }
    }
  }
  return out;
}

function buildFloor(i, stack) {
  const floor = div('bp__floor', stack);
  floor.style.setProperty('--i', String(i));
  div('bp__slab', floor);

  const svg = svgEl('svg', { class: 'bp__plan', viewBox: `0 0 ${PLAN} ${PLAN}` }, floor);
  svgEl('rect', { x: SERVER_ROOM.x, y: SERVER_ROOM.y, width: SERVER_ROOM.w, height: SERVER_ROOM.h, class: 'bp__server-zone' }, svg);
  const walls = WALLS.map((d) => svgEl('path', { d, class: 'bp__wall' }, svg));
  const cables = CABLES.map((d) => svgEl('path', { d, class: 'bp__cable' }, svg));
  const labels = LABELS.map(([text, x, y]) => {
    const t = svgEl('text', { x, y, class: 'bp__label' }, svg);
    t.textContent = String(text);
    return t;
  });

  const desks = deskPositions().map(([x, y]) => {
    const d = div('bp__desk', floor);
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    return div('bp__screen', d);
  });

  RACKS.forEach(([x, y]) => {
    const r = div('bp__rack', floor);
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    div('bp__rack-top', r);
    const front = div('bp__rack-front', r);
    for (let k = 0; k < 4; k++) div('bp__led', front);
    div('bp__rack-side', r);
  });

  const ap = div('bp__ap', floor);
  for (let k = 0; k < 3; k++) div('bp__ripple', ap);

  // data packets travel the cables (CSS offset-path; paused until the network is live)
  CABLES.forEach((d, k) => {
    const p = div('bp__pkt', floor);
    p.style.offsetPath = `path("${d}")`;
    p.style.animationDelay = `${(-k * 0.47 - i * 0.31).toFixed(2)}s`;
  });

  return { floor, walls, cables, labels, desks };
}

function buildShield(bp) {
  const svg = svgEl('svg', { class: 'bp__shield', viewBox: '-260 -260 520 520' }, bp);
  const R = 236, S = 17; // dome radius, hex size
  const cells = [];
  const hex = (cx, cy) => Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${(cx + S * Math.cos(a)).toFixed(1)},${(cy + S * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  for (let row = -16; row <= 16; row++) {
    for (let col = -16; col <= 16; col++) {
      const cx = col * S * Math.sqrt(3) + (row % 2 ? (S * Math.sqrt(3)) / 2 : 0);
      const cy = row * S * 1.5;
      const dist = Math.hypot(cx, cy);
      if (dist > R - S * 0.6) continue;
      // the rim is the visible shield; inner cells stay faint so the building shows through (a dome seen from above)
      const cls = dist > R - S * 3.2 ? 'bp__hex' : 'bp__hex bp__hex--inner';
      cells.push({ el: svgEl('polygon', { points: hex(cx, cy), class: cls }, svg), cx, cy });
    }
  }
  const ANGLES = [-2.6, -1.9, -1.2, -0.4, 0.5, 2.3, 3.0];
  const attacks = ANGLES.map((a) => {
    const node = svgEl('circle', { r: 5, cx: Math.cos(a) * 330, cy: Math.sin(a) * 330, class: 'bp__attack' }, svg);
    const hit = [Math.cos(a) * R, Math.sin(a) * R];
    const d = (c) => Math.hypot(c.cx - hit[0], c.cy - hit[1]);
    const near = cells.reduce((best, c) => (d(c) < d(best) ? c : best), cells[0]);
    return { node, hit, near };
  });
  return { cells, attacks };
}

function buildScene(bp) {
  const paper = div('bp__paper', bp);
  const night = div('bp__night', bp);
  const title = div('bp__title mono', bp);
  title.textContent = 'SADA · PLANT · FLOOR PLAN F1–F4 · 1:200';
  const view = div('bp__view', bp);
  const stage = div('bp__stage', view);
  const camera = div('bp__camera', stage);
  const stack = div('bp__stack', camera);
  const floors = Array.from({ length: FLOORS }, (_, i) => buildFloor(i, stack));

  // one vertical cable riser through all floors (stands up from the ground floor's server room)
  const riser = div('bp__riser', floors[0].floor);
  riser.style.left = `${RISER.x}px`;
  riser.style.top = `${RISER.y}px`;
  for (let k = 0; k < 3; k++) div('bp__riser-pkt', riser).style.animationDelay = `${(-k * 0.6).toFixed(1)}s`;

  const shield = buildShield(bp);
  const vba = div('bp__vba mono', bp);
  div('bp__vba-bar', vba).textContent = 'payroll.bas';
  const code = div('bp__vba-code', vba);
  return { paper, night, title, camera, floors, riser, shield, vba, code };
}

/**
 * @param {HTMLElement} root  #infra
 * @param {{ reduced: boolean, mm: gsap.MatchMedia }} opts
 */
export function initInfra(root, { reduced, mm }) {
  const { $, $$ } = scope(root);
  const bp = $('#bp');
  const scene = buildScene(bp);
  const steps = $$('#infraSteps li');
  const hud = { devices: $('#hudDevices'), floors: $('#hudFloors'), time: $('#hudTime') };
  const counters = { devices: 0, floors: 0, time: 100, code: 0 };
  const renderHud = () => {
    hud.devices.textContent = String(Math.round(counters.devices));
    hud.floors.textContent = `${Math.round(counters.floors)}/4`;
    hud.time.textContent = `${Math.round(counters.time)}%`;
  };
  const codeText = VBA_CODE.join('\n');
  const renderCode = () => { scene.code.textContent = codeText.slice(0, Math.round(counters.code * codeText.length)); };

  // fit the 3D stage into the available box
  const fit = () => bp.style.setProperty('--k', (Math.min(bp.clientWidth, bp.clientHeight) / 400).toFixed(3));
  fit();
  new ResizeObserver(fit).observe(bp);

  const all = (key) => scene.floors.flatMap((f) => f[key]);
  const upper = scene.floors.slice(1).map((f) => f.floor);
  const screens = all('desks');
  const deskBoxes = screens.map((s) => s.parentElement);
  const dash = (path) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  };
  /** Add a state class while the playhead is past this point (reversible under scrub). */
  const flag = (cls) => ({
    onStart: () => bp.classList.add(cls),
    onReverseComplete: () => bp.classList.remove(cls),
  });

  // ── initial state: blueprint paper, ground-floor plan only, camera looking straight down ──
  gsap.set(bp, { '--gap': 0, '--rack': 0, '--ink': '#cfe2ff' });
  gsap.set(scene.camera, CAMERA.plan);
  gsap.set(upper, { '--show': 0 });
  scene.floors[0].walls.forEach(dash);
  all('cables').forEach(dash);
  gsap.set([...all('labels'), ...deskBoxes, ...screens, scene.riser, scene.night], { opacity: 0 });
  gsap.set([...scene.shield.cells.map((c) => c.el), ...scene.shield.attacks.map((a) => a.node)], { opacity: 0 });
  gsap.set(scene.vba, { opacity: 0, y: 16 });
  gsap.set(steps, { autoAlpha: 0, y: 24 });
  renderHud();

  /** @type {Array<() => gsap.core.Timeline>} */
  const STEP_SCENES = [
    // 1 · the plan is drawn on blueprint paper, then the camera tilts and the floors rise
    () => gsap.timeline()
      .to(scene.floors[0].walls, { strokeDashoffset: 0, duration: 0.7, stagger: 0.08, ease: 'power1.inOut' }, 0)
      .to(scene.floors[0].labels, { opacity: 1, duration: 0.3, stagger: 0.05 }, 0.45)
      .to(scene.floors[0].desks.map((s) => s.parentElement), { opacity: 1, duration: 0.2, stagger: { each: 0.012, from: 'random' } }, 0.55)
      .to(scene.camera, { ...CAMERA.iso, duration: 1, ease: 'power2.inOut' }, 1)
      .to(scene.title, { opacity: 0, duration: 0.4 }, 1.3)
      .set([...deskBoxes, ...all('labels')], { opacity: 1 }, 1.5)
      .to(bp, { '--gap': GAP.built, duration: 0.9, ease: 'power2.out' }, 1.5)
      .to(upper, { '--show': 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' }, 1.5),

    // 2 · exploded view: floors separate, camera orbits, server racks rise
    () => gsap.timeline()
      .to(bp, { '--gap': GAP.exploded, duration: 0.9, ease: 'power2.inOut' }, 0)
      .to(scene.camera, { rotationZ: -24, duration: 1.1, ease: 'power1.inOut' }, 0)
      .to(bp, { '--rack': 1, duration: 0.5, ease: 'back.out(1.6)', ...flag('is-racks') }, 0.35),

    // 3 · backbone: riser + cables, access points ripple, packets start flowing
    () => gsap.timeline()
      .to(scene.riser, { opacity: 1, duration: 0.3 }, 0)
      .to(all('cables'), { strokeDashoffset: 0, duration: 0.5, stagger: 0.04 }, 0.15)
      .to(counters, { floors: 4, duration: 0.8, onUpdate: renderHud }, 0.15)
      .to(scene.camera, { rotationZ: -34, duration: 1, ease: 'power1.inOut' }, 0)
      .to({}, { duration: 0.1, ...flag('is-live') }, 0.7),

    // 4 · night falls on the paper, every desk lights up
    () => gsap.timeline()
      .to(scene.paper, { opacity: 0, duration: 0.6 }, 0)
      .to(scene.night, { opacity: 1, duration: 0.6 }, 0)
      .to(bp, { '--ink': '#2fbf7f', duration: 0.6 }, 0)
      .to(screens, { opacity: 1, duration: 0.05, stagger: { each: 0.006, from: 'random' } }, 0.2)
      .to(counters, { devices: 250, duration: 0.9, ease: 'none', onUpdate: renderHud }, 0.2)
      .to(scene.camera, { rotationZ: -45, duration: 1, ease: 'power1.inOut' }, 0),

    // 5 · a hexagonal FortiGate shield forms; incoming attacks shatter on it
    () => {
      const t = gsap.timeline()
        .to(scene.shield.cells.map((c) => c.el), { opacity: 1, duration: 0.12, stagger: { each: 0.0025, from: 'edges' } }, 0);
      scene.shield.attacks.forEach((a, k) => {
        const at = 0.45 + k * 0.09;
        t.to(a.node, { opacity: 1, duration: 0.05 }, at)
          .to(a.node, { attr: { cx: a.hit[0], cy: a.hit[1] }, duration: 0.3, ease: 'power1.in' }, at)
          .to(a.node, { attr: { r: 16 }, opacity: 0, duration: 0.2 }, at + 0.3)
          .fromTo(a.near.el, { fill: 'rgba(255, 77, 109, 0.55)' }, { fill: 'rgba(76, 201, 255, 0.05)', duration: 0.4 }, at + 0.3);
      });
      return t;
    },

    // 6 · floors close up again; a VBA macro writes itself and processing time drops
    () => gsap.timeline()
      .to(bp, { '--gap': GAP.built, duration: 0.8, ease: 'power2.inOut' }, 0)
      .to(scene.camera, { rotationZ: -40, rotationX: 55, duration: 0.8, ease: 'power2.inOut' }, 0)
      .to(scene.vba, { opacity: 1, y: 0, duration: 0.3 }, 0.2)
      .to(counters, { code: 1, duration: 0.8, ease: 'none', onUpdate: renderCode }, 0.3)
      .to(counters, { time: 40, duration: 0.8, ease: 'power2.inOut', onUpdate: renderHud }, 0.3),
  ];

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: true });
  STEP_SCENES.forEach((build, i) => {
    const label = `step${i + 1}`;
    tl.addLabel(label, i === 0 ? 0 : '+=0.1');
    if (i > 0) tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: 0.3 }, `${label}-=0.05`);
    tl.to(steps[i], { autoAlpha: 1, y: 0, duration: 0.35 }, label)
      .add(build(), `${label}+=0.1`);
  });
  tl.to({}, { duration: 0.5 }); // hold the final state before the pin releases

  // CSS loops (LEDs, ripples, packets) only run while the scene is on screen
  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => bp.classList.toggle('is-visible', self.isActive),
  });

  if (reduced) {
    tl.progress(1);
    bp.classList.add('is-racks', 'is-live');
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
