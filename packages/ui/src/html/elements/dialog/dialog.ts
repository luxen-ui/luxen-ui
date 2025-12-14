import { html, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';
import hostStyles from '../../shared/styles/host.styles';
import styles from './dialog.styles';

interface CommandEventLike extends Event {
  command: string;
  source: Element | null;
}

const supportsClosedBy =
  typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

// Native <dialog> doesn't lock body scroll. Inject a global rule that uses
// `:has()` to freeze the root scroll container whenever any modal l-dialog
// is open. Purely declarative — no manual lock/unlock bookkeeping.
// Symbol guard makes the injection idempotent across HMR reloads.
const SCROLL_LOCK_SHEET = Symbol.for('luxen-dialog-scroll-lock');
if (typeof document !== 'undefined' && !(SCROLL_LOCK_SHEET in document)) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`html:has([data-modal]) { overflow: hidden; scrollbar-gutter: stable; }`);
  document.adoptedStyleSheets.push(sheet);
  Object.defineProperty(document, SCROLL_LOCK_SHEET, { value: sheet });
}

/**
 * A modal dialog rendered in the top layer via the native `<dialog>` element.
 *
 * Open and close by toggling the `open` property (or the `--show` / `--hide`
 * Invoker commands). There are no public `show()` / `close()` methods.
 *
 * @slot - Body content.
 * @slot close - Close button (typically `<button class="l-close">`).
 * @slot footer - Footer actions.
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart header - The header wrapper containing the title and close slot.
 * @csspart title - The dialog title heading.
 * @csspart body - The body wrapper around the default slot.
 * @csspart footer - The footer wrapper around the footer slot.
 *
 * @cssproperty --width - Dialog width. Default `31rem`.
 * @cssproperty --border-radius - Dialog border radius. Default `6px`.
 * @cssproperty --show-duration - Open transition duration. Default `200ms`.
 * @cssproperty --hide-duration - Close transition duration. Default `200ms`.
 * @cssproperty --backdrop - Backdrop color.
 * @cssproperty --backdrop-blur - Backdrop blur amount (any CSS length). Default `0` (no blur). Set to e.g. `4px` for a subtle frost.
 *
 * @event show - Fired when the dialog opens. Not cancelable.
 * @event after-show - Fired after the open animation completes.
 * @event hide - Fired when the dialog is about to close. Cancelable — call `event.preventDefault()` to keep it open.
 * @event after-hide - Fired after the close animation completes.
 */
export class LuxenDialog extends LuxenElement {
  static styles = [hostStyles, styles];

  /** Dialog title rendered in the header. */
  @property()
  title = '';

  /** Whether the dialog is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Close when the backdrop is clicked. */
  @property({ type: Boolean, reflect: true, attribute: 'light-dismiss' })
  lightDismiss = false;

  @query('dialog')
  dialog!: HTMLDialogElement;

  private _mouseDownTarget: EventTarget | null = null;

  private _commandListener: EventListenerObject = {
    handleEvent: (e: Event) => this._onCommand(e as CommandEventLike),
  };

  // --- Lifecycle ---

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('command', this._commandListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('command', this._commandListener);
  }

  firstUpdated() {
    this.dialog.addEventListener('cancel', (e) => this._onCancel(e));
    this.dialog.addEventListener('close', () => this._onNativeClose());
    this.dialog.addEventListener('mousedown', (e) => {
      this._mouseDownTarget = e.target;
    });
    this.dialog.addEventListener('click', (e) => this._onDialogClick(e));
  }

  updated(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;

    if (this.open && !this.dialog.open) {
      // Opening — not cancelable.
      this.emit('show');
      this.toggleAttribute('data-modal', true);
      this.dialog.showModal();
      this._focusAutofocusTarget();
      this._emitAfter('after-show');
    } else if (!this.open && this.dialog.open) {
      // Closing — cancelable. Revert the property if consumer prevents.
      if (!this.emit('hide', { cancelable: true })) {
        this.open = true;
        return;
      }
      this.dialog.close();
      // `after-hide` is emitted from `_onNativeClose` (runs for every close path).
    }
  }

  // --- Event handlers ---

  // Custom commands on a custom element must start with `--`.
  // Built-in commands like "close" are reserved for native elements
  // and won't fire here.
  private _onCommand(e: CommandEventLike) {
    switch (e.command) {
      case '--hide':
        this.open = false;
        break;
      case '--show':
        this.open = true;
        break;
    }
  }

  // Fires on Escape and on `closedby="any"` close requests.
  // Does NOT fire when script calls `.close()`, so `updated()`'s cancelable
  // `hide` emit doesn't collide with this one.
  private _onCancel(e: Event) {
    if (!this.emit('hide', { cancelable: true })) {
      e.preventDefault();
    }
  }

  private _onNativeClose() {
    this.open = false;
    this.removeAttribute('data-modal');
    this._emitAfter('after-hide');
  }

  private _onDialogClick(e: MouseEvent) {
    // With `dialog { padding: 0 }`, `e.target === this.dialog` only fires
    // for backdrop clicks. The mousedown guard prevents drag-out dismissal.
    const clickedBackdrop = e.target === this.dialog && this._mouseDownTarget === this.dialog;
    this._mouseDownTarget = null;
    if (!clickedBackdrop) return;

    if (this.lightDismiss) {
      // When `supportsClosedBy`, the native `closedby="any"` already closed.
      if (!supportsClosedBy) this.open = false;
      return;
    }
    this._nudgeDismiss();
  }

  private _nudgeAnimation?: Animation;

  private _nudgeDismiss() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this._nudgeAnimation?.cancel();
    this._nudgeAnimation = this.dialog.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }],
      { duration: 250, easing: 'ease-in-out' },
    );
  }

  // Awaits every active animation on the dialog (transitions + @keyframes)
  // and then emits. Resolves immediately when no animations are running,
  // which covers `prefers-reduced-motion` and consumers that zero the
  // duration custom properties — cases where `transitionend` never fires.
  // Waits one frame first so @starting-style transitions have registered.
  private async _emitAfter(name: 'after-show' | 'after-hide') {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const anims = this.dialog.getAnimations({ subtree: false });
    await Promise.all(anims.map((a) => a.finished.catch(() => {})));
    if ((name === 'after-show') !== this.open) return;
    this.emit(name);
  }

  // Firefox/Safari don't reliably resolve `[autofocus]` when `<dialog>`
  // is in shadow DOM and the target is in light DOM. Resolve it manually.
  private _focusAutofocusTarget() {
    const target = this.querySelector<HTMLElement>('[autofocus]');
    target?.focus({ preventScroll: true });
  }

  render() {
    const closedby = this.lightDismiss && supportsClosedBy ? 'any' : nothing;
    return html`
      <dialog
        part="dialog"
        closedby=${closedby}
      >
        <header part="header">
          <h2 part="title">${this.title}</h2>
          <slot name="close"></slot>
        </header>
        <div part="body">
          <slot></slot>
        </div>
        <footer part="footer">
          <slot name="footer"></slot>
        </footer>
      </dialog>
    `;
  }
}
