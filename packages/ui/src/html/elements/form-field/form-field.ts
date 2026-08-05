import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { cls, uniqueId } from '../../registry.js';

type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
/** A form-associated custom element (e.g. `l-slider`) exposes the same constraint
 * surface as a native control but doesn't match the native selector. */
type FormControl = NativeControl | (HTMLElement & { checkValidity(): boolean });

const CONTROL_SELECTOR = 'input, select, textarea';

/**
 * @summary Progressively enhances a label + control + messages group: wires the
 * accessibility plumbing (`id`/`for`, `aria-describedby`, `aria-invalid`,
 * required marker) and picks an inline or stacked layout from the control type.
 *
 * Styling stays on the control (`.l-checkbox`, …); inside a field a bare control
 * is auto-styled by the element CSS. Add `unstyled` to keep the ARIA wiring while
 * opting out of that auto-styling (e.g. for a third-party control).
 *
 * @example
 * ```html
 * <l-form-field>
 *   <label>Subscribe to the newsletter</label>
 *   <input type="checkbox" />
 *   <p class="l-hint">One email a month, unsubscribe anytime.</p>
 *   <p class="l-error">Please make a choice to continue.</p>
 * </l-form-field>
 * ```
 *
 * @slot - A `<label>`, one form control (a native `input` / `select` /
 * `textarea`, or a form-associated custom element such as `l-slider`), and
 * optional `.l-hint` / `.l-error` message elements, in any order.
 *
 * @cssClass .l-hint - Helper text element. Always visible; linked via `aria-describedby`.
 * @cssClass .l-error - Error message element. Hidden until invalid, then revealed with `role="alert"` and linked via `aria-describedby`.
 *
 * @customElement l-form-field
 */
export class FormField extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Layout, derived from the control type (`inline` for checkbox/radio/switch, otherwise `stacked`). Set one to force it. */
  @property({ reflect: true })
  layout?: 'inline' | 'stacked';

  /** Reflected when the control is required. Drives the label marker. */
  @property({ type: Boolean, reflect: true })
  required = false;

  /** Reflected when the control is not required. */
  @property({ type: Boolean, reflect: true })
  optional = false;

  /** Reflected once the control is invalid after interaction (or set to force the invalid state). */
  @property({ type: Boolean, reflect: true })
  invalid = false;

  /** Opt out of auto-styling the control; the ARIA wiring is preserved. */
  @property({ type: Boolean, reflect: true })
  unstyled = false;

  private _control: FormControl | null = null;
  private _hint: HTMLElement | null = null;
  private _error: HTMLElement | null = null;
  private _hasInteracted = false;
  private _wired = false;
  /** describedby ids set by the author that we must preserve. */
  private _externalDescribedby: string[] = [];

  override connectedCallback() {
    super.connectedCallback();
    // Run synchronously when the children are already parsed (the common case:
    // the element is defined after its markup). Fall back to a macrotask — which,
    // unlike requestAnimationFrame, still fires in a hidden tab — if the element
    // upgrades mid-parse before its children exist.
    if (this._setup()) return;
    setTimeout(() => this._setup(), 0);
    // A custom-element control (e.g. l-slider) can upgrade after us — its module
    // may load lazily — so the macrotask retry can still miss it. Re-attempt once
    // each pending custom-element child is defined. `_setup()` is idempotent via
    // `_wired`, so the earliest successful attempt wins.
    for (const el of this.querySelectorAll('*')) {
      const tag = el.localName;
      if (tag.includes('-') && !customElements.get(tag)) {
        void customElements.whenDefined(tag).then(() => this._setup());
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._teardown();
    this._wired = false;
  }

  private _setup(): boolean {
    if (this._wired) return true;
    this._control = this._findControl();
    if (!this._control) return false;
    this._wired = true;
    const control = this._control;

    // Consumer-authored markup, so these carry the consumer's configured
    // `cssPrefix` — match on `cls()`, not a hardcoded `.l-hint` / `.l-error`.
    this._hint = this.querySelector(`.${cls('hint')}`);
    this._error = this.querySelector(`.${cls('error')}`);
    // The error is announced when revealed; the field owns this (the message is
    // a plain element with no JS of its own).
    if (this._error && !this._error.hasAttribute('role')) {
      this._error.setAttribute('role', 'alert');
    }

    // id / label[for]
    if (!control.id) control.id = uniqueId('field');
    const label = this.querySelector('label');
    if (label && !label.htmlFor && !label.contains(control)) {
      label.htmlFor = control.id;
    }

    // Ensure message elements have ids for aria-describedby.
    if (this._hint && !this._hint.id) this._hint.id = uniqueId('hint');
    if (this._error && !this._error.id) this._error.id = uniqueId('error');

    // Capture author-provided describedby ids (minus our managed ones).
    const managed = new Set([this._hint?.id, this._error?.id].filter(Boolean) as string[]);
    this._externalDescribedby = (control.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && !managed.has(id));

    // Layout from control type (unless explicitly forced).
    if (!this.layout) {
      const isToggle =
        control.tagName === 'INPUT' &&
        (['checkbox', 'radio'].includes((control as HTMLInputElement).type) ||
          control.getAttribute('role') === 'switch');
      this.layout = isToggle ? 'inline' : 'stacked';
    }

    // Required marker (control is the source of truth).
    this.required = control.hasAttribute('required');
    this.optional = !this.required;

    // The error stays hidden until the field is invalid after interaction (or is
    // already flagged invalid by the author / server). Visibility is owned by CSS
    // off the reflected `invalid` state — the field never toggles `hidden`.
    const preInvalid = this.invalid || control.getAttribute('aria-invalid') === 'true';
    this._hasInteracted = preInvalid;

    control.addEventListener('invalid', this._onInvalid);
    control.addEventListener('blur', this._onInteract);
    control.addEventListener('change', this._onInteract);
    control.addEventListener('input', this._onInteract);

    this._updateValidity();
    return true;
  }

  /**
   * The field's control: a native `input`/`select`/`textarea`, or — when none is
   * present — the first form-associated custom element (e.g. `l-slider`). Those
   * expose the same `checkValidity()` / `invalid` event surface but don't match
   * the native selector, so without this fallback the field never wires up and
   * the `l-error` message stays visible on load.
   */
  private _findControl(): FormControl | null {
    const native = this.querySelector<NativeControl>(CONTROL_SELECTOR);
    if (native) return native;
    for (const el of this.querySelectorAll<HTMLElement>('*')) {
      if ((el.constructor as { formAssociated?: boolean }).formAssociated) {
        return el as FormControl;
      }
    }
    return null;
  }

  private _teardown() {
    const control = this._control;
    if (!control) return;
    control.removeEventListener('invalid', this._onInvalid);
    control.removeEventListener('blur', this._onInteract);
    control.removeEventListener('change', this._onInteract);
    control.removeEventListener('input', this._onInteract);
  }

  private _onInvalid = (event: Event) => {
    // Suppress the native validation bubble in favour of `l-error`.
    event.preventDefault();
    this._hasInteracted = true;
    this._updateValidity();
  };

  private _onInteract = () => {
    this._hasInteracted = true;
    this._updateValidity();
  };

  private _updateValidity() {
    const control = this._control;
    if (!control) return;
    const showError = this._hasInteracted && !control.checkValidity();

    // `invalid` reflects to the host; CSS reveals `.l-error` from there.
    this.invalid = showError;
    if (showError) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');

    this._updateDescribedby();
  }

  private _updateDescribedby() {
    const control = this._control;
    if (!control) return;
    const ids = [...this._externalDescribedby];
    if (this._hint?.id) ids.push(this._hint.id);
    if (this._error && this.invalid && this._error.id) ids.push(this._error.id);
    if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
    else control.removeAttribute('aria-describedby');
  }
}
