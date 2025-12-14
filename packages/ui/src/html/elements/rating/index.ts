import { define } from '../../define';
import { LuxenRating } from './rating';
export * from './rating';
define('rating', LuxenRating);

declare global {
  interface HTMLElementTagNameMap {
    'l-rating': LuxenRating;
  }
}
