import { define } from '../../define';
import { LuxenInputOtp } from './input-otp';
export * from './input-otp';
define('input-otp', LuxenInputOtp);

declare global {
  interface HTMLElementTagNameMap {
    'l-input-otp': LuxenInputOtp;
  }
}
