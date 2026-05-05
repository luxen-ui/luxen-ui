import { define } from '../../define';
import { Tree } from './tree';
export * from './tree';
define('tree', Tree);

declare global {
  interface HTMLElementTagNameMap {
    'l-tree': Tree;
  }
}
