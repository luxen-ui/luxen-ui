import { define } from '../../define';
import { LuxenDivider } from './divider';
export * from './divider';
define('divider', LuxenDivider);

declare global {
  interface HTMLElementTagNameMap {
    'l-divider': LuxenDivider;
  }
}
