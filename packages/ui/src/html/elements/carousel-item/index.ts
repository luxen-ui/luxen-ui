import { define } from '../../define';
import { CarouselItem } from './carousel-item';
export * from './carousel-item';
define('carousel-item', CarouselItem);

declare global {
  interface HTMLElementTagNameMap {
    'l-carousel-item': CarouselItem;
  }
}
