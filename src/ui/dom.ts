// Tiny DOM helper. No framework: the child-facing bundle stays small for
// low-bandwidth installs and older Android devices.

type Child = Node | string | null | undefined | false;
type Attrs = Record<string, string | number | boolean | EventListener | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = String(v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

/** Decorative symbol hidden from screen readers. */
export const icon = (symbol: string) => h('span', { 'aria-hidden': 'true' }, symbol);

export function mount(root: HTMLElement, ...nodes: (Node | null)[]): void {
  root.replaceChildren(...nodes.filter((n): n is Node => n !== null));
}

export function focusHeading(root: HTMLElement): void {
  const main = root.querySelector('main');
  if (main) main.tabIndex = -1;
  const heading = root.querySelector<HTMLElement>('h1, h2');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: false });
  }
}
