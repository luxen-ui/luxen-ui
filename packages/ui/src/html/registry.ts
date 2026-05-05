/** Every component base name the library ships. */
export type ElementBaseName =
  | 'avatar'
  | 'badge'
  | 'carousel'
  | 'carousel-item'
  | 'dialog'
  | 'divider'
  | 'drawer'
  | 'dropdown'
  | 'dropdown-item'
  | 'icon'
  | 'input-otp'
  | 'input-stepper'
  | 'popover'
  | 'skeleton'
  | 'spinner'
  | 'rating'
  | 'sticky-bar'
  | 'stories'
  | 'story'
  | 'stories-viewer'
  | 'tabs'
  | 'toast'
  | 'toast-item'
  | 'tooltip'
  | 'tree'
  | 'tree-item';

let _elementPrefix = 'l';
let _cssPrefix = 'l';
const _registered = new Set<ElementBaseName>();

/** Set the global prefix. Must be called before defining elements. */
export function setPrefix(prefix: { element: string; css: string }): void {
  _elementPrefix = prefix.element;
  _cssPrefix = prefix.css;
}

/** Get the current prefixes. */
export function getPrefix(): { element: string; css: string } {
  return { element: _elementPrefix, css: _cssPrefix };
}

/** Derive the full tag name from element prefix + base name. */
export function tagName(baseName: ElementBaseName): string {
  return `${_elementPrefix}-${baseName}`;
}

/** Prefix a CSS class name. `cls('toast-icon')` → `'l-toast-icon'` */
export function cls(name: string): string {
  return `${_cssPrefix}-${name}`;
}

/** Generate a globally unique prefixed ID. `uniqueId('toast')` → `'l:toast:1'` */
let _uid = 0;
export function uniqueId(base: string): string {
  return `${_cssPrefix}:${base}:${++_uid}`;
}

/** Check if a base name is already registered. */
export function isRegistered(baseName: ElementBaseName): boolean {
  return _registered.has(baseName);
}

/** Mark a base name as registered. Called internally by define(). */
export function markRegistered(baseName: ElementBaseName): void {
  _registered.add(baseName);
}
