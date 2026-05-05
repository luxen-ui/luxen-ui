import { define } from '../../define';
import { InputOtp } from './input-otp';
export * from './input-otp';
define('input-otp', InputOtp);

declare global {
  interface HTMLElementTagNameMap {
    'l-input-otp': InputOtp;
  }
}
