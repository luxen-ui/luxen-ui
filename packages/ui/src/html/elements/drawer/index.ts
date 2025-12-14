import { define } from '../../define';
import { LuxenDrawer } from './drawer';
export * from './drawer';
define('drawer', LuxenDrawer);

declare global {
  interface HTMLElementTagNameMap {
    'l-drawer': LuxenDrawer;
  }
}
