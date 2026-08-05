import { html, nothing, unsafeCSS } from 'lit';
import type { PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element.js';
import { LocalizeController } from '../../shared/localize.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './slider.css?inline';

const styles = unsafeCSS(rawStyles);

export type SliderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SliderOrientation = 'horizontal' | 'vertical';

type Thumb = 'min' | 'max' | 'value';

/** Fired continuously while a thumb is dragged or stepped. Bubbles; not composed. */
export class SliderInputEvent extends Event {
  /** Value of the (first) thumb. */
  readonly value: number;
  /** All thumb values, low to high. One entry in single mode, two in range mode. */
  readonly values: number[];
  constructor(values: number[]) {
    super('input', { bubbles: true, composed: false, cancelable: false });
    this.value = values[0] ?? 0;
    this.values = values;
  }
}

/** Fired when a thumb is released after a change. Bubbles; not composed. */
export class SliderChangeEvent extends Event {
  /** Value of the (first) thumb. */
  readonly value: number;
  /** All thumb values, low to high. One entry in single mode, two in range mode. */
  readonly values: number[];
  constructor(values: number[]) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.value = values[0] ?? 0;
    this.values = values;
  }
}

interface SliderEventMap {
  input: SliderInputEvent;
  change: SliderChangeEvent;
}

/**
 * A single- or dual-thumb range slider. Pick a numeric value, or a min–max
 * range with `range`. Form-associated: the value is submitted under `name`
 * (range mode submits the low and high values as two entries).
 *
 * @summary Pick a numeric value or a min–max range by dragging a thumb.
 *
 * @example
 * ```html
 * <l-slider label="Volume" min="0" max="100" value="40" name="volume"></l-slider>
 * ```
 *
 * @example Range (min–max)
 * ```html
 * <l-slider label="Price" range min="0" max="100" min-value="20" max-value="70" name="price"></l-slider>
 * ```
 *
 * @event input - Fired continuously while a thumb moves. Bubbles. Not cancelable. Properties: `value: number`, `values: number[]`.
 * @event change - Fired when a thumb is released. Bubbles. Not cancelable. Properties: `value: number`, `values: number[]`.
 *
 * @csspart base - The slider container.
 * @csspart track - The full-width rail.
 * @csspart indicator - The filled portion of the rail.
 * @csspart thumb - Each draggable thumb.
 * @csspart tooltip - The value tooltip shown above a thumb when `with-tooltip` is set.
 *
 * @cssproperty [--track-size] - Thickness of the rail.
 * @cssproperty [--thumb-size] - Diameter of each thumb.
 * @cssproperty [--track-color] - Color of the unfilled rail.
 * @cssproperty [--indicator-color] - Color of the filled portion.
 * @cssproperty [--thumb-color] - Background color of the thumbs.
 *
 * @customElement l-slider
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class Slider extends LuxenFormAssociatedElement {
  static override styles = [hostStyles, styles];

  private _localize = new LocalizeController(this);

  /** Minimum value. */
  @property({ type: Number, reflect: true })
  accessor min = 0;

  /** Maximum value. */
  @property({ type: Number, reflect: true })
  accessor max = 100;

  /** Step increment. */
  @property({ type: Number, reflect: true })
  accessor step = 1;

  /** Single-thumb value. */
  @property({ type: Number, reflect: true })
  accessor value = 0;

  /** Enable a two-thumb min–max range. */
  @property({ type: Boolean, reflect: true })
  accessor range = false;

  /** Lower value (range mode). */
  @property({ type: Number, reflect: true, attribute: 'min-value' })
  accessor minValue = 0;

  /** Upper value (range mode). */
  @property({ type: Number, reflect: true, attribute: 'max-value' })
  accessor maxValue = 100;

  /** Accessible label for the slider (and base for the range thumbs' names). */
  @property()
  accessor label = '';

  /** Control size. */
  @property({ reflect: true })
  accessor size: SliderSize = 'md';

  /** Layout axis. Vertical sliders increase upward. */
  @property({ reflect: true })
  accessor orientation: SliderOrientation = 'horizontal';

  /** Show a tooltip with the current value while a thumb is focused or dragged. */
  @property({ type: Boolean, reflect: true, attribute: 'with-tooltip' })
  accessor withTooltip = false;

  /**
   * Formats a value for the tooltip and the `aria-valuetext` announcement.
   * Assign a function `(value: number) => string`, e.g. to add a unit or currency.
   */
  valueFormatter?: (value: number) => string;

  /** The thumb currently being dragged, or null. */
  @state() private accessor _activeThumb: Thumb | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this._defaultFormValue = this._serialize();
    this._syncForm();
  }

  override willUpdate(changed: PropertyValues<this>) {
    // Keep values inside [min, max] and, in range mode, ordered low ≤ high.
    if (
      changed.has('min') ||
      changed.has('max') ||
      changed.has('value') ||
      changed.has('minValue') ||
      changed.has('maxValue') ||
      changed.has('range')
    ) {
      if (this.range) {
        this.minValue = this._clamp(this.minValue);
        this.maxValue = this._clamp(this.maxValue);
        if (this.minValue > this.maxValue) {
          // The thumb the user is NOT dragging holds its ground.
          if (this._activeThumb === 'max') this.maxValue = this.minValue;
          else this.minValue = this.maxValue;
        }
      } else {
        this.value = this._clamp(this.value);
      }
    }
  }

  override updated() {
    this._syncForm();
  }

  override formResetCallback() {
    const [lo, hi] = this._parse(this._defaultFormValue);
    if (this.range) {
      this.minValue = lo;
      this.maxValue = hi;
    } else {
      this.value = lo;
    }
    super.formResetCallback();
  }

  override formStateRestoreCallback(state: string) {
    const [lo, hi] = this._parse(state);
    if (this.range) {
      this.minValue = lo;
      this.maxValue = hi;
    } else {
      this.value = lo;
    }
  }

  // --- Value helpers ---

  private _clamp(v: number): number {
    const min = this.min;
    const max = this.max;
    const step = this.step > 0 ? this.step : 1;
    const stepped = Math.round((v - min) / step) * step + min;
    return Math.min(Math.max(stepped, min), max);
  }

  private _percent(v: number): number {
    const span = this.max - this.min;
    return span > 0 ? ((v - this.min) / span) * 100 : 0;
  }

  /** Current thumb values, low to high. */
  get values(): number[] {
    return this.range ? [this.minValue, this.maxValue] : [this.value];
  }

  private _serialize(): string {
    return this.range ? `${this.minValue},${this.maxValue}` : String(this.value);
  }

  private _parse(s: string): [number, number] {
    const parts = s.split(',').map(Number);
    return [parts[0] ?? this.min, parts[1] ?? this.max];
  }

  private _syncForm() {
    if (this.range) {
      const data = new FormData();
      if (this.name) {
        data.append(this.name, String(this.minValue));
        data.append(this.name, String(this.maxValue));
      }
      this._internals.setFormValue(data);
    } else {
      this._syncFormValue(String(this.value));
    }
  }

  // --- Mutations ---

  private _set(thumb: Thumb, raw: number, commit: boolean) {
    const next = this._clamp(raw);
    if (thumb === 'min') {
      this.minValue = Math.min(next, this.maxValue);
    } else if (thumb === 'max') {
      this.maxValue = Math.max(next, this.minValue);
    } else {
      this.value = next;
    }
    this.hasInteracted = true;
    this.dispatchEvent(new SliderInputEvent(this.values));
    if (commit) this.dispatchEvent(new SliderChangeEvent(this.values));
  }

  private _valueOf(thumb: Thumb): number {
    if (thumb === 'min') return this.minValue;
    if (thumb === 'max') return this.maxValue;
    return this.value;
  }

  private _format(v: number): string {
    return this.valueFormatter ? this.valueFormatter(v) : String(v);
  }

  // --- Keyboard (APG slider pattern) ---

  private _onKeyDown(thumb: Thumb, e: KeyboardEvent) {
    if (this.disabled) return;
    const step = this.step > 0 ? this.step : 1;
    const big = Math.max(step, (this.max - this.min) / 10);
    const current = this._valueOf(thumb);
    let next: number | undefined;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + big;
        break;
      case 'PageDown':
        next = current - big;
        break;
      case 'Home':
        next = this.min;
        break;
      case 'End':
        next = this.max;
        break;
      default:
        return;
    }
    e.preventDefault();
    this._set(thumb, next, true);
  }

  // --- Pointer drag ---

  private _onPointerDown(e: PointerEvent) {
    if (this.disabled || e.button !== 0) return;
    const track = this.shadowRoot?.querySelector('.track') as HTMLElement | undefined;
    if (!track) return;

    const valueAt = this._valueFromPointer(track, e);
    const thumb: Thumb = this.range
      ? Math.abs(valueAt - this.minValue) <= Math.abs(valueAt - this.maxValue)
        ? 'min'
        : 'max'
      : 'value';

    this._activeThumb = thumb;
    this._set(thumb, valueAt, false);
    this._focusThumb(thumb);

    const move = (ev: PointerEvent) => this._set(thumb, this._valueFromPointer(track, ev), false);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this._activeThumb = null;
      this.dispatchEvent(new SliderChangeEvent(this.values));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private _valueFromPointer(track: HTMLElement, e: PointerEvent): number {
    const rect = track.getBoundingClientRect();
    // Vertical sliders increase upward: top edge is max, bottom edge is min.
    const ratio =
      this.orientation === 'vertical'
        ? rect.height > 0
          ? (rect.bottom - e.clientY) / rect.height
          : 0
        : rect.width > 0
          ? (e.clientX - rect.left) / rect.width
          : 0;
    return this.min + ratio * (this.max - this.min);
  }

  private _focusThumb(thumb: Thumb) {
    const sel = thumb === 'value' ? '.thumb' : `.thumb[data-thumb="${thumb}"]`;
    (this.shadowRoot?.querySelector(sel) as HTMLElement | undefined)?.focus();
  }

  // --- Render ---

  private _renderThumb(thumb: Thumb, ariaLabel: string) {
    const v = this._valueOf(thumb);
    return html`<span
      class="thumb"
      part="thumb"
      data-thumb=${thumb}
      role="slider"
      tabindex=${this.disabled ? -1 : 0}
      aria-label=${ariaLabel || nothing}
      aria-valuemin=${this.min}
      aria-valuemax=${this.max}
      aria-valuenow=${v}
      aria-valuetext=${this.valueFormatter ? this._format(v) : nothing}
      aria-orientation=${this.orientation}
      aria-disabled=${this.disabled ? 'true' : nothing}
      ?data-active=${this._activeThumb === thumb}
      style="--pos:${this._percent(v)}%"
      @keydown=${(e: KeyboardEvent) => this._onKeyDown(thumb, e)}
    >
      <span
        class="tooltip"
        part="tooltip"
        aria-hidden="true"
        >${this._format(v)}</span
      >
    </span>`;
  }

  override render() {
    const start = this.range ? this._percent(this.minValue) : 0;
    const end = this.range ? this._percent(this.maxValue) : this._percent(this.value);
    const thumbLabel = (term: 'rangeMinimum' | 'rangeMaximum') =>
      this.label ? `${this.label} ${this._localize.term(term)}` : this._localize.term(term);

    return html`
      <div
        class="base"
        part="base"
        role="group"
        aria-label=${this.label || nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        @pointerdown=${this._onPointerDown}
      >
        <div
          class="track"
          part="track"
        >
          <div
            class="indicator"
            part="indicator"
            style="--start:${start}%;--end:${end}%"
          ></div>
        </div>
        ${this.range
          ? html`${this._renderThumb('min', thumbLabel('rangeMinimum'))}${this._renderThumb(
              'max',
              thumbLabel('rangeMaximum'),
            )}`
          : this._renderThumb('value', this.label)}
      </div>
    `;
  }
}

// Types `addEventListener('input' | 'change', …)` on this element (the global
// event map can't be augmented for the colliding names). See input-stepper.ts
// for the full rationale.
export interface Slider {
  addEventListener<K extends keyof SliderEventMap>(
    type: K,
    listener: (this: Slider, ev: SliderEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof SliderEventMap>(
    type: K,
    listener: (this: Slider, ev: SliderEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
