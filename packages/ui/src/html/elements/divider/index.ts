import { define } from '../../define';
import { Divider } from './divider';
export * from './divider';
define('divider', Divider);

declare global {
  interface HTMLElementTagNameMap {
    'l-divider': Divider;
  }
}
