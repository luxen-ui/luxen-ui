import { define } from '../../define';
import { Carousel } from './carousel';
export * from './carousel';
define('carousel', Carousel);

declare global {
  interface HTMLElementTagNameMap {
    'l-carousel': Carousel;
  }
}
