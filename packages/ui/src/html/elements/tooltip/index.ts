import { define } from '../../define';
import { Tooltip } from './tooltip';
export * from './tooltip';
define('tooltip', Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'l-tooltip': Tooltip;
  }
}
