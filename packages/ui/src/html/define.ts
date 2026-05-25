import { markRegistered, isRegistered, tagName, type ElementBaseName } from './registry.js';

/**
 * Register a Luxen element with the custom elements registry.
 *
 * @param baseName - The element's base name (e.g. `'badge'`, `'toast-item'`).
 * @param elementClass - The custom element class to define.
 */
export function define(baseName: ElementBaseName, elementClass: CustomElementConstructor): void {
  if (isRegistered(baseName)) return;
  markRegistered(baseName);
  const tag = tagName(baseName);
  if (!customElements.get(tag)) {
    customElements.define(tag, elementClass);
  }
}
