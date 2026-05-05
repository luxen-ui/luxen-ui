import { define } from '../../define';
import { LuxenStory } from './story';
export * from './story';
define('story', LuxenStory);

declare global {
  interface HTMLElementTagNameMap {
    'l-story': LuxenStory;
  }
}
