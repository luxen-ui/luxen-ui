import { define } from '../../define';
import { Tabs } from './tabs';
export * from './tabs';
define('tabs', Tabs);

declare global {
  interface HTMLElementTagNameMap {
    'l-tabs': Tabs;
  }
}
