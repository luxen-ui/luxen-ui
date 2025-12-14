import { property } from 'lit/decorators.js';
import { LuxenElement } from './luxen-element';

/**
 * Base class for form-associated Luxen custom elements.
 * Implements the Form Associated Custom Elements API via ElementInternals.
 *
 * Subclasses own their typed `value` property and call `_syncFormValue()`
 * whenever it changes.
 */
export class LuxenFormAssociatedElement extends LuxenElement {
  static formAssociated = true;

  /** @internal */
  readonly _internals: ElementInternals;

  @property({ reflect: true })
  name = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  /** The serialised value the element resets to on form reset. */
  protected _defaultFormValue = '';

  /** Whether the user has interacted with this control. */
  hasInteracted = false;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  /** The form this control is associated with. */
  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /** `<label>` elements associated with this control via `for` attribute. */
  get formLabels(): NodeList {
    return this._internals.labels;
  }

  /**
   * Override to return the inner element where validation popups anchor.
   * Passed as the 3rd arg to `ElementInternals.setValidity()`.
   */
  get validationTarget(): HTMLElement | undefined {
    return undefined;
  }

  // --- Form value ---

  /** Update the form submission value. */
  protected _syncFormValue(value: string): void {
    this._internals.setFormValue(value);
  }

  // --- Validity ---

  checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  reportValidity(): boolean {
    this.hasInteracted = true;
    this._updateCustomStates();
    return this._internals.reportValidity();
  }

  /** Set a custom validity message. Pass `''` to clear. */
  setCustomValidity(message: string): void {
    if (message) {
      this._internals.setValidity({ customError: true }, message, this.validationTarget);
    } else {
      this._internals.setValidity({});
    }
    this._updateCustomStates();
  }

  /** Directly set validity flags. With no args, clears all flags. */
  protected setValidity(flags: ValidityStateFlags = {}, message = '', anchor?: HTMLElement): void {
    this._internals.setValidity(flags, message, anchor ?? this.validationTarget);
    this._updateCustomStates();
  }

  get validity(): ValidityState {
    return this._internals.validity;
  }

  get validationMessage(): string {
    return this._internals.validationMessage;
  }

  get willValidate(): boolean {
    return this._internals.willValidate;
  }

  /** Update `:state()` custom states based on current validity and interaction. */
  private _updateCustomStates(): void {
    const states = this._internals.states;
    const isValid = this._internals.validity.valid;

    this._toggleState(states, 'required', this.required);
    this._toggleState(states, 'optional', !this.required);
    this._toggleState(states, 'valid', isValid);
    this._toggleState(states, 'invalid', !isValid);
    this._toggleState(states, 'user-valid', isValid && this.hasInteracted);
    this._toggleState(states, 'user-invalid', !isValid && this.hasInteracted);
  }

  private _toggleState(states: CustomStateSet, name: string, force: boolean): void {
    if (force) {
      states.add(name);
    } else {
      states.delete(name);
    }
  }

  // --- Form lifecycle callbacks ---

  formAssociatedCallback(_form: HTMLFormElement | null): void {}

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.hasInteracted = false;
    this._syncFormValue(this._defaultFormValue);
    this._updateCustomStates();
  }

  formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete'): void {
    this._syncFormValue(state);
  }
}
