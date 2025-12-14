import { define } from '../../define';
import { LuxenToast, LuxenToastItem } from './toast';
export * from './toast';
define('toast', LuxenToast);
define('toast-item', LuxenToastItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-toast': LuxenToast;
    'l-toast-item': LuxenToastItem;
  }
}
