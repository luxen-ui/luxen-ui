import { unsafeCSS } from 'lit';
import raw from './menu-panel.css?inline';

/**
 * Wrapper module for the menu panel shared by l-dropdown and l-dropdown-item
 * submenus. `unsafeCSS()` is called once here so both share one `CSSResult`
 * (one constructed `CSSStyleSheet`, not one per importer).
 */
export default unsafeCSS(raw);
