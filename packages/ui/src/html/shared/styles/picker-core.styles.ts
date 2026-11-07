import { unsafeCSS } from 'lit';
import raw from './picker-core.css?inline';

/**
 * Wrapper module for the shared picker core (field frame, chevron, clear,
 * listbox popover). `unsafeCSS()` is called once here so l-select and
 * l-combobox share one `CSSResult` (one constructed `CSSStyleSheet`, not one
 * per importer).
 */
export default unsafeCSS(raw);
