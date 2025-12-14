import { define } from '../../define';
import { LuxenPopover } from './popover';
export * from './popover';
define('popover', LuxenPopover);

declare global {
  interface HTMLElementTagNameMap {
    'l-popover': LuxenPopover;
  }
}
