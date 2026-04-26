import { unsafeCSS } from 'lit';
import raw from './checkbox-appearance.css?inline';

/**
 * Shared `.l-checkbox` appearance for Shadow-DOM elements that render their own
 * native checkbox (e.g. `<l-tree-item>` in `selection="multiple"`).
 * Wrapper module: `unsafeCSS()` is called once here so all importers share the
 * same `CSSResult` instance (one constructed `CSSStyleSheet`).
 */
export default unsafeCSS(raw);
