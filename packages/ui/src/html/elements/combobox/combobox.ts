import { html, nothing, unsafeCSS } from 'lit';
import type { TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { Placement } from '@floating-ui/dom';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element.js';
import { PopoverController } from '../../shared/controllers/popover.js';
import { LocalizeController } from '../../shared/localize.js';
import { cls, uniqueId } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './combobox.css?inline';

const styles = unsafeCSS(rawStyles);

export type ComboboxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** A single option read from the `<datalist>`. */
export interface ComboboxItem {
  value: string;
  /** Plain text used for filtering and the input display. */
  label: string;
  disabled: boolean;
  /** Rich inner markup (from a non-empty `<option>`), projected into the row. */
  html?: string;
}

/** Default filter: accent/case-insensitive, every space-separated keyword must match. */
export type ComboboxFilter = (item: ComboboxItem, query: string) => boolean;

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const defaultFilter: ComboboxFilter = (item, query) => {
  if (!query) return true;
  const label = normalize(item.label);
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((kw) => label.includes(kw));
};

/** Fired when an option is committed (selected). Bubbles; not composed. */
export class ComboboxChangeEvent extends Event {
  readonly value: string;
  constructor(value: string) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.value = value;
  }
}

/** Fired as the user types (filter query changes). Bubbles; not composed. */
export class ComboboxInputEvent extends Event {
  /** The current query text. */
  readonly value: string;
  constructor(value: string) {
    super('input', { bubbles: true, composed: false, cancelable: false });
    this.value = value;
  }
}

interface ComboboxEventMap {
  change: ComboboxChangeEvent;
  input: ComboboxInputEvent;
}

/**
 * A text input paired with a filterable list of options (the ARIA combobox
 * pattern). Options are authored as a native `<datalist>` of `<option>` —
 * the same authoring surface as `l-select`. Form-associated.
 *
 * @summary A searchable text input with a filtered list of options.
 *
 * @example
 * ```html
 * <l-combobox label="Country" name="country" placeholder="Search…">
 *   <datalist>
 *     <option value="us">United States</option>
 *     <option value="fr">France</option>
 *   </datalist>
 * </l-combobox>
 * ```
 *
 * @event change - Fired when an option is selected. Bubbles. Not cancelable. Properties: `value: string`.
 * @event input - Fired as the user types. Bubbles. Not cancelable. Properties: `value: string` (the query).
 * @event show - Fired before the list opens. Cancelable.
 * @event hide - Fired before the list closes. Cancelable.
 *
 * @csspart base - The host wrapper.
 * @csspart control - The input control row (input + clear + chevron).
 * @csspart input - The text input.
 * @csspart panel - The floating popover panel.
 * @csspart listbox - The options container.
 * @csspart option - Each option row.
 * @csspart empty - The "no results" message.
 *
 * @cssproperty [--height] - Control height. Defaults to the form-control height.
 * @cssproperty [--border-radius] - Control + panel radius.
 * @cssproperty [--background] - Panel background.
 *
 * @customElement l-combobox
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class Combobox extends LuxenFormAssociatedElement {
  static override styles = [hostStyles, styles];

  private _localize = new LocalizeController(this);
  private readonly _listId = uniqueId('combobox-list');

  private _floating = new PopoverController(this, {
    getTriggerElement: () => this._controlEl,
    getFloatingElement: () => this._panelEl,
    getArrowElement: () => null,
  });

  /** Selected value (the chosen option's `value`). */
  @property({ reflect: true })
  accessor value = '';

  /** Placeholder text in the input. */
  @property()
  accessor placeholder = '';

  /** Accessible label for the input. */
  @property()
  accessor label = '';

  /** Control size. */
  @property({ reflect: true })
  accessor size: ComboboxSize = 'md';

  /** Show a button to clear the value. */
  @property({ type: Boolean, reflect: true, attribute: 'with-clear' })
  accessor withClear = false;

  /** Accept a typed value that matches no option. */
  @property({ type: Boolean, reflect: true, attribute: 'allow-custom' })
  accessor allowCustom = false;

  /** Wrap the matching substring of each option in `<mark>`. */
  @property({ type: Boolean })
  accessor highlight = true;

  /** Panel placement relative to the control. */
  @property()
  accessor placement: Placement = 'bottom-start';

  /** Override the option filter. `(item, query) => boolean`. */
  filter: ComboboxFilter = defaultFilter;

  @state() private accessor _open = false;
  @state() private accessor _query = '';
  @state() private accessor _activeIndex = -1;
  @state() private accessor _items: ComboboxItem[] = [];

  private get _controlEl() {
    return this.shadowRoot?.querySelector<HTMLElement>('.control') ?? null;
  }
  private get _panelEl() {
    return this.shadowRoot?.querySelector<HTMLElement>('.panel') ?? null;
  }
  private get _inputEl() {
    return this.shadowRoot?.querySelector<HTMLInputElement>('.input') ?? null;
  }

  override connectedCallback() {
    super.connectedCallback();
    this._readItems();
    this._defaultFormValue = this.value;
    this._syncFormValue(this.value);
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      this._syncFormValue(this.value);
      this._updateValidity();
      if (!this._open) this._resetDisplay();
    }
  }

  override formResetCallback() {
    this.value = this._defaultFormValue;
    this._query = '';
    this._activeIndex = -1;
    super.formResetCallback();
    this._resetDisplay();
  }

  override formStateRestoreCallback(state: string) {
    this.value = state;
    this._syncFormValue(state);
  }

  // --- Items (read from the light-DOM <datalist>) ---

  private _readItems() {
    const list = this.querySelector('datalist');
    const opts = list ? Array.from(list.options) : [];
    this._items = opts.map((o) => {
      const rich = o.childElementCount > 0;
      // Filter/display label: `label` attribute → rich title → flattened text.
      const title = o.querySelector(`.${cls('select-item-title')}`)?.textContent?.trim();
      const label = (o.getAttribute('label') || title || o.textContent || o.value).trim();
      return { value: o.value, label, disabled: o.disabled, html: rich ? o.innerHTML : undefined };
    });
  }

  private _labelForValue(value: string): string {
    return this._items.find((i) => i.value === value)?.label ?? (this.allowCustom ? value : '');
  }

  private get _filtered(): ComboboxItem[] {
    return this._items.filter((i) => this.filter(i, this._query));
  }

  private _resetDisplay() {
    const input = this._inputEl;
    if (input) input.value = this._labelForValue(this.value);
  }

  // --- Validity ---

  private _updateValidity() {
    if (this.required && !this.value) {
      this.setValidity(
        { valueMissing: true },
        this._localize.term('selectOption'),
        this._inputEl ?? undefined,
      );
    } else {
      this.setValidity({});
    }
  }

  // --- Open / close ---

  show() {
    if (this._open || this.disabled) return;
    this._readItems();
    if (!this.dispatchEvent(new Event('show', { cancelable: true }))) return;
    this._open = true;
    // Pre-activate the chosen option so a screen reader announces the current
    // selection when the list opens (only when not actively filtering).
    if (this.value && !this._query) {
      this._activeIndex = this._filtered.findIndex((i) => i.value === this.value);
    }
    this.updateComplete.then(() => {
      const panel = this._panelEl as (HTMLElement & { showPopover?: () => void }) | null;
      panel?.showPopover?.();
      this._floating.startPositioning({
        placement: this.placement,
        distance: 4,
        minWidth: 'trigger',
      });
    });
  }

  hide() {
    if (!this._open) return;
    if (!this.dispatchEvent(new Event('hide', { cancelable: true }))) return;
    this._open = false;
    this._activeIndex = -1;
    const panel = this._panelEl as (HTMLElement & { hidePopover?: () => void }) | null;
    if (panel?.matches?.(':popover-open')) (panel as { hidePopover?: () => void }).hidePopover?.();
    this._floating.stopPositioning();
    this._resetDisplay();
  }

  // --- Selection ---

  private _commit(item: ComboboxItem) {
    if (item.disabled) return;
    this.value = item.value;
    this._query = '';
    this.hasInteracted = true;
    const input = this._inputEl;
    if (input) input.value = item.label;
    this._syncFormValue(this.value);
    this._updateValidity();
    this.dispatchEvent(new ComboboxChangeEvent(this.value));
    this.hide();
    input?.focus();
  }

  private _commitActiveOrCustom() {
    const filtered = this._filtered;
    if (this._activeIndex >= 0 && filtered[this._activeIndex]) {
      this._commit(filtered[this._activeIndex]);
      return;
    }
    const input = this._inputEl;
    if (this.allowCustom && input) {
      this.value = input.value;
      this._syncFormValue(this.value);
      this._updateValidity();
      this.dispatchEvent(new ComboboxChangeEvent(this.value));
      this.hide();
    }
  }

  private _clear() {
    this.value = '';
    this._query = '';
    this._activeIndex = -1;
    if (this._inputEl) this._inputEl.value = '';
    this._syncFormValue('');
    this._updateValidity();
    this.dispatchEvent(new ComboboxChangeEvent(''));
    this._inputEl?.focus();
  }

  // --- Keyboard navigation (self-owned; aria-activedescendant model) ---

  private _moveActive(diff: 1 | -1) {
    if (!this._open) {
      // Open and land on the first (Down) or last (Up) option — APG.
      this.show();
      this._activeIndex = diff > 0 ? -1 : this._filtered.length;
    }
    this._stepActive(diff);
  }

  private _stepActive(diff: 1 | -1) {
    const items = this._filtered;
    const n = items.length;
    if (n === 0) return;
    let i = this._activeIndex + diff;
    if (i < 0) i = n - 1;
    if (i >= n) i = 0;
    // Skip disabled options.
    const start = i;
    while (items[i]?.disabled) {
      i += diff;
      if (i < 0) i = n - 1;
      if (i >= n) i = 0;
      if (i === start) return;
    }
    this._activeIndex = i;
    this.updateComplete.then(() => this._scrollActiveIntoView());
  }

  private _scrollActiveIntoView() {
    // Query by index, not `#id` — the unique id contains colons (invalid in a
    // CSS selector). The id value is still valid for aria-activedescendant.
    const opts = this.shadowRoot?.querySelectorAll<HTMLElement>('.option');
    opts?.[this._activeIndex]?.scrollIntoView({ block: 'nearest' });
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._moveActive(-1);
        break;
      // Home / End are intentionally NOT handled — in an editable combobox they
      // move the text cursor in the input (APG editable combobox pattern).
      case 'Enter':
        if (this._open) {
          e.preventDefault();
          this._commitActiveOrCustom();
        }
        break;
      case 'Escape':
        if (this._open) {
          e.preventDefault();
          this.hide();
        } else if (this.value || this._inputEl?.value) {
          this._clear();
        }
        break;
      case 'Tab':
        if (this._open && this._activeIndex >= 0) this._commitActiveOrCustom();
        break;
      default:
        break;
    }
  };

  private _onInput = (e: Event) => {
    this._query = (e.target as HTMLInputElement).value;
    this._activeIndex = -1;
    if (!this._open) this.show();
    this.dispatchEvent(new ComboboxInputEvent(this._query));
  };

  private _onControlPointerDown = (e: PointerEvent) => {
    // Toggle on clicking the control chrome (not while typing).
    if ((e.target as HTMLElement).closest('.clear')) return;
    if (this._open) return;
    this.show();
  };

  private _onFocusOut = (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && this.shadowRoot?.contains(next)) return;
    this.hasInteracted = true;
    this._updateValidity();
    this.hide();
  };

  // --- Render ---

  private _highlight(label: string): TemplateResult | string {
    const q = this._query.trim();
    if (!this.highlight || !q) return label;
    const idx = normalize(label).indexOf(normalize(q).split(/\s+/)[0]);
    if (idx < 0) return label;
    const before = label.slice(0, idx);
    const match = label.slice(idx, idx + q.length);
    const after = label.slice(idx + q.length);
    return html`${before}<mark>${match}</mark>${after}`;
  }

  override render() {
    const filtered = this._filtered;
    const activeId =
      this._open && this._activeIndex >= 0 ? `${this._listId}-opt-${this._activeIndex}` : undefined;
    const invalid = this.required && !this.value && this.hasInteracted;
    const status = !this._open
      ? ''
      : filtered.length === 0
        ? this._localize.term('noResults')
        : `${filtered.length} ${this._localize.term('suggestions')}`;

    return html`
      <div
        class="base"
        part="base"
        @focusout=${this._onFocusOut}
      >
        <div
          class="control"
          part="control"
          @pointerdown=${this._onControlPointerDown}
        >
          <slot name="prefix"></slot>
          <input
            class="input"
            part="input"
            type="text"
            role="combobox"
            autocomplete="off"
            spellcheck="false"
            .placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            aria-label=${this.label || nothing}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded=${this._open ? 'true' : 'false'}
            aria-controls=${this._listId}
            aria-activedescendant=${activeId ?? nothing}
            aria-required=${this.required ? 'true' : nothing}
            aria-invalid=${invalid ? 'true' : nothing}
            @input=${this._onInput}
            @keydown=${this._onKeyDown}
          />
          ${this.withClear && (this.value || this._query)
            ? html`<button
                class="clear"
                type="button"
                tabindex="-1"
                aria-label=${this._localize.term('clear')}
                @click=${this._clear}
              ></button>`
            : nothing}
          <span
            class="chevron"
            aria-hidden="true"
          ></span>
        </div>

        <div
          class="panel"
          part="panel"
          popover="manual"
        >
          <ul
            class="listbox"
            part="listbox"
            role="listbox"
            id=${this._listId}
            aria-label=${this.label || this._localize.term('suggestions')}
          >
            ${filtered.map(
              (item, i) => html`<li
                class="option"
                part="option"
                id=${`${this._listId}-opt-${i}`}
                role="option"
                aria-selected=${i === this._activeIndex ? 'true' : 'false'}
                aria-disabled=${item.disabled ? 'true' : nothing}
                data-current=${item.value === this.value ? '' : nothing}
                @pointerdown=${(e: Event) => e.preventDefault()}
                @click=${() => this._commit(item)}
              >
                ${item.html
                  ? html`<span class="option-rich">${unsafeHTML(item.html)}</span>`
                  : html`<span class="option-label">${this._highlight(item.label)}</span>`}
              </li>`,
            )}
          </ul>
          ${filtered.length === 0
            ? html`<div
                class="empty"
                part="empty"
              >
                ${this._localize.term('noResults')}
              </div>`
            : nothing}
        </div>

        <div
          class="visually-hidden"
          aria-live="polite"
        >
          ${status}
        </div>
      </div>
    `;
  }
}

// Typed addEventListener for the colliding `change` / `input` names.
export interface Combobox {
  addEventListener<K extends keyof ComboboxEventMap>(
    type: K,
    listener: (this: Combobox, ev: ComboboxEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof ComboboxEventMap>(
    type: K,
    listener: (this: Combobox, ev: ComboboxEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
