import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { cls } from '../../registry.js';

/**
 * Enhances a child `<input>` with visual digit cells (Stripe-style OTP input).
 *
 * A single hidden `<input>` handles keyboard, paste, and autocomplete.
 * Visual cells are rendered as real DOM elements with individual borders and focus ring.
 *
 * @summary Stripe-style OTP input with visual digit cells over a hidden native input.
 * @customElement l-input-otp
 *
 * @attribute size - sm | lg — Cell size. Default is md.
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
export class InputOtp extends LuxenElement {
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
  private _setupTimer = 0;

  override connectedCallback() {
    super.connectedCallback();
    // Children may not be parsed yet when the element upgrades mid-parse: try
    // synchronously, then retry once on a macrotask. setTimeout, not rAF — rAF
    // is suspended in hidden documents, so the element would stay inert there.
    if (!this._trySetup()) {
      this._setupTimer = window.setTimeout(() => this._trySetup(), 0);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._setupTimer);
    this._teardown();
  }

  /** @returns true when setup ran or was already done; false to schedule a retry. */
  private _trySetup(): boolean {
    if (this._initialized || !this.isConnected) return true;
    if (!this.querySelector('input')) return false;
    this._setup();
    return true;
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

    // Build visual cells container. The real <input> is moved INTO this
    // container (below), so the container itself must stay exposed to AT —
    // aria-hidden goes on each decorative cell/separator, never on the wrapper
    // (a focusable element inside an aria-hidden subtree violates WCAG 4.1.2).
    this._container = document.createElement('div');
    this._container.className = cls('input-otp-cells');

    for (let i = 0; i < digits; i++) {
      const cell = document.createElement('div');
      cell.className = cls('input-otp-cell');
      cell.setAttribute('aria-hidden', 'true');
      cell.appendChild(document.createElement('span'));
      this._cells.push(cell);
      this._container.appendChild(cell);

      // Insert separator after the specified position
      if (this.separatorAfter && i === this.separatorAfter - 1 && i < digits - 1) {
        this._separatorEl = document.createElement('span');
        this._separatorEl.className = cls('input-otp-separator');
        this._separatorEl.setAttribute('aria-hidden', 'true');
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
