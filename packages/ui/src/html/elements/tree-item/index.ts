import { define } from '../../define';
import { LuxenTreeItem } from './tree-item';
export * from './tree-item';
define('tree-item', LuxenTreeItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-tree-item': LuxenTreeItem;
  }
}
