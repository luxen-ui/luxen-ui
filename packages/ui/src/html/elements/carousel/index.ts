import { define } from '../../define';
import { LuxenCarousel } from './carousel';
export * from './carousel';
define('carousel', LuxenCarousel);

declare global {
  interface HTMLElementTagNameMap {
    'l-carousel': LuxenCarousel;
  }
}
