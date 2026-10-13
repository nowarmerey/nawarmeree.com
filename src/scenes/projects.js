// Chapter 7: LexAI explains RAG visually (pinned on desktop, looping on mobile); Cobra SaaS shows live sync.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t, applyTexts } from '../i18n.js';
import { scope } from '../lib/scene.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  parent.appendChild(n);
  return n;
};

// vector-space coordinates (viewBox 400×260)
const CHUNK_VECS = [[90, 70], [262, 96], [70, 190], [330, 200], [292, 128], [160, 210], [240, 70], [150, 120]];
const HITS = [1, 4, 6];
const QUERY = [282, 102];

/** @param {ReturnType<typeof scope>['$']} $ */
function buildRag($) {
  const space = $('#ragSpace');
  svgEl('line', { x1: 20, y1: 240, x2: 390, y2: 240, class: 'axis' }, space);
  svgEl('line', { x1: 20, y1: 240, x2: 20, y2: 14, class: 'axis' }, space);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const noise = [];
  for (let i = 0; i < 26; i++) noise.push(svgEl('circle', { cx: 30 + rand() * 350, cy: 20 + rand() * 210, r: 2.2, class: 'vec vec--noise' }, space));
  const links = HITS.map((h) => svgEl('line', { x1: QUERY[0], y1: QUERY[1], x2: CHUNK_VECS[h][0], y2: CHUNK_VECS[h][1], class: 'link' }, space));
  const vecs = CHUNK_VECS.map(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 5, class: 'vec' }, space));
  const q = svgEl('circle', { cx: QUERY[0], cy: QUERY[1], r: 6, class: 'q' }, space);

  const chunkWrap = $('#ragChunks');
  const chunks = CHUNK_VECS.map(() => {
    const c = document.createElement('div');
    c.className = 'rag__chunk';
    chunkWrap.appendChild(c);
    return c;
  });
  return { noise, links, vecs, q, chunks };
}

/**
 * @param {ReturnType<typeof buildRag>} parts
 * @param {ReturnType<typeof scope>} dom
 */
function ragTimeline(parts, { $, $$ }) {
  const steps = $$('#ragSteps li');
  const qText = $('#ragQueryText');
  const aText = $('#ragAnswerText');
  const typed = { q: 0, a: 0 };
  const renderTyped = () => {
    const q = t('projects.lexai.query'); const a = t('projects.lexai.answer');
    qText.textContent = q.slice(0, Math.round(typed.q * q.length));
    aText.textContent = a.slice(0, Math.round(typed.a * a.length));
  };
  const STEP_AT = [0, 0.8, 1.5, 2.7, 3.9];
  const markStep = (time) => {
    const i = STEP_AT.filter((at) => time >= at).length - 1;
    steps.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); });
  };

  const { noise, links, vecs, q, chunks } = parts;
  const doc = $('#ragDoc');
  gsap.set(doc, { opacity: 0, y: 80, scale: 0.7 });
  gsap.set(chunks, { left: '50%', top: '50%', xPercent: -50, yPercent: -50, opacity: 0, scale: 1 });
  gsap.set([...noise, ...vecs, q, ...links], { opacity: 0 });
  gsap.set([$('#ragQuery'), $('#ragAnswer')], { opacity: 0, y: 10 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onUpdate: () => markStep(tl.time()) });
  // 1 upload
  tl.to(doc, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0)
  // 2 chunk: document splits into pieces
    .to(chunks, {
      opacity: 1, duration: 0.3,
      left: (i) => `${50 + ((i % 2) - 0.5) * 18}%`, top: (i) => `${32 + Math.floor(i / 2) * 12}%`,
      stagger: 0.04,
    }, 0.8)
    .to(doc, { opacity: 0, scale: 1.1, duration: 0.3 }, 0.9)
  // 3 embed: pieces fly into vector space and become points
    .to(chunks, {
      left: (i) => `${(CHUNK_VECS[i][0] / 400) * 100}%`, top: (i) => `${(CHUNK_VECS[i][1] / 260) * 100}%`,
      scale: 0.15, duration: 0.6, stagger: 0.04, ease: 'power3.inOut',
    }, 1.5)
    .to(chunks, { opacity: 0, duration: 0.15 }, 2.2)
    .to(vecs, { opacity: 1, duration: 0.2, stagger: 0.03 }, 2.15)
    .to(noise, { opacity: 1, duration: 0.3, stagger: 0.01 }, 2.2)
  // 4 retrieve: a question is asked, nearest neighbours light up
    .to($('#ragQuery'), { opacity: 1, y: 0, duration: 0.3 }, 2.7)
    .to(typed, { q: 1, duration: 0.6, ease: 'none', onUpdate: renderTyped }, 2.8)
    .to(q, { opacity: 1, duration: 0.2 }, 3.3)
    .to(links, { opacity: 1, duration: 0.3, stagger: 0.1 }, 3.4)
    .call(() => HITS.forEach((h) => vecs[h].classList.add('is-hit')), null, 3.5)
    .call(() => HITS.forEach((h) => vecs[h].classList.remove('is-hit')), null, 3.49)
  // 5 answer
    .to($('#ragAnswer'), { opacity: 1, y: 0, duration: 0.3 }, 3.9)
    .to(typed, { a: 1, duration: 0.8, ease: 'none', onUpdate: renderTyped }, 4.0)
    .to({}, { duration: 0.5 });
  return { tl, renderTyped };
}

/** @param {ReturnType<typeof scope>['$']} $ */
function buildArch($) {
  const svg = $('#arch');
  const box = (x, y, w, h, title, sub, cls, key) => {
    const g = svgEl('g', { class: 'arch-node' }, svg);
    svgEl('rect', { x, y, width: w, height: h, rx: 10, class: `box ${cls || ''}` }, g);
    const tt = svgEl('text', { x: x + w / 2, y: y + h / 2 - (sub ? 2 : -4), class: 't' }, g);
    tt.textContent = title;
    if (key) tt.dataset.i18n = key;
    if (sub) svgEl('text', { x: x + w / 2, y: y + h / 2 + 15, class: 's' }, g).textContent = sub;
    return g;
  };
  const wires = [
    'M220 58 L220 112',
    'M95 300 C 95 230, 140 200, 165 172',
    'M345 300 C 345 230, 300 200, 275 172',
    'M220 172 L220 200',
  ].map((d) => svgEl('path', { d, class: 'wire' }, svg));

  const nodes = [
    box(160, 10, 120, 48, 'Admin', 'web console', '', 'projects.cobra.nodes.admin'),
    box(110, 112, 220, 60, 'Cloud API', 'Express · Prisma', 'box--api', 'projects.cobra.nodes.api'),
    box(20, 300, 150, 60, 'Commerce', 'ERP + POS · SQLite', 'box--app', 'projects.cobra.nodes.commerce'),
    box(270, 300, 150, 60, 'Beauty', 'CRM · SQLite', 'box--app', 'projects.cobra.nodes.beauty'),
  ];
  // PostgreSQL with RLS tenants
  const db = svgEl('g', { class: 'arch-node' }, svg);
  svgEl('path', { d: 'M170 208 a50 10 0 0 0 100 0 v40 a50 10 0 0 1 -100 0 Z', class: 'db' }, db);
  svgEl('ellipse', { cx: 220, cy: 208, rx: 50, ry: 10, class: 'db' }, db);
  [190, 220, 250].forEach((x) => svgEl('line', { x1: x, y1: 222, x2: x, y2: 254, class: 'tenant' }, db));
  svgEl('text', { x: 220, y: 276, class: 's' }, db).textContent = 'PostgreSQL · RLS';
  nodes.push(db);

  // LAN badge between cashier stations
  const lan = svgEl('g', { class: 'arch-node' }, svg);
  svgEl('rect', { x: 66, y: 268, width: 58, height: 20, rx: 10, class: 'box' }, lan);
  const lt = svgEl('text', { x: 95, y: 282, class: 's s--accent' }, lan);
  lt.textContent = '⇄ LAN';
  nodes.push(lan);

  return { svg, wires, nodes };
}

/**
 * @param {HTMLElement} root  #projects
 * @param {{ reduced: boolean, mm: gsap.MatchMedia }} opts
 */
export function initProjects(root, { reduced, mm }) {
  const dom = scope(root);
  const { $ } = dom;
  const parts = buildRag($);
  const { tl, renderTyped } = ragTimeline(parts, dom);
  tl.pause();
  renderTyped();

  const arch = buildArch($);
  applyTexts(arch.svg);

  if (reduced) {
    tl.progress(1);
    return { renderTyped };
  }

  mm.add('(min-width: 901px)', () => {
    gsap.to(tl, {
      progress: 1, ease: 'none',
      scrollTrigger: { trigger: $('.lexai__pin'), pin: true, start: 'top top', end: () => `+=${innerHeight * 1.8}`, scrub: 0.8, anticipatePin: 1 },
    });
  });
  mm.add('(max-width: 900px)', () => {
    const st = ScrollTrigger.create({
      trigger: $('#rag'), start: 'top 70%', once: true,
      onEnter: () => { tl.restart(); tl.repeat(-1).repeatDelay(2.5); },
    });
    return () => { st.kill(); tl.repeat(0); tl.pause(0); };
  });

  // Cobra architecture: draw-in, then endless bidirectional sync packets — running only while on screen
  gsap.set(arch.nodes, { opacity: 0, y: 14 });
  /** @type {gsap.core.Tween[]} */
  const loops = [];
  arch.wires.forEach((w, i) => {
    const up = svgEl('circle', { r: 4, class: 'pkt' }, arch.svg);
    const down = svgEl('circle', { r: 4, class: 'pkt pkt--down' }, arch.svg);
    const path = { path: w, align: w, alignOrigin: [0.5, 0.5] };
    gsap.set([up, down], { opacity: 0 });
    loops.push(
      gsap.fromTo(up, { opacity: 1 }, { motionPath: path, duration: 1.6, repeat: -1, repeatDelay: 0.6 + i * 0.3, ease: 'power1.inOut', delay: 1 + i * 0.2, paused: true }),
      gsap.fromTo(down, { opacity: 1 }, { motionPath: { ...path, start: 1, end: 0 }, duration: 1.6, repeat: -1, repeatDelay: 0.9 + i * 0.2, ease: 'power1.inOut', delay: 1.8 + i * 0.25, paused: true }),
    );
  });
  ScrollTrigger.create({
    trigger: arch.svg, start: 'top 80%', once: true,
    onEnter: () => gsap.to(arch.nodes, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(1.8)' }),
  });
  ScrollTrigger.create({
    trigger: arch.svg, start: 'top 80%', end: 'bottom top',
    onToggle: (self) => loops.forEach((tw) => (self.isActive ? tw.play() : tw.pause())),
  });
  return { renderTyped };
}
