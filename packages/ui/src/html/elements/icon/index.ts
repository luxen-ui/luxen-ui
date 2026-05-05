import { define } from '../../define';
import { Icon } from './icon';
export * from './icon';
define('icon', Icon);

declare global {
  interface HTMLElementTagNameMap {
    'l-icon': Icon;
  }
}
