// Scene contract: every chapter is initialised with its own root element and only queries inside it.
// mount() isolates failures, so one broken scene never takes the rest of the page down.

/**
 * @template T
 * @param {string} name             label used in logs
 * @param {string} selector         root element of the scene
 * @param {(root: HTMLElement, ...args: any[]) => T} init
 * @param {...any} args             forwarded to init after the root
 * @returns {T | undefined}
 */
export function mount(name, selector, init, ...args) {
  const root = /** @type {HTMLElement | null} */ (document.querySelector(selector));
  if (!root) {
    if (import.meta.env.DEV) console.warn(`[scene] ${name}: root "${selector}" not found — skipped`);
    return undefined;
  }
  const fail = (err) => console.error(`[scene] ${name} failed and was skipped`, err);
  try {
    const result = init(root, ...args);
    // async scenes (hero) report their failures the same way
    if (result instanceof Promise) result.catch(fail);
    return result;
  } catch (err) {
    fail(err);
    return undefined;
  }
}

/**
 * Query helpers bound to a scene root.
 * @param {ParentNode} root
 */
export function scope(root) {
  return {
    /** @type {<E extends Element = HTMLElement>(sel: string) => E} */
    $: (sel) => /** @type {any} */ (root.querySelector(sel)),
    /** @type {<E extends Element = HTMLElement>(sel: string) => E[]} */
    $$: (sel) => /** @type {any} */ ([...root.querySelectorAll(sel)]),
  };
}
