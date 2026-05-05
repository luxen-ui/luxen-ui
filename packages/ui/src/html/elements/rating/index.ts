import { define } from '../../define';
import { Rating } from './rating';
export * from './rating';
define('rating', Rating);

declare global {
  interface HTMLElementTagNameMap {
    'l-rating': Rating;
  }
}
