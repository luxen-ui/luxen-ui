import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { tagName } from '../../registry.js';

export type InputStepperSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * A stepper control that enhances a native `<input type="number">` with
 * decrement/increment buttons and an optional animated number track.
 *
 * @link https://www.nngroup.com/articles/input-steppers/
 *
 * @example
 * ```html
 * <l-input-stepper>
 *   <input type="number" min="0" max="10" value="5" />
 * </l-input-stepper>
 * ```
 *
 * @event change - Fired when the value changes. Detail: `{ value: number }`.
 *
 * @cssproperty --border-color - Border color of the stepper container (default appearance) and of each button (rounded appearance). Defaults to `--l-color-border`.
 * @cssproperty --border-radius - Border radius of the stepper container (default appearance). Defaults to `--radius-md`.
 *
 * @customElement l-input-stepper
 */
export class InputStepper extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Minimum allowed value. Falls back to the input's `min` attribute. */
  @property({ type: Number })
  min?: number;

  /** Maximum allowed value. Falls back to the input's `max` attribute. */
  @property({ type: Number })
  max?: number;

  /** Step increment. Falls back to the input's `step` attribute. */
  @property({ type: Number })
  step?: number;

  /** Control size. */
  @property({ reflect: true })
  size: InputStepperSize = 'md';

  /** Enable the animated number roller overlay. */
  @property({ type: Boolean, reflect: true, attribute: 'with-roller' })
  withRoller = false;

  /** Icon name for the decrement button. */
  @property({ attribute: 'decrement-icon' })
  decrementIcon = 'lucide:minus';

  /** Icon name for the increment button. */
  @property({ attribute: 'increment-icon' })
  incrementIcon = 'lucide:plus';

  private _input: HTMLInputElement | null = null;
  private _decrementBtn: HTMLButtonElement | null = null;
  private _incrementBtn: HTMLButtonElement | null = null;
  private _valueWrapper: HTMLDivElement | null = null;
  private _trackDisplay: HTMLDivElement | null = null;
  private _track: HTMLDivElement | null = null;
  private _observer: MutationObserver | null = null;
  private _skipTransition = false;

  override connectedCallback() {
    super.connectedCallback();
    requestAnimationFrame(() => this._setup());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._teardown();
  }

  override updated(changed: Map<string, unknown>) {
    if (!this._input) return;

    if (changed.has('min') || changed.has('max') || changed.has('step')) {
      this._syncConstraints();
      this._updateButtonStates();
    }
  }

  /** Decrease the value by one step. */
  decrement() {
    if (!this._input) return;
    const { min, step } = this._getConstraints();
    const newVal = Math.max(this._input.valueAsNumber - step, min);
    this._applyValue(newVal);
  }

  /** Increase the value by one step. */
  increment() {
    if (!this._input) return;
    const { max, step } = this._getConstraints();
    const newVal = Math.min(this._input.valueAsNumber + step, max);
    this._applyValue(newVal);
  }

  // --- Setup / Teardown ---

  private _setup() {
    this._input = this.querySelector('input[type="number"]');
    if (!this._input) return;

    this._input.inputMode = 'numeric';

    // Wrap input in value container
    this._valueWrapper = document.createElement('div');
    this._valueWrapper.className = 'l-input-stepper-value';
    this._input.replaceWith(this._valueWrapper);
    this._valueWrapper.appendChild(this._input);

    // Inject track overlay
    if (this.withRoller) {
      this._buildTrack();
    }

    // Create buttons
    this._decrementBtn = this._createButton(this.decrementIcon, 'Decrease value');
    this._incrementBtn = this._createButton(this.incrementIcon, 'Increase value');

    this._valueWrapper.before(this._decrementBtn);
    this._valueWrapper.after(this._incrementBtn);

    // Events
    this._decrementBtn.addEventListener('click', this._onDecrement);
    this._incrementBtn.addEventListener('click', this._onIncrement);
    this._input.addEventListener('change', this._onInputChange);

    // Observe disabled attribute on input
    this._observer = new MutationObserver(() => this._updateButtonStates());
    this._observer.observe(this._input, { attributes: true, attributeFilter: ['disabled'] });

    this._syncConstraints();
    this._updateButtonStates();
    this._updateTrack();
  }

  private _teardown() {
    this._decrementBtn?.removeEventListener('click', this._onDecrement);
    this._incrementBtn?.removeEventListener('click', this._onIncrement);
    this._input?.removeEventListener('change', this._onInputChange);
    this._observer?.disconnect();

    // Restore input to direct child
    if (this._input && this._valueWrapper) {
      this._valueWrapper.replaceWith(this._input);
    }
    this._decrementBtn?.remove();
    this._incrementBtn?.remove();

    this._input = null;
    this._decrementBtn = null;
    this._incrementBtn = null;
    this._valueWrapper = null;
    this._trackDisplay = null;
    this._track = null;
    this._observer = null;
  }

  // --- DOM helpers ---

  private _createButton(icon: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    const iconTag = tagName('icon');
    btn.innerHTML = `<${iconTag} name="${icon}"></${iconTag}>`;
    return btn;
  }

  private _buildTrack() {
    if (!this._valueWrapper) return;

    this._trackDisplay = document.createElement('div');
    this._trackDisplay.className = 'l-input-stepper-track-display';

    this._track = document.createElement('div');
    this._track.className = 'l-input-stepper-track';
    this._track.setAttribute('aria-hidden', 'true');

    this._rebuildTrackNumbers();
    this._trackDisplay.appendChild(this._track);
    this._valueWrapper.appendChild(this._trackDisplay);
  }

  private _rebuildTrackNumbers() {
    if (!this._track) return;

    const { min, max, step } = this._getConstraints();
    const effectiveMax = Number.isFinite(max) ? max : (this._input?.valueAsNumber ?? 0) + 100;

    this._track.innerHTML = '';
    for (let i = min; i <= effectiveMax; i += step) {
      const div = document.createElement('div');
      div.textContent = String(i);
      this._track.appendChild(div);
    }
  }

  // --- Constraints ---

  private _getConstraints() {
    const min = this.min ?? (Number(this._input?.getAttribute('min')) || 0);
    const max =
      this.max ??
      (this._input?.hasAttribute('max') ? Number(this._input.getAttribute('max')) : Infinity);
    const step = this.step ?? (Number(this._input?.getAttribute('step')) || 1);
    return { min, max, step };
  }

  private _syncConstraints() {
    if (!this._input) return;
    const { min, max, step } = this._getConstraints();

    this._input.min = String(min);
    if (Number.isFinite(max)) this._input.max = String(max);
    this._input.step = String(step);

    this._rebuildTrackNumbers();
    this._updateTrack();
  }

  // --- Value ---

  private _applyValue(val: number) {
    if (!this._input) return;
    this._input.value = String(val);
    this._updateButtonStates();
    this._updateTrack();
    this.emit('change', { detail: { value: val } });
  }

  // --- Track ---

  private _updateTrack() {
    if (!this._track) return;

    const { min, step } = this._getConstraints();
    const value = this._input?.valueAsNumber ?? min;
    const offset = (min - value) / step;

    this._track.style.translate = `0 calc(${offset} * var(--_button-size))`;

    if (this._skipTransition) {
      this._track.style.transition = 'none';
      void this._track.offsetHeight;
      this._track.style.transition = '';
      this._skipTransition = false;
    }
  }

  // --- Button states ---

  private _updateButtonStates() {
    if (!this._input || !this._decrementBtn || !this._incrementBtn) return;

    const { min, max } = this._getConstraints();
    const value = this._input.valueAsNumber;
    const disabled = this._input.disabled;

    this._decrementBtn.disabled = disabled || value <= min;
    this._incrementBtn.disabled = disabled || value >= max;
  }

  // --- Event handlers ---

  private _onDecrement = () => this.decrement();
  private _onIncrement = () => this.increment();

  private _onInputChange = () => {
    if (!this._input) return;

    const { min, max } = this._getConstraints();
    const clamped = Math.min(Math.max(this._input.valueAsNumber, min), max);
    this._input.value = String(clamped);

    this._skipTransition = true;
    this._updateButtonStates();
    this._updateTrack();
    this.emit('change', { detail: { value: clamped } });
  };
}
