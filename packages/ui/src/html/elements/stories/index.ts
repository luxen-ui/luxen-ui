import { define } from '../../define';
import { LuxenStories } from './stories';
export * from './stories';
define('stories', LuxenStories);

declare global {
  interface HTMLElementTagNameMap {
    'l-stories': LuxenStories;
  }
}
