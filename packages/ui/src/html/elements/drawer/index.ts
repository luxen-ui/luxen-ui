import { define } from '../../define';
import { Drawer } from './drawer';
export * from './drawer';
define('drawer', Drawer);

declare global {
  interface HTMLElementTagNameMap {
    'l-drawer': Drawer;
  }
}
