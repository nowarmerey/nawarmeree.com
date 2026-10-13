// Chapter 3: the cable becomes a flight path Homs → Leverkusen, driven by scroll.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scope } from '../lib/scene.js';
import { svgEl, placeOnPath } from '../lib/svg.js';


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
        svgEl('circle', { cx: x, cy: y, r: 1.6 }, dots);
      }
    }
  }

  const fillPath = /** @type {SVGPathElement} */ ($('#flightPathFill'));
  const len = fillPath.getTotalLength();
  gsap.set(fillPath, { strokeDasharray: len, strokeDashoffset: len });

  const stamp = $('.stamp');
  const flightPath = /** @type {SVGPathElement} */ ($('#flightPath'));
  const plane = /** @type {SVGGElement} */ ($('#plane'));
  const flightLength = flightPath.getTotalLength();
  const flight = { p: 0 };
  const movePlane = () => placeOnPath(plane, flightPath, flight.p, { rotate: true, length: flightLength });
  movePlane();

  if (reduced) {
    gsap.set(fillPath, { strokeDashoffset: 0 });
    placeOnPath(plane, flightPath, 1, { rotate: true, length: flightLength });
    gsap.set(stamp, { opacity: 1 });
    return;
  }

  gsap.timeline({ scrollTrigger: { trigger: $('.flight'), start: 'top 75%', end: 'bottom 25%', scrub: 0.8 } })
    .to(fillPath, { strokeDashoffset: 0, ease: 'none' }, 0)
    .to(flight, { p: 1, ease: 'none', onUpdate: movePlane }, 0);

  ScrollTrigger.create({
    trigger: stamp, start: 'top 85%', once: true,
    onEnter: () => gsap.fromTo(stamp, { opacity: 0, scale: 2.6, rotate: -18 }, { opacity: 1, scale: 1, rotate: -6, duration: 0.5, ease: 'back.out(3)', delay: 0.4 }),
  });
}
