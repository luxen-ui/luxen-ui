import { html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { LocalizeController } from '../../shared/localize.js';
import { cls } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import checkboxAppearance from '../../shared/styles/checkbox-appearance.styles.js';
import rawStyles from './tag.css?inline';

const styles = unsafeCSS(rawStyles);

export type TagSize = 'sm' | 'md' | 'lg';
export type TagControl = 'none' | 'checkbox';

/**
 * Fired when the user asks to remove the tag — clicking the × button, or
 * pressing Backspace/Delete while it is focused. Cancelable: call
 * `preventDefault()` to keep the tag (the controlling host then manages the
 * list itself); otherwise the tag removes itself from the DOM. Does not bubble.
 */
export class TagRemoveEvent extends Event {
  constructor() {
    super('remove', { bubbles: false, composed: false, cancelable: true });
  }
}

/** Fired when a `selectable` tag is toggled. Bubbles; not composed. */
export class TagChangeEvent extends Event {
  readonly selected: boolean;
  constructor(selected: boolean) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.selected = selected;
  }
}

interface TagEventMap {
  change: TagChangeEvent;
}

declare global {
  interface GlobalEventHandlersEventMap {
    remove: TagRemoveEvent;
  }
}

/**
 * A compact chip for tokens, filters, and multi-select values. Shadow DOM so its
 * styles are self-contained and it renders correctly **anywhere**, including
 * inside another element's shadow root (e.g. the `<l-select>` multi-select
 * trigger).
 *
 * Add `selectable` to turn the chip into a filter control: the tag itself
 * becomes a toggle button (`aria-pressed`), and re-activating a selected tag
 * deselects it — the affordance a radio group cannot offer, so a facet always
 * has a way back to "all". Add `control="checkbox"` for a multi-select axis and
 * the library's own checkbox rides inside, with the chip as its label.
 *
 * @summary A compact, optionally removable or selectable chip.
 *
 * @example
 * ```html
 * <l-tag removable>Design</l-tag>
 * <l-tag selectable selected>A3</l-tag>
 * <l-tag selectable control="checkbox">Color <span slot="suffix">79</span></l-tag>
 * ```
 *
 * @event remove - Fired when the user removes the tag (× click or Backspace/Delete). Cancelable; if not prevented the tag removes itself. Not composed, does not bubble.
 * @event change - Fired when a `selectable` tag is toggled. Not cancelable — like the platform's own `change`, and like `l-segmented-control`. Bubbles. Properties: `selected: boolean`. The chip is uncontrolled: it applies the new state before dispatching, so a host that vetoes a toggle (a "max 3 filters" rule, an async guard) sets `selected` back in the listener — the revert lands in the same render and is never painted.
 *
 * @slot - The tag label.
 * @slot prefix - Leading content, e.g. an `<l-icon>` or `<l-avatar>`.
 * @slot suffix - Trailing content, e.g. a result count. Gets the chip's own gutter, so no margin is needed.
 *
 * @csspart base - The chip container.
 * @csspart content - The label wrapper.
 * @csspart toggle - The toggle button rendered by `selectable` (not with `control="checkbox"`).
 * @csspart checkbox - The native checkbox rendered by `control="checkbox"`.
 * @csspart remove - The remove button — a full-height segment at the end of the chip.
 *
 * @cssproperty [--text-color] - Label color.
 * @cssproperty [--background-color] - Chip fill.
 * @cssproperty [--border-color] - Chip border, and the rule that splits off the remove button. Defaults to a tint of `--text-color`; setting it pins the line in every state, so a token-based theme keeps its own value on hover.
 * @cssproperty [--selected-text-color] - Label, border, and checkbox accent when selected. Defaults to the library's form-control accent, lightened in dark mode.
 * @cssproperty [--selected-background-color] - Chip fill when selected. Defaults to a tint of `--selected-text-color`.
 * @cssproperty [--selected-border-color] - Chip border when selected. Defaults to a 45% tint of `--selected-text-color`. Selection replaces the line the same way it replaces the fill and the ink, so a chip themed with `--border-color` still gets its emphasis step; set this to theme that step too.
 * @cssproperty [--height] - Chip height. Defaults to the `size` step (a selectable chip is taller, to keep a comfortable target).
 * @cssproperty [--font-size] - Label size. Defaults to the `size` step — 12px, or 14px at `size="lg"`. Set it with `--height` to land between the two steps in a dense filter panel.
 * @cssproperty [--padding-inline] - Horizontal padding. Defaults to the `size` step.
 * @cssproperty [--border-radius] - Corner radius. Defaults to a full pill.
 *
 * @customElement l-tag
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class Tag extends LuxenElement {
  static override styles = [hostStyles, checkboxAppearance, styles];

  private _localize = new LocalizeController(this);

  /** Tag size: `sm`, `md` (default), or `lg`. */
  @property({ reflect: true })
  accessor size: TagSize = 'md';

  /** Show a remove button (and enable Backspace/Delete removal). */
  @property({ type: Boolean, reflect: true })
  accessor removable = false;

  /** Make the tag a filter control the user can toggle on and off. */
  @property({ type: Boolean, reflect: true })
  accessor selectable = false;

  /** Whether the tag is selected. Reflected, so `[selected]` is styleable. */
  @property({ type: Boolean, reflect: true })
  accessor selected = false;

  /**
   * What drives the selection: `none` (default) makes the chip itself a toggle
   * button; `checkbox` renders a checkbox inside and makes the chip its label —
   * the right choice for a multi-select facet. Implies `selectable`.
   */
  @property({ reflect: true })
  accessor control: TagControl = 'none';

  /** Disable the tag — dims it and blocks selection and removal. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  constructor() {
    super();
    // The chip is operated from inside the shadow root, which a click
    // dispatched on the host never reaches — see `_onHostClick`.
    this.addEventListener('click', this._onHostClick);
  }

  override willUpdate() {
    // A checkbox is only ever rendered on a selectable chip, so the attribute
    // (which every selectable style rule keys off) is derived rather than
    // duplicated in every selector — and in the consumer's markup.
    if (this.control === 'checkbox') this.selectable = true;
  }

  override updated() {
    // Re-assert the box, don't rely on the `.checked` binding. Lit dirty-checks
    // a property part against the value it last wrote, and a click has the user
    // agent flip `checked` behind its back — so when a controlling host vetoes
    // the toggle by setting `selected` back to what it already was, Lit sees no
    // change, skips the write, and leaves a checked box on an unselected chip
    // (announced "checked" too). Cheap: the query is null on every other path.
    const box = this.renderRoot.querySelector<HTMLInputElement>('.checkbox');
    if (box) box.checked = this.selected;
  }

  private _requestRemove = () => {
    if (this.disabled) return;
    const event = new TagRemoveEvent();
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.remove();
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    if (!this.removable || this.disabled) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      this._requestRemove();
    }
  };

  private _toggle = () => {
    if (this.disabled) return;
    // Toggling, not setting: re-activating a selected tag releases it.
    this.selected = !this.selected;
    this.dispatchEvent(new TagChangeEvent(this.selected));
  };

  /**
   * Events do not propagate *down* into a shadow tree, so a click dispatched on
   * the host — `tag.click()`, a test runner resolving the chip by its test id,
   * a runner computing the chip's centre (`elementFromPoint()` retargets shadow
   * content back to the host) — never reaches the toggle button or the
   * checkbox, and silently does nothing. Delegate it.
   *
   * Only when the host *is* the target: a real gesture originates at the inner
   * button, at the checkbox, or at slotted content, and is already handled
   * where it lands — so this never double-toggles. `removable` stays out of it;
   * removing is the × button's own gesture.
   */
  private _onHostClick = (e: Event) => {
    if (!this.selectable || this.disabled) return;
    if (e.composedPath()[0] !== this) return;
    // Right for `control="checkbox"` too: `_toggle()` flips `selected` and
    // fires `change`, and `updated()` re-asserts `box.checked` from it.
    this._toggle();
  };

  private _onCheckboxChange = (e: Event) => {
    this.selected = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(new TagChangeEvent(this.selected));
  };

  private _label() {
    return html`
      <slot name="prefix"></slot>
      <span
        class="content"
        part="content"
      >
        <slot></slot>
      </span>
      <slot name="suffix"></slot>
    `;
  }

  private _removeButton() {
    return this.removable
      ? html`<button
          class="remove"
          part="remove"
          type="button"
          ?disabled=${this.disabled}
          aria-label=${this._localize.term('remove')}
          @click=${this._requestRemove}
        ></button>`
      : nothing;
  }

  override render() {
    if (this.control === 'checkbox') {
      return html`
        <label
          class="base"
          part="base"
          @keydown=${this._onKeyDown}
        >
          <input
            class="checkbox ${cls('checkbox')}"
            part="checkbox"
            type="checkbox"
            .checked=${this.selected}
            ?disabled=${this.disabled}
            @change=${this._onCheckboxChange}
          />
          ${this._label()}${this._removeButton()}
        </label>
      `;
    }

    if (this.selectable) {
      return html`
        <span
          class="base"
          part="base"
          @keydown=${this._onKeyDown}
        >
          <button
            class="toggle"
            part="toggle"
            type="button"
            aria-pressed=${this.selected ? 'true' : 'false'}
            ?disabled=${this.disabled}
            @click=${this._toggle}
          >
            ${this._label()}
          </button>
          ${this._removeButton()}
        </span>
      `;
    }

    return html`
      <span
        class="base"
        part="base"
        @keydown=${this._onKeyDown}
      >
        ${this._label()}${this._removeButton()}
      </span>
    `;
  }
}

// Type `addEventListener('change', …)` so listeners receive a `TagChangeEvent`
// (with `.selected`) instead of a bare `Event`. `change` collides with lib.dom's
// `GlobalEventHandlersEventMap`, so it can't be augmented globally — the
// overloads are declaration-merged onto this element's interface instead. The
// interface MUST come after the class (the CEM analyzer dedups on the first
// declaration of the name). See `tabs.ts` for the fully-annotated reference.
export interface Tag {
  addEventListener<K extends keyof TagEventMap>(
    type: K,
    listener: (this: Tag, ev: TagEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof TagEventMap>(
    type: K,
    listener: (this: Tag, ev: TagEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
