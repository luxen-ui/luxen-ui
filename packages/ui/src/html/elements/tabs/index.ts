import { define } from '../../define';
import { LuxenTabs } from './tabs';
export * from './tabs';
define('tabs', LuxenTabs);

declare global {
  interface HTMLElementTagNameMap {
    'l-tabs': LuxenTabs;
  }
}
