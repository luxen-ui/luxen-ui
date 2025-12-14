import { unsafeCSS } from 'lit';
import raw from './host.css?inline';

/**
 * Styles applied to every shadow-DOM element via `static styles`.
 * Wrapper module: `unsafeCSS()` is called once here so all 12+ importers
 * share the same `CSSResult` instance (one constructed `CSSStyleSheet`,
 * not one per importing element).
 */
export default unsafeCSS(raw);
