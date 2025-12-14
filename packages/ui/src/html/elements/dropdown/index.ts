import { define } from '../../define';
import { LuxenDropdown } from './dropdown';
export * from './dropdown';
define('dropdown', LuxenDropdown);

declare global {
  interface HTMLElementTagNameMap {
    'l-dropdown': LuxenDropdown;
  }
}
