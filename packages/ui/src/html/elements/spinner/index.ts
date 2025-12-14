import { define } from '../../define';
import { LuxenSpinner } from './spinner';
export * from './spinner';
define('spinner', LuxenSpinner);

declare global {
  interface HTMLElementTagNameMap {
    'l-spinner': LuxenSpinner;
  }
}
