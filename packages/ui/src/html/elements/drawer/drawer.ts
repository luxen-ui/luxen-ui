import { unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import hostStyles from '../../shared/styles/host.styles.js';
import { Dialog } from '../dialog/dialog.js';
import dialogStyles from '../dialog/dialog.styles.js';
import rawDrawerStyles from './drawer.css?inline';

const drawerStyles = unsafeCSS(rawDrawerStyles);

/**
 * A drawer that slides in from a screen edge. Extends `<l-dialog>`.
 *
 * Open and close by toggling the `open` property (or the `--show` / `--hide`
 * Invoker commands). Always opens as modal.
 *
 * @slot - Body content.
 * @slot title - Custom heading element. Overrides the default `<h2>` rendered from the `title` property. Also provides the dialog's accessible name.
 * @slot close - Close button (typically `<button class="l-close">`).
 * @slot footer - Footer actions.
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart header - The header wrapper containing the title and close slot.
 * @csspart title - The drawer title heading.
 * @csspart body - The body wrapper around the default slot.
 * @csspart footer - The footer wrapper around the footer slot.
 *
 * @cssproperty --size - Drawer size on the axis perpendicular to its edge (width for `start`/`end`, height for `bottom`). Default `320px`.
 * @cssproperty --border-radius - Drawer border radius on the inner edges. Default `0.375rem`.
 * @cssproperty --show-duration - Open transition duration. Default `200ms`.
 * @cssproperty --hide-duration - Close transition duration. Default `200ms`.
 * @cssproperty --backdrop - Backdrop color.
 *
 * @event show - Fired when the drawer is about to open. Cancelable — call `event.preventDefault()` to keep it closed.
 * @event after-show - Fired after the open animation completes. Not cancelable.
 * @event hide - Fired when the drawer is about to close. Cancelable — call `event.preventDefault()` to keep it open.
 * @event after-hide - Fired after the close animation completes. Not cancelable.
 *
 * @command --show - Sets `open = true`.
 * @command --hide - Sets `open = false`.
 *
 * @customElement l-drawer
 */
export class Drawer extends Dialog {
  static override styles = [hostStyles, dialogStyles, drawerStyles];

  // Edge-attached: opt out of the centered modal's stable scrollbar gutter,
  // which would otherwise push the drawer off the actual viewport edge.
  protected override _modalKind = 'edge' as const;

  /** Edge the drawer slides in from. Defaults to the start (inline-start) edge. */
  @property({ reflect: true })
  placement?: 'start' | 'end' | 'bottom';
}
