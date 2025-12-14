import { define } from '../../define';
import { LuxenSkeleton } from './skeleton';
export * from './skeleton';
define('skeleton', LuxenSkeleton);

declare global {
  interface HTMLElementTagNameMap {
    'l-skeleton': LuxenSkeleton;
  }
}
