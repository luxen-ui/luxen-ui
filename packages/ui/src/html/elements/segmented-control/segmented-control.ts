import { property } from 'lit/decorators.js';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element.js';

export type SegmentedControlSize = 'sm' | 'md' | 'lg' | 'xl';

/** Fired when the selected segment changes. Bubbles; not composed. */
export class SegmentChangeEvent extends Event {
  readonly value: string;
  readonly index: number;
  constructor(value: string, index: number) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.value = value;
    this.index = index;
  }
}

interface SegmentedControlEventMap {
  change: SegmentChangeEvent;
}

/**
 * @summary A single-select segmented control: a compact, mutually-exclusive
 * switch between a few options (radio-group semantics with a sliding pill).
 * Progressively enhances light-DOM `<button>`s so it works before JS runs.
 * Form-associated: give it a `name` and its selected `value` is submitted with
 * the form (and restored on reset), like a native radio group.
 *
 * @example
 * Mark the initially-selected segment with `aria-checked="true"` (or set
 * `value` to its `value` attribute) so it is styled before the script upgrades
 * the element.
 * ```html
 * <l-segmented-control label="Metric" value="cost">
 *   <button value="volume">Volume</button>
 *   <button value="cost" aria-checked="true">Cost</button>
 * </l-segmented-control>
 * ```
 *
 * @event change - Fired when the selected segment changes. Not cancelable. Bubbles. Properties: `value: string`, `index: number`.
 *
 * @cssproperty [--indicator-color=var(--l-color-surface)] - Background of the sliding pill behind the selected segment.
 * @cssproperty [--border-radius=var(--l-radius-lg)] - Corner radius of the track.
 *
 * @customElement l-segmented-control
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class SegmentedControl extends LuxenFormAssociatedElement {
  override createRenderRoot() {
    return this;
  }

  private _initialized = false;
  private _setupTimer = 0;
  private _buttons: HTMLButtonElement[] = [];
  private _resizeObserver: ResizeObserver | null = null;

  /** Value of the selected segment (its `value` attribute, else its index). */
  @property({ reflect: true })
  value = '';

  /** Control height, aligned with buttons and form controls at the same size. */
  @property({ reflect: true })
  size: SegmentedControlSize = 'md';

  /** Accessible label announced for the group. Not displayed on screen. */
  @property({ reflect: true })
  label?: string;

  /** Stretch segments to fill the container width. */
  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  fullWidth = false;

  // --- Lifecycle ---

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
    if (this.querySelectorAll('button').length < 2) return false;
    this._setup();
    return true;
  }

  override updated(changed: Map<string, unknown>) {
    if (!this._initialized) return;
    if (changed.has('value')) {
      this._select(this._resolveActiveIndex(), false);
    }
    if (changed.has('size')) {
      this._updateIndicator();
    }
    if (changed.has('label')) {
      if (this.label) {
        this.setAttribute('aria-label', this.label);
      } else {
        this.removeAttribute('aria-label');
      }
    }
    if (changed.has('disabled')) {
      this._applyDisabledState();
    }
  }

  // --- Form lifecycle ---

  override formResetCallback() {
    // Restoring `value` re-selects the default segment via `updated()`.
    this.value = this._defaultFormValue;
    super.formResetCallback();
  }

  override formStateRestoreCallback(state: string, mode: 'restore' | 'autocomplete') {
    this.value = state;
    super.formStateRestoreCallback(state, mode);
  }

  // --- Setup / Teardown ---

  private _setup() {
    this._buttons = Array.from(this.querySelectorAll('button'));
    if (this._buttons.length < 2) return;
    this._initialized = true;

    this.setAttribute('role', 'radiogroup');
    if (this.label) this.setAttribute('aria-label', this.label);

    const activeIndex = this._resolveActiveIndex();

    for (let i = 0; i < this._buttons.length; i++) {
      const btn = this._buttons[i];
      // Force type=button so a segment never submits the enclosing form.
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(i === activeIndex));
      btn.setAttribute('tabindex', i === activeIndex ? '0' : '-1');

      // A segment with no visible text is icon-only: square it and require an
      // accessible name (the icon itself is decorative to assistive tech).
      if ((btn.textContent ?? '').trim() === '') {
        btn.setAttribute('data-icon-only', '');
        if (!btn.hasAttribute('aria-label') && !btn.hasAttribute('aria-labelledby')) {
          // eslint-disable-next-line no-console
          console.warn(
            `<${this.localName}>: icon-only segment #${i} has no accessible name; add aria-label.`,
          );
        }
      }
    }

    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);

    // Reflect a whole-control `disabled` onto the segments (aria + tab order).
    this._applyDisabledState();

    // Canonicalize `value` to the active segment now that roles are set, and
    // seed the form value (the value a form reset restores to).
    this._syncValueFromIndex(activeIndex);
    this._defaultFormValue = this.value;
    this._syncFormValue(this.value);

    // Initial pill position. Synchronous first (offset reads force layout),
    // then a ResizeObserver keeps it correct across hidden→visible transitions
    // and size changes — rAF is suspended in hidden documents, so it must not
    // be the only scheduling mechanism.
    this._updateIndicator();
    this._resizeObserver = new ResizeObserver(() => this._updateIndicator());
    this._resizeObserver.observe(this);
  }

  private _teardown() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeyDown);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._initialized = false;
  }

  // --- Selection ---

  /** Resolve the selected index from `value`, else an authored `aria-checked`, else 0. */
  private _resolveActiveIndex(): number {
    const { _buttons } = this;
    if (this.value !== '') {
      const byValue = _buttons.findIndex((b) => (b.getAttribute('value') ?? '') === this.value);
      if (byValue >= 0) return byValue;
      const asIndex = Number(this.value);
      if (Number.isInteger(asIndex) && asIndex >= 0 && asIndex < _buttons.length) return asIndex;
    }
    const checked = _buttons.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    if (checked >= 0) return checked;
    // No explicit selection: default to the first enabled segment (else 0).
    const firstEnabled = _buttons.findIndex((b) => !this._isDisabled(b));
    return firstEnabled >= 0 ? firstEnabled : 0;
  }

  private _syncValueFromIndex(index: number) {
    this.value = this._buttons[index]?.getAttribute('value') ?? String(index);
  }

  private _select(index: number, emitEvent = true) {
    if (index < 0 || index >= this._buttons.length) return;
    // Whether this is an actual change — re-selecting the current segment must
    // not re-fire `change` (matches native radio / `<select>`).
    const changed = this._buttons[index].getAttribute('aria-checked') !== 'true';

    for (let i = 0; i < this._buttons.length; i++) {
      const isActive = i === index;
      this._buttons[i].setAttribute('aria-checked', String(isActive));
      // Disabled control keeps every segment out of the tab order.
      this._buttons[i].setAttribute('tabindex', isActive && !this.disabled ? '0' : '-1');
    }

    this._syncValueFromIndex(index);
    this._syncFormValue(this.value);
    this._updateIndicator();

    if (emitEvent && changed) {
      this.hasInteracted = true;
      this.dispatchEvent(new SegmentChangeEvent(this.value, index));
    }
  }

  /** Index of the next non-disabled segment from `from`, moving by `dir`, wrapping. */
  private _nextEnabled(from: number, dir: 1 | -1): number {
    const len = this._buttons.length;
    for (let step = 1; step <= len; step++) {
      const i = (from + dir * step + len * step) % len;
      if (!this._isDisabled(this._buttons[i])) return i;
    }
    return from;
  }

  private _isDisabled(btn: HTMLButtonElement): boolean {
    return btn.disabled || btn.getAttribute('aria-disabled') === 'true';
  }

  /** Reflect the host `disabled` state onto the segments (aria + tab order). */
  private _applyDisabledState() {
    for (const btn of this._buttons) {
      if (this.disabled) {
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('tabindex', '-1');
      } else {
        btn.removeAttribute('aria-disabled');
        // Restore the roving tabindex (only the selected segment is tabbable).
        btn.setAttribute('tabindex', btn.getAttribute('aria-checked') === 'true' ? '0' : '-1');
      }
    }
  }

  // --- Indicator ---

  private _updateIndicator() {
    const active = this._buttons.find((b) => b.getAttribute('aria-checked') === 'true');
    if (!active) return;
    this.style.setProperty('--_indicator-left', `${active.offsetLeft}px`);
    this.style.setProperty('--_indicator-width', `${active.offsetWidth}px`);
  }

  // --- Event handlers ---

  private _onClick = (e: Event) => {
    if (this.disabled) return;
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!btn) return;
    const index = this._buttons.indexOf(btn);
    if (index < 0 || this._isDisabled(btn)) return;
    this._select(index);
    btn.focus();
  };

  // Typed `Event` (not `KeyboardEvent`): the listener is attached to `this`,
  // whose merged addEventListener overloads (see the interface below) fall back
  // to the platform `EventListener` signature for non-map events like `keydown`.
  private _onKeyDown = (e: Event) => {
    if (this.disabled) return;
    const ke = e as KeyboardEvent;
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') !== 'radio') return;

    const current = this._buttons.indexOf(target as HTMLButtonElement);
    if (current < 0) return;

    let next = current;
    switch (ke.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = this._nextEnabled(current, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = this._nextEnabled(current, -1);
        break;
      case 'Home':
        next = this._nextEnabled(-1, 1);
        break;
      case 'End':
        next = this._nextEnabled(this._buttons.length, -1);
        break;
      case ' ':
        // Space (re)selects the focused segment (APG radio group).
        break;
      default:
        return;
    }
    e.preventDefault();
    this._select(next);
    this._buttons[next].focus();
  };
}

// Type `addEventListener('change', …)` so listeners receive a `SegmentChangeEvent`
// (with `.value`/`.index`) instead of a bare `Event`. `change` collides with
// lib.dom's `GlobalEventHandlersEventMap`, so it can't be augmented globally —
// the overloads are declaration-merged onto this element's interface instead.
// The interface MUST come after the class (the CEM analyzer dedups on the first
// declaration of the name). See `tabs.ts` for the fully-annotated reference.
export interface SegmentedControl {
  addEventListener<K extends keyof SegmentedControlEventMap>(
    type: K,
    listener: (this: SegmentedControl, ev: SegmentedControlEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof SegmentedControlEventMap>(
    type: K,
    listener: (this: SegmentedControl, ev: SegmentedControlEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
