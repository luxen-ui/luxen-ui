import { unsafeCSS } from 'lit';
import raw from './select-item.css?inline';

/**
 * Wrapper module for the option row + rich-option content shared with the
 * native `.l-select` picker. `unsafeCSS()` is called once here so every
 * importer shares one `CSSResult` (one constructed `CSSStyleSheet`).
 */
export default unsafeCSS(raw);
