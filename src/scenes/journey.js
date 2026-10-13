// Chapter 3: the cable becomes a flight path Homs → Leverkusen, driven by scroll.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scope } from '../lib/scene.js';

const NS = 'http://www.w3.org/2000/svg';

/**
 * @param {HTMLElement} root  #journey
 * @param {{ reduced: boolean }} opts
 */
export function initJourney(root, { reduced }) {
  const { $ } = scope(root);
  // faint dot field as a hint of a map
  const dots = $('#flightDots');
  for (let x = 20; x < 1000; x += 26) {
    for (let y = 10; y < 260; y += 26) {
      const n = Math.sin(x * 0.012) * Math.cos(y * 0.03) + Math.sin((x + y) * 0.007);
      if (n > 0.2) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); c.setAttribute('r', '1.6');
        dots.appendChild(c);
      }
    }
  }

  const fillPath = /** @type {SVGPathElement} */ ($('#flightPathFill'));
  const len = fillPath.getTotalLength();
  gsap.set(fillPath, { strokeDasharray: len, strokeDashoffset: len });

  const stamp = $('.stamp');
  const flightPath = /** @type {SVGPathElement} */ ($('#flightPath'));

  if (reduced) {
    gsap.set(fillPath, { strokeDashoffset: 0 });
    gsap.set($('#plane'), { x: 880, y: 120 });
    gsap.set(stamp, { opacity: 1 });
    return;
  }

  gsap.timeline({ scrollTrigger: { trigger: $('.flight'), start: 'top 75%', end: 'bottom 25%', scrub: 0.8 } })
    .to(fillPath, { strokeDashoffset: 0, ease: 'none' }, 0)
    .to($('#plane'), {
      ease: 'none',
      motionPath: { path: flightPath, align: flightPath, alignOrigin: [0.5, 0.5], autoRotate: true },
    }, 0);

  ScrollTrigger.create({
    trigger: stamp, start: 'top 85%', once: true,
    onEnter: () => gsap.fromTo(stamp, { opacity: 0, scale: 2.6, rotate: -18 }, { opacity: 1, scale: 1, rotate: -6, duration: 0.5, ease: 'back.out(3)', delay: 0.4 }),
  });
}
