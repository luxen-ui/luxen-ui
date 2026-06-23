import { html, nothing, unsafeCSS } from 'lit';
import type { TemplateResult } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { Placement } from '@floating-ui/dom';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element.js';
import { PopoverController } from '../../shared/controllers/popover.js';
import { ListboxNavController } from '../../shared/controllers/listbox-nav.js';
import { LocalizeController } from '../../shared/localize.js';
import { cls, tagName, uniqueId } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './select.css?inline';
// Registers the chip element used to render selected values in multiple mode.
import '../tag/index.js';

const styles = unsafeCSS(rawStyles);

export type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** A single option read from the `<datalist>`. */
export interface SelectItem {
  value: string;
  /** Plain text used for filtering and the trigger display. */
  label: string;
  disabled: boolean;
  /** Authored `selected` attribute — seeds the initial value. */
  selected: boolean;
  /** Rich inner markup (from a non-empty `<option>`), projected into the row. */
  html?: string;
}

/** Default filter: accent/case-insensitive, every space-separated keyword must match. */
export type SelectFilter = (item: SelectItem, query: string) => boolean;

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const defaultFilter: SelectFilter = (item, query) => {
  if (!query) return true;
  const label = normalize(item.label);
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((kw) => label.includes(kw));
};

/** Fired when the selection changes. Bubbles; not composed. */
export class SelectChangeEvent extends Event {
  /** The selected value (single mode) or values (multiple mode). */
  readonly value: string | string[];
  constructor(value: string | string[]) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.value = value;
  }
}

/** Fired as the user types in the search box. Bubbles; not composed. */
export class SelectInputEvent extends Event {
  /** The current query text. */
  readonly value: string;
  constructor(value: string) {
    super('input', { bubbles: true, composed: false, cancelable: false });
    this.value = value;
  }
}

interface SelectEventMap {
  change: SelectChangeEvent;
  input: SelectInputEvent;
}

/**
 * A button-triggered, searchable select. A trigger shows the current selection,
 * opening a popover with a search box and a `role="listbox"` of options authored
 * as a native `<datalist>` of `<option>` — the same authoring surface as
 * `l-combobox` and the native `.l-select`. Form-associated.
 *
 * @summary A searchable select with a button trigger and a popover listbox.
 *
 * @example
 * ```html
 * <l-select label="Country" name="country" placeholder="Select a country…">
 *   <datalist>
 *     <option value="us">United States</option>
 *     <option value="fr" selected>France</option>
 *   </datalist>
 * </l-select>
 * ```
 *
 * @event change - Fired when the selection changes. Bubbles. Not cancelable. Properties: `value: string | string[]`.
 * @event input - Fired as the user types in the search box. Bubbles. Not cancelable. Properties: `value: string` (the query).
 * @event show - Fired before the listbox opens. Cancelable.
 * @event hide - Fired before the listbox closes. Cancelable.
 *
 * @csspart base - The host wrapper.
 * @csspart trigger - The button that opens the listbox.
 * @csspart value - The selection display inside the trigger.
 * @csspart chevron - The trigger chevron.
 * @csspart clear - The clear button.
 * @csspart panel - The floating popover panel.
 * @csspart search - The search input.
 * @csspart listbox - The options container.
 * @csspart option - Each option row.
 * @csspart empty - The "no results" message.
 *
 * @cssproperty [--height] - Control height. Defaults to the form-control height.
 * @cssproperty [--border-radius] - Trigger + panel radius.
 * @cssproperty [--background] - Panel background.
 *
 * @customElement l-select
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class Select extends LuxenFormAssociatedElement {
  static override styles = [hostStyles, styles];

  private _localize = new LocalizeController(this);
  private readonly _listId = uniqueId('select-list');

  private _floating = new PopoverController(this, {
    getTriggerElement: () => this._triggerEl,
    getFloatingElement: () => this._panelEl,
    getArrowElement: () => null,
  });

  private _nav = new ListboxNavController(this, {
    listboxId: this._listId,
    getCount: () => this._filtered.length,
    isDisabled: (i) => this._filtered[i]?.disabled ?? false,
    isOpen: () => this._open,
    open: () => this.show(),
    getOptionElements: () => this.shadowRoot?.querySelectorAll<HTMLElement>('.option'),
  });

  /** Placeholder shown in the trigger when nothing is selected. */
  @property()
  accessor placeholder = '';

  /** Accessible label for the trigger. */
  @property()
  accessor label = '';

  /** Control size. */
  @property({ reflect: true })
  accessor size: SelectSize = 'md';

  /** Show a filter box inside the popover (opt-in, for long lists). */
  @property({ type: Boolean, reflect: true })
  accessor searchable = false;

  /** Show a button to clear the value. */
  @property({ type: Boolean, reflect: true, attribute: 'with-clear' })
  accessor withClear = false;

  /** Panel placement relative to the trigger. */
  @property()
  accessor placement: Placement = 'bottom-start';

  /** Allow selecting multiple values — renders chips and submits one entry per value. */
  @property({ type: Boolean, reflect: true })
  accessor multiple = false;

  /** Override the option filter. `(item, query) => boolean`. */
  filter: SelectFilter = defaultFilter;

  @state() private accessor _values: string[] = [];
  @state() private accessor _open = false;
  @state() private accessor _query = '';
  @state() private accessor _items: SelectItem[] = [];

  private _defaultValues: string[] = [];

  /** The selected value (single mode) or array of values (multiple mode). */
  get value(): string | string[] {
    return this.multiple ? [...this._values] : (this._values[0] ?? '');
  }
  set value(v: string | string[]) {
    this._values = Array.isArray(v) ? [...v] : v ? [v] : [];
  }

  private get _triggerEl() {
    return this.shadowRoot?.querySelector<HTMLElement>('.trigger') ?? null;
  }
  private get _panelEl() {
    return this.shadowRoot?.querySelector<HTMLElement>('.panel') ?? null;
  }
  private get _searchEl() {
    return this.shadowRoot?.querySelector<HTMLInputElement>('.search') ?? null;
  }

  override get validationTarget() {
    return this._triggerEl ?? undefined;
  }

  override connectedCallback() {
    super.connectedCallback();
    this._readItems();
    // Seed the initial selection: an explicit `value` attribute wins, else the
    // authored `<option selected>` (declarative pre-selection — markup-driven).
    if (this._values.length === 0) {
      const attr = this.getAttribute('value');
      if (attr) {
        this._values = [attr];
      } else {
        const selected = this._items.filter((i) => i.selected).map((i) => i.value);
        this._values = this.multiple ? selected : selected.slice(0, 1);
      }
    }
    this._defaultValues = [...this._values];
    this._syncForm();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('_values') || changed.has('multiple')) {
      this._syncForm();
      this._updateValidity();
    }
  }

  override formResetCallback() {
    this._values = [...this._defaultValues];
    this._query = '';
    this._nav.reset();
    super.formResetCallback();
    this._syncForm();
  }

  override formStateRestoreCallback(state: string) {
    this.value = state;
    this._syncForm();
  }

  // --- Items (read from the light-DOM <datalist>) ---

  private _readItems() {
    const list = this.querySelector('datalist');
    const opts = list ? Array.from(list.options) : [];
    this._items = opts.map((o) => {
      const rich = o.childElementCount > 0;
      const title = o.querySelector(`.${cls('select-item-title')}`)?.textContent?.trim();
      const label = (o.getAttribute('label') || title || o.textContent || o.value).trim();
      return {
        value: o.value,
        label,
        disabled: o.disabled,
        selected: o.hasAttribute('selected'),
        html: rich ? o.innerHTML : undefined,
      };
    });
  }

  private _itemFor(value: string): SelectItem | undefined {
    return this._items.find((i) => i.value === value);
  }

  private get _filtered(): SelectItem[] {
    return this._items.filter((i) => this.filter(i, this._query));
  }

  // --- Validity ---

  /** Push the current selection to the form (single value, or one entry per value). */
  private _syncForm() {
    if (this.multiple) {
      const data = new FormData();
      for (const v of this._values) data.append(this.name, v);
      this._internals.setFormValue(data);
    } else {
      this._internals.setFormValue(this._values[0] ?? '');
    }
  }

  private _updateValidity() {
    if (this.required && this._values.length === 0) {
      this.setValidity(
        { valueMissing: true },
        this._localize.term('selectOption'),
        this._triggerEl ?? undefined,
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
    this._query = '';
    // Pre-activate the (first) chosen option so a screen reader announces it on open.
    if (this._values.length) {
      this._nav.setActive(this._filtered.findIndex((i) => i.value === this._values[0]));
    }
    void this.updateComplete.then(() => {
      const panel = this._panelEl as (HTMLElement & { showPopover?: () => void }) | null;
      panel?.showPopover?.();
      this._floating.startPositioning({
        placement: this.placement,
        distance: 4,
        minWidth: 'trigger',
      });
      // Move focus into the search box (or the listbox when not searchable).
      (this._searchEl ?? this._panelEl?.querySelector<HTMLElement>('.listbox'))?.focus();
      document.addEventListener('pointerdown', this._onDocumentPointerDown, true);
    });
  }

  hide({ focusTrigger = true } = {}) {
    if (!this._open) return;
    if (!this.dispatchEvent(new Event('hide', { cancelable: true }))) return;
    this._open = false;
    this._query = '';
    this._nav.reset();
    const panel = this._panelEl as (HTMLElement & { hidePopover?: () => void }) | null;
    if (panel?.matches?.(':popover-open')) panel.hidePopover?.();
    this._floating.stopPositioning();
    document.removeEventListener('pointerdown', this._onDocumentPointerDown, true);
    if (focusTrigger) this._triggerEl?.focus();
  }

  private _onDocumentPointerDown = (e: PointerEvent) => {
    // popover="manual" does not light-dismiss; do it ourselves.
    const path = e.composedPath();
    if (path.includes(this)) return;
    this.hasInteracted = true;
    this._updateValidity();
    this.hide({ focusTrigger: false });
  };

  // --- Selection ---

  /** Single: set the value and close. Multiple: toggle the value and stay open. */
  private _select(item: SelectItem) {
    if (item.disabled) return;
    this.hasInteracted = true;
    if (this.multiple) {
      this._values = this._values.includes(item.value)
        ? this._values.filter((v) => v !== item.value)
        : [...this._values, item.value];
      this.dispatchEvent(new SelectChangeEvent(this.value));
      this._searchEl?.focus();
    } else {
      this._values = [item.value];
      this.dispatchEvent(new SelectChangeEvent(this.value));
      this.hide();
    }
  }

  /** Deselect a single value (chip remove, multiple mode). */
  private _removeValue(value: string) {
    this._values = this._values.filter((v) => v !== value);
    this.hasInteracted = true;
    this.dispatchEvent(new SelectChangeEvent(this.value));
  }

  private _clear(e?: Event) {
    e?.stopPropagation();
    this._values = [];
    this.hasInteracted = true;
    this.dispatchEvent(new SelectChangeEvent(this.value));
    this._triggerEl?.focus();
  }

  // --- Keyboard ---

  private _onTriggerKeyDown = (e: KeyboardEvent) => {
    if (this._open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.show();
    }
  };

  private _onPanelKeyDown = (e: KeyboardEvent) => {
    if (this._nav.onKeyDown(e)) return;
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        const active = this._filtered[this._nav.activeIndex];
        if (active) this._select(active);
        break;
      }
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
      case 'Tab':
        this.hide({ focusTrigger: false });
        break;
      default:
        break;
    }
  };

  private _onSearchInput = (e: Event) => {
    this._query = (e.target as HTMLInputElement).value;
    this._nav.reset();
    this.dispatchEvent(new SelectInputEvent(this._query));
  };

  // --- Render ---

  private _highlight(label: string): TemplateResult | string {
    const q = this._query.trim();
    if (!q) return label;
    const idx = normalize(label).indexOf(normalize(q).split(/\s+/)[0]);
    if (idx < 0) return label;
    return html`${label.slice(0, idx)}<mark>${label.slice(idx, idx + q.length)}</mark>${label.slice(
      idx + q.length,
    )}`;
  }

  private _renderSingleValue() {
    const selected = this._itemFor(this._values[0]);
    if (!selected) {
      return html`<span class="value-text placeholder">${this.placeholder}</span>`;
    }
    return selected.html
      ? html`${unsafeHTML(selected.html)}`
      : html`<span class="value-text">${selected.label}</span>`;
  }

  private _renderChips() {
    if (this._values.length === 0) {
      return html`<span class="value-text placeholder">${this.placeholder}</span>`;
    }
    // The chip tag is the renameable `l-tag`; it's a Shadow-DOM element so its
    // remove button renders correctly inside this element's shadow root.
    const chip = unsafeStatic(tagName('tag'));
    return this._values.map((value) => {
      const item = this._itemFor(value);
      return staticHtml`<${chip}
        size="sm"
        removable
        part="tag"
        @remove=${(e: Event) => {
          e.preventDefault();
          this._removeValue(value);
        }}
        @click=${(e: Event) => e.stopPropagation()}
        >${item?.label ?? value}</${chip}
      >`;
    });
  }

  private _renderTrigger(invalid: boolean) {
    const inner = html`
      <span
        class="value"
        part="value"
        >${this.multiple ? this._renderChips() : this._renderSingleValue()}</span
      >
      <span
        class="chevron"
        aria-hidden="true"
      ></span>
    `;
    const onClick = () => (this._open ? this.hide() : this.show());
    // Multiple mode uses a focusable div (role="combobox") so the chips' remove
    // buttons are valid interactive children — a <button> trigger can't nest them.
    return this.multiple
      ? html`<div
          class="trigger"
          part="trigger"
          role="combobox"
          tabindex=${this.disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-controls=${this._listId}
          aria-label=${this.label || nothing}
          aria-required=${this.required ? 'true' : nothing}
          aria-invalid=${invalid ? 'true' : nothing}
          @click=${onClick}
          @keydown=${this._onTriggerKeyDown}
        >
          ${inner}
        </div>`
      : html`<button
          class="trigger"
          part="trigger"
          type="button"
          ?disabled=${this.disabled}
          aria-haspopup="listbox"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-controls=${this._listId}
          aria-label=${this.label || nothing}
          aria-required=${this.required ? 'true' : nothing}
          aria-invalid=${invalid ? 'true' : nothing}
          @click=${onClick}
          @keydown=${this._onTriggerKeyDown}
        >
          ${inner}
        </button>`;
  }

  override render() {
    const filtered = this._filtered;
    const activeId = this._nav.activeDescendant;
    const activeIndex = this._nav.activeIndex;
    const invalid = this.required && this._values.length === 0 && this.hasInteracted;
    const hasValue = this._values.length > 0;
    const status = !this._open
      ? ''
      : filtered.length === 0
        ? this._localize.term('noResults')
        : `${filtered.length} ${this._localize.term('suggestions')}`;

    return html`
      <div
        class="base"
        part="base"
      >
        ${this._renderTrigger(invalid)}
        ${this.withClear && hasValue
          ? html`<button
              class="clear"
              part="clear"
              type="button"
              aria-label=${this._localize.term('clear')}
              @click=${this._clear}
            ></button>`
          : nothing}

        <div
          class="panel"
          part="panel"
          popover="manual"
          @keydown=${this._onPanelKeyDown}
        >
          ${this.searchable
            ? html`<div class="search-row">
                <input
                  class="search"
                  part="search"
                  type="text"
                  role="searchbox"
                  autocomplete="off"
                  spellcheck="false"
                  .placeholder=${this._localize.term('search') ?? ''}
                  aria-controls=${this._listId}
                  aria-activedescendant=${activeId ?? nothing}
                  @input=${this._onSearchInput}
                />
              </div>`
            : nothing}

          <ul
            class="listbox"
            part="listbox"
            role="listbox"
            id=${this._listId}
            tabindex=${this.searchable ? nothing : '0'}
            aria-label=${this.label || this._localize.term('suggestions')}
            aria-multiselectable=${this.multiple ? 'true' : nothing}
            aria-activedescendant=${!this.searchable ? (activeId ?? nothing) : nothing}
          >
            ${filtered.map(
              (item, i) => html`<li
                class="option"
                part="option"
                id=${this._nav.optionId(i)}
                role="option"
                aria-selected=${this._values.includes(item.value) ? 'true' : 'false'}
                aria-disabled=${item.disabled ? 'true' : nothing}
                data-active=${i === activeIndex ? '' : nothing}
                data-current=${this._values.includes(item.value) ? '' : nothing}
                @pointerdown=${(e: Event) => e.preventDefault()}
                @click=${() => this._select(item)}
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
export interface Select {
  addEventListener<K extends keyof SelectEventMap>(
    type: K,
    listener: (this: Select, ev: SelectEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof SelectEventMap>(
    type: K,
    listener: (this: Select, ev: SelectEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
