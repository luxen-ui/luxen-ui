import { html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './rating.css?inline';

const styles = unsafeCSS(rawStyles);

/** Fired when the rating value changes in edit mode. Bubbles; not composed. */
export class RatingChangeEvent extends Event {
  readonly name: string | undefined;
  readonly value: string;
  readonly checked: boolean;
  readonly sourceEvent: Event;
  constructor(detail: {
    name: string | undefined;
    value: string;
    checked: boolean;
    sourceEvent: Event;
  }) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.name = detail.name;
    this.value = detail.value;
    this.checked = detail.checked;
    this.sourceEvent = detail.sourceEvent;
  }
}

interface RatingEventMap {
  change: RatingChangeEvent;
}

/**
 * A star rating component using CSS mask-image.
 *
 * @summary Displays a star rating, optionally interactive.
 *
 * @csspart label - The label element shown in edit mode.
 *
 * @cssproperty --icon-size - The size of each icon. Defaults to `20px`.
 * @cssproperty --active-color - The fill color for rated icons. Defaults to `gold`.
 * @cssproperty --inactive-color - The fill color for empty icons. Defaults to `#ddd`.
 * @cssproperty --spacing - The spacing between icons. Defaults to `0px`.
 * @cssproperty --icon - Custom SVG shape as a `url()`. Defaults to a 5-pointed star.
 *
 * @event change - Emitted when the rating value changes in edit mode. Bubbles. Properties: `name: string`, `value: string`, `checked: boolean`, `sourceEvent: Event`.
 *
 * @customElement l-rating
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class Rating extends LuxenFormAssociatedElement {
  static override styles = [hostStyles, styles];

  private currentLabel = '';
  private previewedValue = 0;

  @property({ type: Boolean, reflect: true, attribute: 'edit-mode' })
  accessor editMode = false;

  @property({
    type: Array,
    reflect: true,
    converter: {
      fromAttribute: (value: string) => value.split('|'),
      toAttribute: (value: string[]) => (value.length ? value.join('|') : null),
    },
  })
  accessor labels: string[] = [];

  @property({ type: Number, reflect: true })
  accessor value = 0;

  @property({ type: Number, reflect: true })
  accessor length = 5;

  /** Optional callback returning a CSS `url()` string for a given position (1-based). */
  getIcon?: (value: number) => string;

  override connectedCallback() {
    super.connectedCallback();
    this._defaultFormValue = String(this.value);
    this._syncFormValue(this._defaultFormValue);
  }

  override formResetCallback() {
    this.value = Number(this._defaultFormValue);
    super.formResetCallback();
  }

  override formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete') {
    this.value = Number(state);
    this._syncFormValue(state);
  }

  override firstUpdated() {
    this.setLabelForValue(this.value);
  }

  private setLabelForValue(value: number | string) {
    const intValue = typeof value === 'string' ? parseInt(value, 10) : value;
    this.currentLabel = intValue ? (this.labels?.[intValue - 1] ?? '') : '';
    this.requestUpdate();
  }

  private getRatingStyle() {
    const max = this.length;
    const fillPct = max > 0 ? (this.value / max) * 100 : 0;
    const step = 'calc(var(--icon-size) + var(--spacing))';

    const icons = Array.from({ length: max }, (_, i) => this.getIcon?.(i + 1) ?? 'var(--_icon)');
    const positions = Array.from({ length: max }, (_, i) =>
      i === 0 ? '0 0' : `calc(${i} * ${step}) 0`,
    );

    return [
      `width: calc(${max} * var(--icon-size) + ${max - 1} * var(--spacing))`,
      `--_fill: ${fillPct}%`,
      `mask-image: ${icons.join(', ')}`,
      `mask-position: ${positions.join(', ')}`,
    ].join('; ');
  }

  override render() {
    if (!this.editMode) {
      return html`<div
        class="rating"
        style=${this.getRatingStyle()}
      ></div>`;
    }

    const activeCount = this.previewedValue || this.value;

    return html`
      <div
        class="wrapper"
        @focusout=${this.clearPreview}
      >
        <div class="rating-edit">
          ${Array.from({ length: this.length }, (_, i) => {
            const v = i + 1;
            const icon = this.getIcon?.(v);
            return html`
              <label
                class="icon-wrapper"
                @pointerover=${() => this.previewValue(v)}
                @pointerout=${this.clearPreview}
              >
                <input
                  type="radio"
                  name=${this.name ?? nothing}
                  value="${v}"
                  aria-label="${this.labels?.[i] ?? `${v} ${v === 1 ? 'star' : 'stars'}`}"
                  ?checked="${this.value === v}"
                  ?disabled="${this.disabled}"
                  @click=${this.onClick}
                  @focusin=${() => this.previewValue(v)}
                />
                <span
                  class="icon ${v <= activeCount ? 'active' : ''}"
                  style=${icon ? `mask-image: ${icon}` : nothing}
                ></span>
              </label>
            `;
          })}
        </div>
        ${this.labels?.length
          ? html`<div
              class="rating-label"
              part="label"
            >
              ${this.currentLabel}
            </div>`
          : nothing}
      </div>
    `;
  }

  private previewValue = (value: number) => {
    this.previewedValue = value;
    this.setLabelForValue(value);
  };

  private clearPreview = (event?: FocusEvent) => {
    if (event) {
      const related = event.relatedTarget as Node | null;
      if (related && this.shadowRoot?.contains(related)) return;
    }
    this.previewedValue = 0;
    this.setLabelForValue(this.value);
  };

  private onClick = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const clickedValue = Number(target.value);
    this.value = clickedValue === this.value ? 0 : clickedValue;
    this.hasInteracted = true;
    this._syncFormValue(String(this.value));

    this.dispatchEvent(
      new RatingChangeEvent({
        name: this.name,
        value: String(this.value),
        checked: this.value > 0,
        sourceEvent: event,
      }),
    );
  };
}

// Types `addEventListener('change', …)` as `RatingChangeEvent` on this element
// (the global event map can't be augmented for the colliding name `change`).
// See the Tabs interface in tabs.ts for the full rationale and the gotchas.
export interface Rating {
  addEventListener<K extends keyof RatingEventMap>(
    type: K,
    listener: (this: Rating, ev: RatingEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof RatingEventMap>(
    type: K,
    listener: (this: Rating, ev: RatingEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
