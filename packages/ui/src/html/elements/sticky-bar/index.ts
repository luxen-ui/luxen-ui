import { define } from '../../define';
import { StickyBar } from './sticky-bar';
export * from './sticky-bar';
define('sticky-bar', StickyBar);

declare global {
  interface HTMLElementTagNameMap {
    'l-sticky-bar': StickyBar;
  }
}
