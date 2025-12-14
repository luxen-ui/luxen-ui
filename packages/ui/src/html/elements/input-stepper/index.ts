import { define } from '../../define';
import { LuxenInputStepper } from './input-stepper';
export * from './input-stepper';
define('input-stepper', LuxenInputStepper);

declare global {
  interface HTMLElementTagNameMap {
    'l-input-stepper': LuxenInputStepper;
  }
}
