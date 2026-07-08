import { html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { property } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import { PopoverController } from '../../shared/controllers/popover.js';
import { uniqueId } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './tooltip.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * Module-level registry of connected tooltips. A tooltip behaves like a label,
 * not a dialog: at most one pointer/focus/click-triggered tooltip is visible at
 * a time. Without this, on a dense grid of small triggers the safe polygon of
 * the previous tooltip overlaps the neighbouring triggers and two (or more)
 * tooltips end up visible during a horizontal sweep. `trigger="manual"`
 * tooltips opt out: they never claim the active slot and are never evicted, so
 * programmatic multi-tooltip scenarios (annotations, coach marks) keep working.
 */
const tooltipInstances = new Set<Tooltip>();
let activeTooltip: Tooltip | null = null;

/**
 * @summary A tooltip that displays contextual text on hover or focus.
 * @customElement l-tooltip
 *
 * @slot - Tooltip content (text or rich HTML).
 *
 * @csspart body - The tooltip popover container.
 * @csspart arrow - The directional arrow element.
 *
 * @cssproperty --background-color - Background color for this tooltip instance. Defaults to the global `--l-tooltip-background-color` token (a neutral inverse surface, dark in light mode / light in dark mode) — override that token to re-skin every tooltip at once.
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
  @property({ reflect: true })
  accessor for = '';

  /** The preferred placement of the tooltip. */
  @property()
  accessor placement: Placement = 'top';

  /** The distance in pixels from the target element. */
  @property({ type: Number })
  accessor distance = 8;

  /**
   * Milliseconds the pointer must dwell on the trigger before the tooltip
   * shows. Applies to `hover` only — focus shows immediately.
   */
  @property({ type: Number, attribute: 'show-delay' })
  accessor showDelay = 0;

  /**
   * Milliseconds to wait after the pointer leaves the trigger (and its safe
   * polygon) before hiding. Bridges a brief exit-and-return without flicker.
   * Applies to `hover` only.
   */
  @property({ type: Number, attribute: 'hide-delay' })
  accessor hideDelay = 0;

  private _showTimer?: ReturnType<typeof setTimeout>;
  private _hideTimer?: ReturnType<typeof setTimeout>;

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
    if (!this.for) return null;
    // A detached tooltip's root is a plain element with no getElementById —
    // async open/close work (e.g. an eviction) may land after removal.
    const root = this.getRootNode();
    return root instanceof Document || root instanceof ShadowRoot
      ? root.getElementById(this.for)
      : null;
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
    tooltipInstances.add(this);
    requestAnimationFrame(() => this._addTriggerListeners());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    tooltipInstances.delete(this);
    if (activeTooltip === this) activeTooltip = null;
    this._clearTimers();
    this._removeTriggerListeners();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      void this._handleOpenChange();
    }
    if (changed.has('for')) {
      // A queued show/hide targets the old trigger — drop it before rewiring.
      this._clearTimers();
      this._removeTriggerListeners(changed.get('for') as string);
      this._addTriggerListeners();
    }
  }

  /** Cancel any pending delayed show/hide (trigger gone, `for` changed, disconnect). */
  private _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = undefined;
    this._hideTimer = undefined;
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
      // Single-open invariant: opening a non-manual tooltip evicts the current
      // one. The evicted tooltip's hide flows back through this method, which
      // also removes its safe-polygon `pointermove` listener.
      if (!this._hasTrigger('manual')) {
        if (activeTooltip && activeTooltip !== this) activeTooltip.hide();
        activeTooltip = this;
      }
      popover.showPopover();
      await this._floating.updatePosition(posOpts);
      if (!this.open) return;
      await this._floating.animateShow(popover, this._getDuration('--show-duration'));
      this._floating.startPositioning(posOpts);
      this._trigger?.setAttribute('aria-describedby', this._tooltipId);
    } else {
      if (activeTooltip === this) activeTooltip = null;
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
    // The safe polygon means "the pointer is travelling toward the bubble" —
    // provably false once the pointer enters another tooltip's trigger. Drop
    // our own stale polygon, and close every peer now: invalidating a peer's
    // polygon without hiding it leaves the peer stuck open, because its only
    // remaining close path was eviction when *this* tooltip opens — and with
    // `show-delay` that can be much later, or never if the pointer moves on
    // before the dwell elapses (a fast sweep across a button group).
    this._floating.cleanupSafePolygon();
    for (const tooltip of tooltipInstances) {
      if (tooltip === this || tooltip._hasTrigger('manual')) continue;
      tooltip._floating.cleanupSafePolygon();
      tooltip.hide();
    }
    // The pointer is back on the trigger: cancel a pending hide (exit-and-return).
    clearTimeout(this._hideTimer);
    this._hideTimer = undefined;
    if (this.showDelay > 0 && !this.open) {
      clearTimeout(this._showTimer);
      this._showTimer = setTimeout(() => this.show(), this.showDelay);
    } else {
      this.show();
    }
  };

  private _onPointerLeave = (e: PointerEvent) => {
    // Cancel a still-pending show — the pointer left before the dwell elapsed.
    clearTimeout(this._showTimer);
    this._showTimer = undefined;
    if (!this._hasTrigger('hover') || !this.open) return;
    // `exit` — the pointer actively moved off the trigger/bubble: honour
    // `hide-delay` so a brief exit-and-return doesn't flicker. `settled` — the
    // pointer left and sat motionless in the corridor: there is no in-flight
    // gesture to bridge, so hide at once (never stack the delay on top).
    this._floating.handlePointerLeave(e, (reason) => {
      if (reason === 'settled') this.hide();
      else this._scheduleHide();
    });
  };

  /** Hide now, or after `hide-delay` if set (cancellable by a pointer return). */
  private _scheduleHide() {
    if (this.hideDelay > 0) {
      clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => this.hide(), this.hideDelay);
    } else {
      this.hide();
    }
  }

  private _onFocusIn = () => {
    // Focus is a discrete affordance — show immediately, ignoring the dwell delay.
    if (this._hasTrigger('focus')) {
      clearTimeout(this._hideTimer);
      this._hideTimer = undefined;
      this.show();
    }
  };
  private _onFocusOut = () => {
    if (this._hasTrigger('focus')) {
      // A hover may have queued a show; blur must not resurrect it.
      clearTimeout(this._showTimer);
      this._showTimer = undefined;
      this.hide();
    }
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
