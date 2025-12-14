import { unsafeCSS } from 'lit';
import raw from './dialog.css?inline';

/**
 * Wrapper module: imported by both `dialog.ts` and `drawer.ts`.
 * `unsafeCSS()` is called once here so both importers share the same
 * `CSSResult` instance (one constructed `CSSStyleSheet`, not two).
 */
export default unsafeCSS(raw);
