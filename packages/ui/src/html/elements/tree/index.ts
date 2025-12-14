import { define } from '../../define';
import { LuxenTree } from './tree';
export * from './tree';
define('tree', LuxenTree);

declare global {
  interface HTMLElementTagNameMap {
    'l-tree': LuxenTree;
  }
}
