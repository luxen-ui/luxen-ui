import { define } from '../../define';
import { LuxenTooltip } from './tooltip';
export * from './tooltip';
define('tooltip', LuxenTooltip);

declare global {
  interface HTMLElementTagNameMap {
    'l-tooltip': LuxenTooltip;
  }
}
