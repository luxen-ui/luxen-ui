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
    return this._triggerFor(this.for);
  }

  private _triggerFor(id: string): HTMLElement | null {
    if (!id) return null;
    // A detached popover's root is a plain element with no getElementById —
    // async open/close work may land after removal.
    const root = this.getRootNode();
    return root instanceof Document || root instanceof ShadowRoot ? root.getElementById(id) : null;
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
    // `aria-expanded` is dropped (not set to "false") by the controller's
    // hostDisconnected: with the panel gone the trigger expands nothing.
    this._removeTriggerListeners();
  }

  override updated(changed: PropertyValues<this>) {
    // `for` before `open`: retargeting an already-open panel has to settle
    // against the new anchor, and when both change in the same update the open
    // path owns the positioning outright (see the guard below).
    if (changed.has('for')) {
      this._removeTriggerListeners(changed.get('for') as string);
      this._addTriggerListeners();
      if (this.open && !changed.has('open')) {
        void this._repositionToTrigger();
      }
    }
    if (changed.has('open')) {
      void this._handleOpenChange();
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

  /**
   * Recompute the position against the current trigger. Use it when you move
   * the anchor yourself and the panel has to follow. No-op when closed; hides
   * if the anchor is gone.
   */
  async reposition() {
    if (!this.open) return;
    await this._repositionToTrigger();
  }

  /**
   * Move the open panel onto whatever `for` names now — a move, not a re-open,
   * so it deliberately bypasses `_handleOpenChange` and its show animation.
   * Shared by the public `reposition()` and the retarget path so the two
   * cannot drift apart.
   */
  private async _repositionToTrigger() {
    this._floating.cleanupSafePolygon();
    const openFor = this.for;
    const result = await this._floating.reposition(
      this._positionOptions(),
      () => this.open && this.for === openFor,
    );
    // Closed or retargeted again while `computePosition` was in flight.
    if (result === 'stale') return;
    // Retargeted onto an id that resolves to nothing: a panel left floating
    // over unrelated content is worse than none.
    if (result === 'no-anchor') {
      this.hide();
      return;
    }
    this._floating.markTrigger('aria-expanded', 'true', 'false');
  }

  private _positionOptions() {
    return {
      placement: this.placement,
      distance: this.distance,
      fullWidth: this.fullWidth,
    };
  }

  private async _handleOpenChange() {
    const popover = this._popoverEl;
    if (!popover) return;

    const posOpts = this._positionOptions();

    if (this.open) {
      popover.showPopover();
      await this._floating.updatePosition(posOpts);
      if (!this.open) return;
      await this._floating.animateShow(popover, this._getDuration('--show-duration'));
      this._floating.startPositioning(posOpts);
      this._floating.markTrigger('aria-expanded', 'true', 'false');
      // No aria-controls: the panel's id lives in this element's shadow root and
      // IDREFs don't cross shadow boundaries, so the reference would never
      // resolve (invalid per WCAG 4.1.2). aria-expanded alone conveys the state.
    } else {
      this._floating.stopPositioning();
      this._floating.cleanupSafePolygon();
      this._floating.releaseTrigger('false');
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
    this._floating.removeTriggerListeners(forId ? this._triggerFor(forId) : undefined);
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
