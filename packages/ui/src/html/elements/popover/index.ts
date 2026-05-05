import { define } from '../../define';
import { Popover } from './popover';
export * from './popover';
define('popover', Popover);

declare global {
  interface HTMLElementTagNameMap {
    'l-popover': Popover;
  }
}
