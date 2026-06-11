/**
 * The actually-focused element, descending through nested open shadow roots.
 * `document.activeElement` stops at the outermost shadow host; assistive tech
 * and the user "see" the inner element.
 */
export function deepActiveElement(root: Document | ShadowRoot = document): Element | null {
  const active = root.activeElement;
  if (active?.shadowRoot?.activeElement) return deepActiveElement(active.shadowRoot);
  return active;
}
