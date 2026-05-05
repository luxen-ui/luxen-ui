import { define } from '../../define';
import { Badge } from './badge';
export * from './badge';
define('badge', Badge);

declare global {
  interface HTMLElementTagNameMap {
    'l-badge': Badge;
  }
}
