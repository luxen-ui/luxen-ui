import { define } from '../../define';
import { LuxenBadge } from './badge';
export * from './badge';
define('badge', LuxenBadge);

declare global {
  interface HTMLElementTagNameMap {
    'l-badge': LuxenBadge;
  }
}
