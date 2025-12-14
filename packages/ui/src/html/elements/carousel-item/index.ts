import { define } from '../../define';
import { LuxenCarouselItem } from './carousel-item';
export * from './carousel-item';
define('carousel-item', LuxenCarouselItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-carousel-item': LuxenCarouselItem;
  }
}
