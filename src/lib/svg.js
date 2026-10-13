// The one SVG element factory used by every scene.
export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create an SVG element, set its attributes and (optionally) append it.
 * @template {keyof SVGElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, string | number>} [attrs]
 * @param {Element} [parent]
 * @returns {SVGElementTagNameMap[K]}
 */
export function svgEl(tag, attrs = {}, parent = undefined) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  parent?.appendChild(node);
  return node;
}

/**
 * Place an element on an SVG path at `progress` (0..1). Works in the path's own coordinate system, so
 * target and path must share the same <svg>. Writes SVG attributes only (no inline styles → CSP-safe),
 * which is why this replaces GSAP's MotionPathPlugin.
 * @param {SVGGraphicsElement} target  <circle> gets cx/cy; anything else gets a transform attribute
 * @param {SVGPathElement} path
 * @param {number} progress
 * @param {{ rotate?: boolean, length?: number }} [opts]
 */
export function placeOnPath(target, path, progress, { rotate = false, length = path.getTotalLength() } = {}) {
  const at = Math.min(Math.max(progress, 0), 1) * length;
  const p = path.getPointAtLength(at);
  if (target instanceof SVGCircleElement) {
    target.setAttribute('cx', String(p.x));
    target.setAttribute('cy', String(p.y));
    return;
  }
  let angle = 0;
  if (rotate) {
    const a = path.getPointAtLength(Math.max(at - 1, 0));
    const b = path.getPointAtLength(Math.min(at + 1, length));
    angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  }
  target.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle})`);
}
