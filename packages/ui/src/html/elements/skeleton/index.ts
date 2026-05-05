import { define } from '../../define';
import { Skeleton } from './skeleton';
export * from './skeleton';
define('skeleton', Skeleton);

declare global {
  interface HTMLElementTagNameMap {
    'l-skeleton': Skeleton;
  }
}
