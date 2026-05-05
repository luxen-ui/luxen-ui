import { define } from '../../define';
import { Dialog } from './dialog';
export * from './dialog';
define('dialog', Dialog);

declare global {
  interface HTMLElementTagNameMap {
    'l-dialog': Dialog;
  }
}
