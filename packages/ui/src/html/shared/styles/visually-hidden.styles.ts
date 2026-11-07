import { unsafeCSS } from 'lit';
import raw from './visually-hidden.css?inline';

/**
 * Wrapper module for the `.l-visually-hidden` helper shared by every shadow
 * root that announces text to assistive tech only. `unsafeCSS()` is called once
 * here so all importers share one `CSSResult`.
 */
export default unsafeCSS(raw);
