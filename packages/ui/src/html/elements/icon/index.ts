import { define } from '../../define';
import { LuxenIcon } from './icon';
export * from './icon';
define('icon', LuxenIcon);

declare global {
  interface HTMLElementTagNameMap {
    'l-icon': LuxenIcon;
  }
}
