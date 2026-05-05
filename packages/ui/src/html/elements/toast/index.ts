import { define } from '../../define';
import { Toast, ToastItem } from './toast';
export * from './toast';
define('toast', Toast);
define('toast-item', ToastItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-toast': Toast;
    'l-toast-item': ToastItem;
  }
}
