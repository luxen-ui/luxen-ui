import { define } from '../../define';
import { LuxenAvatar } from './avatar';
export * from './avatar';
define('avatar', LuxenAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'l-avatar': LuxenAvatar;
  }
}
