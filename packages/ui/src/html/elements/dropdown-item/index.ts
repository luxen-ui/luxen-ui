import { define } from '../../define';
import { LuxenDropdownItem } from './dropdown-item';
export * from './dropdown-item';
define('dropdown-item', LuxenDropdownItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-dropdown-item': LuxenDropdownItem;
  }
}
