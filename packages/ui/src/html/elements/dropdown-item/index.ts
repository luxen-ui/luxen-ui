import { define } from '../../define';
import { DropdownItem } from './dropdown-item';
export * from './dropdown-item';
define('dropdown-item', DropdownItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-dropdown-item': DropdownItem;
  }
}
