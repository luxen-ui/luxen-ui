import { define } from '../../define';
import { LuxenStoriesViewer } from './stories-viewer';
export * from './stories-viewer';
define('stories-viewer', LuxenStoriesViewer);

declare global {
  interface HTMLElementTagNameMap {
    'l-stories-viewer': LuxenStoriesViewer;
  }
}
