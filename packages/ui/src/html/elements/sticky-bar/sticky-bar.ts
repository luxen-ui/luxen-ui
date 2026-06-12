import { html, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { property } from 'lit/decorators.js';
import { ShowEvent, AfterShowEvent, HideEvent, AfterHideEvent } from '../../events/index.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './sticky-bar.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * @summary A bar docked to the viewport edge, revealed in the top layer when a referenced element scrolls out of view.
 * @customElement l-sticky-bar
 *
 * Uses the native `popover="manual"` attribute, so the bar paints in the
 * document's top layer. Pass `for="<id>"` to track an element; the bar
 * reveals when that element leaves the viewport (e.g. an Add-to-cart
 * button on a mobile product page). Omit `for` for a bar that stays
 * visible permanently (cookie banners, promo notices, environment
 * indicators).
 *
 * @slot - Bar content. Owns its own background, padding, and typography.
 *
 * @cssproperty --show-duration - Reveal animation duration. Default `200ms`.
 * @cssproperty --hide-duration - Dismiss animation duration. Default `200ms`.
 * @cssproperty --offset - Distance from the active edge. Default `0px`. Use to clear a sticky header when `placement="top"`.
 *
 * @event show - Fired before the bar reveals. Cancelable.
 * @event after-show - Fired after the reveal animation completes. Not cancelable.
 * @event hide - Fired before the bar hides. Cancelable.
 * @event after-hide - Fired after the hide animation completes. Not cancelable.
 */
export class StickyBar extends LuxenElement {
  static override styles = [hostStyles, styles];

  /** HTML id of the element to track. When that element leaves the viewport, the bar reveals. Omit for a permanently visible bar. */
  @property()
  accessor for = '';

  /** HTML id of the scrolling ancestor used as the IntersectionObserver root. Omit to use the viewport. Useful for nested scroll containers (CMS preview panes, modals). */
  @property()
  accessor root = '';

  /** Edge to dock against. */
  @property({ reflect: true })
  accessor placement: 'bottom' | 'top' = 'bottom';

  private _io?: IntersectionObserver;
  private _observed?: Element;

  override connectedCallback() {
    super.connectedCallback();
    this.popover = 'manual';
    this.addEventListener('toggle', this._onToggle);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('toggle', this._onToggle);
    this._teardownObserver();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('for') || changed.has('root')) {
      this._teardownObserver();
      if (this.for) {
        this._setupObserver();
      } else {
        // No target → permanent bar. Reveal once on mount.
        this._show();
      }
    }
  }

  private get _target(): HTMLElement | null {
    return this.for ? (this.getRootNode() as Document | ShadowRoot).getElementById(this.for) : null;
  }

  private _show() {
    if (this.matches(':popover-open')) return;
    if (this.dispatchEvent(new ShowEvent())) this.showPopover();
  }

  private _hide() {
    if (!this.matches(':popover-open')) return;
    if (this.dispatchEvent(new HideEvent())) this.hidePopover();
  }

  private _onToggle = (e: Event) => {
    const ev = e as ToggleEvent;
    this.dispatchEvent(ev.newState === 'open' ? new AfterShowEvent() : new AfterHideEvent());
  };

  private _setupObserver() {
    const target = this._target;
    if (!target) return;
    this._observed = target;
    const root = this.root
      ? (this.getRootNode() as Document | ShadowRoot).getElementById(this.root)
      : null;
    // Use the element's own realm so an iframe-hosted bar observes the iframe's viewport.
    const view = this.ownerDocument.defaultView ?? window;
    this._io = new view.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this._hide();
          else this._show();
        }
      },
      { root, threshold: 0 },
    );
    this._io.observe(target);
  }

  private _teardownObserver() {
    if (this._io && this._observed) {
      this._io.unobserve(this._observed);
    }
    this._io?.disconnect();
    this._io = undefined;
    this._observed = undefined;
  }

  override render() {
    return html`<slot></slot>`;
  }
}
