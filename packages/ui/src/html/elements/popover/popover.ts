import { html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { property } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import { PopoverController } from '../../shared/controllers/popover.js';
import { uniqueId } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './popover.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * @summary A popover that displays interactive content anchored to a trigger.
 * @customElement l-popover
 *
 * @slot - Popover content.
 *
 * @csspart body - The popover container.
 * @csspart arrow - The directional arrow element.
 *
 * @cssproperty --background - Background color. Default: `Canvas`.
 * @cssproperty --color - Text color. Default: inherited.
 * @cssproperty --border-radius - Border radius. Default `8px`.
 * @cssproperty --max-width - Maximum width. Default `320px`.
 * @cssproperty --shadow - Box shadow.
 * @cssproperty --arrow-size - Arrow size. Default `8px`.
 * @cssproperty --show-duration - Show animation duration. Default `150ms`.
 * @cssproperty --hide-duration - Hide animation duration. Default `150ms`.
 */
export class Popover extends LuxenElement {
  static override styles = [hostStyles, styles];

  private _popoverId = uniqueId('popover');

  private _floating = new PopoverController(this, {
    getTriggerElement: () => this._trigger,
    getFloatingElement: () => this._popoverEl,
    getArrowElement: () => this._arrowEl,
    onPlacementChange: (p) => {
      this.dataset.placement = p;
    },
  });

  /** The HTML id of the element triggering the popover. */
  @property()
  accessor for = '';

  /** The preferred placement of the popover. */
  @property()
  accessor placement: Placement = 'bottom';

  /** The distance in pixels from the target element. */
  @property({ type: Number })
  accessor distance = 8;

  /** Whether or not the popover is visible. */
  @property({ type: Boolean, reflect: true })
  accessor open = false;

  /** Hide the directional arrow. */
  @property({ type: Boolean, reflect: true, attribute: 'without-arrow' })
  accessor withoutArrow = false;

  /** Stretch the popover to the viewport width. Useful for mega menus. */
  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  accessor fullWidth = false;

  /** Space-separated list of trigger modes: `click`, `hover`, `focus`, `manual`. */
  @property()
  accessor trigger = 'click';

  private _hasTrigger(type: string) {
    return this.trigger.split(' ').includes(type);
  }

  private get _trigger(): HTMLElement | null {
    return this.for ? (this.getRootNode() as Document | ShadowRoot).getElementById(this.for) : null;
  }

  private get _popoverEl(): HTMLElement {
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
    const popover = this._popoverEl;
    if (!popover) return;

    const posOpts = {
      placement: this.placement,
      distance: this.distance,
      fullWidth: this.fullWidth,
    };

    if (this.open) {
      popover.showPopover();
      await this._floating.updatePosition(posOpts);
      if (!this.open) return;
      await this._floating.animateShow(popover, this._getDuration('--show-duration'));
      this._floating.startPositioning(posOpts);
      this._trigger?.setAttribute('aria-expanded', 'true');
      // No aria-controls: the panel's id lives in this element's shadow root and
      // IDREFs don't cross shadow boundaries, so the reference would never
      // resolve (invalid per WCAG 4.1.2). aria-expanded alone conveys the state.
    } else {
      this._floating.stopPositioning();
      this._floating.cleanupSafePolygon();
      this._trigger?.setAttribute('aria-expanded', 'false');
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

  /** Sync `open` when popover="auto" light-dismiss fires. */
  private _onToggle = (e: Event) => {
    const toggleEvent = e as ToggleEvent;
    if (toggleEvent.newState === 'closed' && this.open) {
      this.open = false;
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
        id=${this._popoverId}
        popover="auto"
        part="body"
        @toggle=${this._onToggle}
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
