import { html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { LocalizeController } from '../../shared/localize.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './tag.css?inline';

const styles = unsafeCSS(rawStyles);

export type TagSize = 'sm' | 'md' | 'lg';

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
 * @summary A compact, optionally removable chip.
 *
 * @example
 * ```html
 * <l-tag removable>Design</l-tag>
 * ```
 *
 * @event remove - Fired when the user removes the tag (× click or Backspace/Delete). Cancelable; if not prevented the tag removes itself. Not composed, does not bubble.
 *
 * @slot - The tag label.
 * @slot prefix - Leading content, e.g. an `<l-icon>` or `<l-avatar>`.
 *
 * @csspart base - The chip container.
 * @csspart content - The label wrapper.
 * @csspart remove - The remove button.
 *
 * @cssproperty [--border-radius] - Corner radius. Defaults to a full pill.
 * @cssproperty [--background] - Chip background.
 * @cssproperty [--color] - Text color.
 *
 * @customElement l-tag
 */
export class Tag extends LuxenElement {
  static override styles = [hostStyles, styles];

  private _localize = new LocalizeController(this);

  /** Tag size: `sm`, `md` (default), or `lg`. */
  @property({ reflect: true })
  accessor size: TagSize = 'md';

  /** Show a remove button (and enable Backspace/Delete removal). */
  @property({ type: Boolean, reflect: true })
  accessor removable = false;

  /** Disable the tag — dims it and blocks removal. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

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

  override render() {
    return html`
      <span
        class="base"
        part="base"
        @keydown=${this._onKeyDown}
      >
        <slot name="prefix"></slot>
        <span
          class="content"
          part="content"
        >
          <slot></slot>
        </span>
        ${this.removable
          ? html`<button
              class="remove"
              part="remove"
              type="button"
              ?disabled=${this.disabled}
              aria-label=${this._localize.term('remove')}
              @click=${this._requestRemove}
            ></button>`
          : nothing}
      </span>
    `;
  }
}
