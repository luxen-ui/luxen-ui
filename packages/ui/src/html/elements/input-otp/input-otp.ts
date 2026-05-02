import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';

/**
 * Enhances a child `<input>` with visual digit cells (Stripe-style OTP input).
 *
 * A single hidden `<input>` handles keyboard, paste, and autocomplete.
 * Visual cells are rendered as real DOM elements with individual borders and focus ring.
 *
 * @summary Stripe-style OTP input with visual digit cells over a hidden native input.
 * @customElement l-input-otp
 *
 * @cssproperty --digits - Number of digit boxes (default: 6). Must match input's maxlength.
 * @cssproperty --cell-size - Cell width and height (default: 2.75rem). Font size scales automatically.
 * @cssproperty --cell-gap - Space between cells (default: 0.5rem).
 * @cssproperty --cell-bg-color - Cell background color.
 * @cssproperty --cell-border-color - Cell border color.
 * @cssproperty --cell-border-radius - Cell border-radius.
 * @cssproperty --cell-focus-color - Border + ring color of the active (focused) cell.
 * @cssproperty --cell-focus-ring - `box-shadow` of the active cell ring (defaults to a 1px solid ring; set to `none` to disable).
 */
export class LuxenInputOtp extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Position after which to insert a visual separator (e.g., 3 for a 3-3 grouping). */
  @property({ type: Number, reflect: true, attribute: 'separator-after' })
  separatorAfter?: number;

  private _input!: HTMLInputElement;
  private _container!: HTMLDivElement;
  private _cells: HTMLDivElement[] = [];
  private _separatorEl: HTMLSpanElement | null = null;
  private _initialized = false;

  override connectedCallback() {
    super.connectedCallback();
    requestAnimationFrame(() => this._setup());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._teardown();
  }

  // --- Setup / Teardown ---

  private _setup() {
    const input = this.querySelector<HTMLInputElement>('input');
    if (!input) return;

    this._input = input;

    // Derive digit count from --digits CSS custom property (default 6)
    const digits = Number(getComputedStyle(this).getPropertyValue('--digits').trim()) || 6;

    // Set sensible defaults — author can still override via HTML attributes
    const defaults: Record<string, string> = {
      type: 'text',
      inputmode: 'numeric',
      autocomplete: 'one-time-code',
      maxlength: String(digits),
      pattern: String.raw`\d{${digits}}`,
    };
    for (const [attr, value] of Object.entries(defaults)) {
      if (!this._input.hasAttribute(attr)) {
        this._input.setAttribute(attr, value);
      }
    }

    // Build visual cells container
    this._container = document.createElement('div');
    this._container.className = 'l-input-otp-cells';
    this._container.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < digits; i++) {
      const cell = document.createElement('div');
      cell.className = 'l-input-otp-cell';
      cell.appendChild(document.createElement('span'));
      this._cells.push(cell);
      this._container.appendChild(cell);

      // Insert separator after the specified position
      if (this.separatorAfter && i === this.separatorAfter - 1 && i < digits - 1) {
        this._separatorEl = document.createElement('span');
        this._separatorEl.className = 'l-input-otp-separator';
        this._container.appendChild(this._separatorEl);
      }
    }

    // Wrap: insert container before input, then move input inside
    this._input.replaceWith(this._container);
    this._container.appendChild(this._input);
    this._initialized = true;

    // Populate cells if input already has a value (e.g. disabled with prefilled value)
    this._updateCells();

    // Events — focus is deferred so it runs after the click that triggered it
    // (otherwise selectionStart is stale and the active cell flickers).
    this._input.addEventListener('input', this._updateCells);
    this._input.addEventListener('click', this._updateCells);
    this._input.addEventListener('keyup', this._updateCells);
    this._input.addEventListener('focus', this._scheduleUpdateCells);
    this._input.addEventListener('blur', this._clearCells);
  }

  private _teardown() {
    if (!this._initialized) return;

    this._input.removeEventListener('input', this._updateCells);
    this._input.removeEventListener('click', this._updateCells);
    this._input.removeEventListener('keyup', this._updateCells);
    this._input.removeEventListener('focus', this._scheduleUpdateCells);
    this._input.removeEventListener('blur', this._clearCells);

    // Restore input to direct child
    this._container.replaceWith(this._input);
    this._separatorEl?.remove();

    this._cells = [];
    this._separatorEl = null;
    this._initialized = false;
  }

  // --- Cell updates ---

  private _updateCells = (): void => {
    const value = this._input.value;
    const maxLen = this._input.maxLength || 6;
    const pos = Math.min(this._input.selectionStart ?? 0, maxLen - 1);
    const isFocused = document.activeElement === this._input;

    for (let i = 0; i < this._cells.length; i++) {
      const cell = this._cells[i];
      const span = cell.firstElementChild as HTMLSpanElement;
      const char = value[i] ?? '';

      span.textContent = char;

      if (char) {
        cell.setAttribute('data-filled', '');
      } else {
        cell.removeAttribute('data-filled');
      }

      if (isFocused && i === pos) {
        cell.setAttribute('data-active', '');
      } else {
        cell.removeAttribute('data-active');
      }
    }
  };

  private _clearCells = (): void => {
    for (const cell of this._cells) {
      cell.removeAttribute('data-active');
    }
  };

  private _scheduleUpdateCells = (): void => {
    requestAnimationFrame(this._updateCells);
  };
}
