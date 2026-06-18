import { unsafeCSS } from 'lit';
import raw from './button-core.css?inline';

/**
 * Wrapper module for the shared `.l-button` appearance. `unsafeCSS()` is called
 * once here so every shadow-DOM element that renders `.l-button` actions
 * (l-alert-dialog, and any future l-confirm/l-prompt) shares one `CSSResult`
 * (one constructed `CSSStyleSheet`, not one per importer).
 */
export default unsafeCSS(raw);
