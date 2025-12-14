import { define } from '../../define';
import { LuxenDialog } from './dialog';
export * from './dialog';
define('dialog', LuxenDialog);

declare global {
  interface HTMLElementTagNameMap {
    'l-dialog': LuxenDialog;
  }
}
