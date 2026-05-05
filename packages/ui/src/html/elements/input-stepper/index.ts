import { define } from '../../define';
import { InputStepper } from './input-stepper';
export * from './input-stepper';
define('input-stepper', InputStepper);

declare global {
  interface HTMLElementTagNameMap {
    'l-input-stepper': InputStepper;
  }
}
