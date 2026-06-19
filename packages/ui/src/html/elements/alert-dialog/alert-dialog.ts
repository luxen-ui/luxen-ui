import { html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import hostStyles from '../../shared/styles/host.styles.js';
import { HasSlotController } from '../../shared/controllers/has-slot-controller.js';
import { Dialog } from '../dialog/dialog.js';
import dialogStyles from '../dialog/dialog.styles.js';
import buttonStyles from '../../shared/styles/button-core.styles.js';
import rawAlertStyles from './alert-dialog.css?inline';
import '../spinner/index.js';

// The built-in actions render as `.l-button`, styled inside the shadow root from
// the SAME shared button-core as the light-DOM `.l-button` (single source of
// truth — no copy to drift). alert-dialog.css adds only the dialog layout.
const alertStyles = unsafeCSS(rawAlertStyles);

/**
 * Fired when the user accepts an alert dialog (the confirm action). Cancelable —
 * call `event.preventDefault()` to keep the dialog open (e.g. to await an async
 * task); close it yourself afterwards by setting `open = false`.
 *
 * Does not bubble and is not composed: listen on the element itself.
 */
export class ConfirmEvent extends Event {
  constructor() {
    super('confirm', { bubbles: false, composed: false, cancelable: true });
  }
}

/**
 * Fired when the user dismisses an alert dialog (the cancel action, Escape, or a
 * close request). Cancelable — call `event.preventDefault()` to keep it open.
 *
 * Does not bubble and is not composed: listen on the element itself.
 */
export class CancelEvent extends Event {
  constructor() {
    super('cancel', { bubbles: false, composed: false, cancelable: true });
  }
}

/**
 * An interruptive confirmation dialog built on `<l-dialog>`. Renders its own
 * cancel/confirm actions and exposes `role="alertdialog"`. Use it to confirm a
 * consequential action (delete, publish, discard) — not for generic content.
 *
 * Open and close by toggling the `open` property (or the `--show` / `--hide`
 * Invoker commands). The dialog closes automatically when the user picks an
 * action, unless the matching `confirm` / `cancel` event is canceled.
 *
 * @slot - Description text. Provides the dialog's accessible description.
 * @slot title - Custom heading element. Overrides the default `<h2>` rendered from the `title` property. Also provides the dialog's accessible name.
 * @slot cancel - Replaces the built-in cancel action (e.g. a link). Keep it focusable.
 * @slot confirm - Replaces the built-in confirm action.
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart header - The header wrapper containing the title.
 * @csspart title - The dialog title heading.
 * @csspart body - The body wrapper around the description.
 * @csspart footer - The footer wrapper around the actions.
 * @csspart button - Both built-in action buttons.
 * @csspart cancel - The built-in cancel button.
 * @csspart confirm - The built-in confirm button.
 *
 * @cssproperty [--width=31rem] - Dialog width.
 * @cssproperty [--border-radius=6px] - Dialog border radius.
 * @cssproperty [--padding=1.5rem] - Padding applied to the header, footer, and inline-padding of the body.
 * @cssproperty [--show-duration=200ms] - Open transition duration.
 * @cssproperty [--hide-duration=200ms] - Close transition duration.
 * @cssproperty --backdrop - Backdrop color.
 * @cssproperty [--backdrop-blur=0] - Backdrop blur amount (any CSS length).
 *
 * @event confirm - Fired when the user accepts. Cancelable — `preventDefault()` keeps it open for async work.
 * @event cancel - Fired when the user dismisses (cancel action, Escape). Cancelable — `preventDefault()` keeps it open.
 * @event show - Fired when the dialog is about to open. Cancelable.
 * @event hide - Fired when the dialog is about to close via the `open` property. Cancelable. (The confirm, cancel, and Escape paths close natively and emit `confirm`/`cancel` instead of `hide`.)
 * @event after-show - Fired after the open animation completes. Not cancelable.
 * @event after-hide - Fired after the close animation completes. Not cancelable.
 *
 * @command --show - Sets `open = true`.
 * @command --hide - Sets `open = false`.
 *
 * @customElement l-alert-dialog
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below.
export class AlertDialog extends Dialog {
  static override styles = [hostStyles, dialogStyles, buttonStyles, alertStyles];

  /** Label for the confirm action. */
  @property({ attribute: 'confirm-text' })
  confirmText = 'Confirm';

  /** Label for the cancel action. */
  @property({ attribute: 'cancel-text' })
  cancelText = 'Cancel';

  /** Visual tone. `danger` renders the confirm action as destructive. */
  @property({ reflect: true })
  tone?: 'danger';

  /** Show a busy state on the confirm action (spinner + `aria-disabled`); the
   *  cancel action stays operable as an escape hatch. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  protected override get _role() {
    return 'alertdialog';
  }

  // Wire aria-describedby to the body only when it actually has content, so a
  // title-only confirmation doesn't advertise an empty description.
  private _bodyContent = new HasSlotController(this, '[default]');
  protected override get _bodyId() {
    return this._bodyContent.test('[default]') ? 'description' : '';
  }

  // Alert dialogs are interruptive: they are never dismissable by clicking
  // outside, so the inherited `light-dismiss` is forced off (a vetoed dismissal
  // gesture must go through an explicit action).
  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (this.lightDismiss) this.lightDismiss = false;
  }

  // Native Escape / close request → cancel intent. A vetoed `cancel` keeps the
  // dialog open; otherwise the native close proceeds (emitting `after-hide`).
  protected override _onCancel(e: Event) {
    if (!this.dispatchEvent(new CancelEvent())) e.preventDefault();
  }

  // Focus the least destructive action on open: an author `[autofocus]`, else
  // the slotted cancel action, else the built-in cancel button (in shadow DOM,
  // so the base light-DOM lookup can't reach it). Try each in order and keep the
  // first that actually takes focus — this skips a non-focusable slotted cancel
  // without rejecting a focusable one that reports `tabIndex === -1` (a custom
  // element with `delegatesFocus`, `<div role="button" tabindex="0">`, etc.).
  protected override _focusInitial() {
    const candidates = [
      this.querySelector<HTMLElement>('[autofocus]'),
      this.querySelector<HTMLElement>('[slot="cancel"]'),
      this.renderRoot.querySelector<HTMLElement>('[data-cancel]'),
    ];
    for (const el of candidates) {
      if (!el || el.matches('[disabled], [aria-disabled="true"]')) continue;
      el.focus({ preventScroll: true });
      // `document.activeElement` resolves to the shadow host when focus lands
      // inside an open shadow root, so this also covers delegatesFocus.
      if (el === document.activeElement || el.contains(document.activeElement)) return;
    }
  }

  private _close() {
    // Close natively rather than via `open = false` so we don't also emit the
    // inherited cancelable `hide` — `confirm` / `cancel` are the intent events.
    if (this.dialog.open) this.dialog.close();
  }

  // Activate an action unless its control is disabled. The built-in confirm also
  // respects `loading` via the property — immune to render timing, so a fast
  // second click in the window before `aria-disabled` is flushed can't fire a
  // duplicate confirm mid-async. A slotted action the consumer drives carries no
  // disabled state unless the author adds one, so it stays operable.
  private _activate(el: Element, event: ConfirmEvent | CancelEvent) {
    if (el.hasAttribute('data-confirm') && this.loading) return;
    if (el.matches('[disabled], [aria-disabled="true"]')) return;
    if (this.dispatchEvent(event)) this._close();
  }

  // Single delegated handler covering both the built-in buttons (marked with
  // `data-confirm` / `data-cancel`) and slotted replacements (`slot="confirm"` /
  // `slot="cancel"`). `composedPath()` flattens across the slot boundary, so a
  // click on light-DOM slotted content still resolves here.
  private _onFooterClick = (e: Event) => {
    for (const node of e.composedPath()) {
      if (node === e.currentTarget) break;
      if (!(node instanceof Element)) continue;
      if (node.matches('[slot="confirm"], [data-confirm]'))
        return this._activate(node, new ConfirmEvent());
      if (node.matches('[slot="cancel"], [data-cancel]'))
        return this._activate(node, new CancelEvent());
    }
  };

  protected override renderFooter() {
    const confirmVariant = this.tone === 'danger' ? 'destructive' : 'primary';
    return html`
      <footer
        part="footer"
        @click=${this._onFooterClick}
      >
        <slot name="cancel">
          <button
            part="button cancel"
            class="l-button"
            type="button"
            data-cancel
          >
            ${this.cancelText}
          </button>
        </slot>
        <slot name="confirm">
          <button
            part="button confirm"
            class="l-button"
            type="button"
            data-confirm
            data-variant=${confirmVariant}
            aria-disabled=${this.loading ? 'true' : nothing}
            aria-busy=${this.loading ? 'true' : nothing}
          >
            ${this.loading ? html`<l-spinner aria-hidden="true"></l-spinner>` : nothing}
            ${this.confirmText}
          </button>
        </slot>
      </footer>
    `;
  }
}

// `confirm` and `cancel` collide with lib.dom's event maps, so we cannot augment
// the global map (as the shared lifecycle events do). Declaration-merge typed
// listener overloads onto the element instead — must come after the class so the
// CEM analyzer reads the class first.
export interface AlertDialog {
  addEventListener(
    type: 'confirm',
    listener: (this: AlertDialog, ev: ConfirmEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'cancel',
    listener: (this: AlertDialog, ev: CancelEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'confirm',
    listener: (this: AlertDialog, ev: ConfirmEvent) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'cancel',
    listener: (this: AlertDialog, ev: CancelEvent) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
