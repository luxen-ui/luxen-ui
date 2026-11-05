import { unsafeCSS } from 'lit';
import raw from './badge-core.css?inline';

/**
 * Wrapper module for the shared `l-badge` appearance. `unsafeCSS()` is called
 * once here so every shadow-DOM element that can render a badge (l-select,
 * l-combobox rich options) shares one `CSSResult` (one constructed
 * `CSSStyleSheet`, not one per importer).
 */
export default unsafeCSS(raw);
