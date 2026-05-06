import { html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element';
import { property } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import { PopoverController } from '../../shared/controllers/popover';
import { uniqueId } from '../../registry';
import hostStyles from '../../shared/styles/host.styles';
import rawStyles from './tooltip.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * @summary A tooltip that displays contextual text on hover or focus.
 * @customElement l-tooltip
 *
 * @slot - Tooltip content (text or rich HTML).
 *
 * @csspart body - The tooltip popover container.
 * @csspart arrow - The directional arrow element.
 *
 * @cssproperty --background-color - Background color. Default: dark in light mode, light in dark mode.
 * @cssproperty --text-color - Text color. If unset, auto-derived from `--background-color` luminance.
 * @cssproperty --border-radius - Border radius. Default `4px`.
 * @cssproperty --max-width - Maximum width. Default `180px`.
 * @cssproperty --arrow-size - Arrow size. Default `6px`.
 * @cssproperty --show-duration - Show animation duration. Default `150ms`.
 * @cssproperty --hide-duration - Hide animation duration. Default `150ms`.
 */
export class Tooltip extends LuxenElement {
  static override styles = [hostStyles, styles];

  private _tooltipId = uniqueId('tooltip');

  private _floating = new PopoverController(this, {
    getTriggerElement: () => this._trigger,
    getFloatingElement: () => this._popover,
    getArrowElement: () => this._arrowEl,
  });

  /** The HTML id of the element triggering the tooltip. */
  @property()
  accessor for = '';

  /** The preferred placement of the tooltip. */
  @property()
  accessor placement: Placement = 'top';

  /** The distance in pixels from the target element. */
  @property({ type: Number })
  accessor distance = 8;

  /** Whether or not the tooltip is visible. */
  @property({ type: Boolean, reflect: true })
  accessor open = false;

  /** Hide the directional arrow. */
  @property({ type: Boolean, reflect: true, attribute: 'without-arrow' })
  accessor withoutArrow = false;

  /** Space-separated list of trigger modes: `hover`, `focus`, `click`, `manual`. */
  @property()
  accessor trigger = 'hover focus';

  private _hasTrigger(type: string) {
    return this.trigger.split(' ').includes(type);
  }

  private get _trigger(): HTMLElement | null {
    return this.for ? (this.getRootNode() as Document | ShadowRoot).getElementById(this.for) : null;
  }

  private get _popover(): HTMLElement {
    return this.shadowRoot!.querySelector('[popover]')!;
  }

  private get _arrowEl(): HTMLElement | null {
    return this.withoutArrow ? null : this.shadowRoot!.querySelector('i');
  }

  private _getDuration(prop: '--show-duration' | '--hide-duration'): number {
    const parsed = parseFloat(getComputedStyle(this).getPropertyValue(prop));
    return Number.isNaN(parsed) ? 150 : parsed;
  }

  override connectedCallback() {
    super.connectedCallback();
    requestAnimationFrame(() => this._addTriggerListeners());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._removeTriggerListeners();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      void this._handleOpenChange();
    }
    if (changed.has('for')) {
      this._removeTriggerListeners(changed.get('for') as string);
      this._addTriggerListeners();
    }
  }

  show() {
    if (!this.open) this.open = true;
  }

  hide() {
    if (this.open) this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  private async _handleOpenChange() {
    const popover = this._popover;
    if (!popover) return;

    const posOpts = { placement: this.placement, distance: this.distance };

    if (this.open) {
      popover.showPopover();
      await this._floating.updatePosition(posOpts);
      if (!this.open) return;
      await this._floating.animateShow(popover, this._getDuration('--show-duration'));
      this._floating.startPositioning(posOpts);
      this._trigger?.setAttribute('aria-describedby', this._tooltipId);
    } else {
      this._floating.stopPositioning();
      this._floating.cleanupSafePolygon();
      this._trigger?.removeAttribute('aria-describedby');
      await this._floating.animateHide(popover, this._getDuration('--hide-duration'));
      if (popover.matches(':popover-open')) popover.hidePopover();
    }
  }

  // --- Trigger event handlers ---

  private _onPointerEnter = () => {
    if (!this._hasTrigger('hover')) return;
    this._floating.cleanupSafePolygon();
    this.show();
  };

  private _onPointerLeave = (e: PointerEvent) => {
    if (!this._hasTrigger('hover') || !this.open) return;
    this._floating.handlePointerLeave(e, () => this.hide());
  };

  private _onFocusIn = () => {
    if (this._hasTrigger('focus')) this.show();
  };
  private _onFocusOut = () => {
    if (this._hasTrigger('focus')) this.hide();
  };
  private _onClick = () => {
    if (this._hasTrigger('click')) this.toggle();
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    if (this.open && e.key === 'Escape') {
      e.stopPropagation();
      this.hide();
    }
  };

  private _addTriggerListeners() {
    this._floating.addTriggerListeners({
      onPointerEnter: this._onPointerEnter,
      onPointerLeave: this._onPointerLeave,
      onFocusIn: this._onFocusIn,
      onFocusOut: this._onFocusOut,
      onClick: this._onClick,
      onKeyDown: this._onKeyDown,
    });
  }

  private _removeTriggerListeners(forId?: string) {
    const trigger = forId
      ? (this.getRootNode() as Document | ShadowRoot).getElementById(forId)
      : undefined;
    this._floating.removeTriggerListeners(trigger);
  }

  override render() {
    return html`
      <div
        id=${this._tooltipId}
        popover="manual"
        role="tooltip"
        part="body"
      >
        ${this.withoutArrow
          ? nothing
          : html`
              <i
                part="arrow"
                role="presentation"
              ></i>
            `}
        <slot></slot>
      </div>
    `;
  }
}
