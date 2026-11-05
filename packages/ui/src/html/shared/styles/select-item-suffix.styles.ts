import { unsafeCSS } from 'lit';
import raw from './select-item-suffix.css?inline';

/**
 * Wrapper module for the shared rich-option trailing zone. `unsafeCSS()` is
 * called once here so l-select and l-combobox share one `CSSResult` (one
 * constructed `CSSStyleSheet`, not one per importer).
 */
export default unsafeCSS(raw);
