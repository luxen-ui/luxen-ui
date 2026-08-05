import 'iconify-icon';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { LocalizeController } from '../../shared/localize.js';
import { cls } from '../../registry.js';
import { HideEvent, AfterHideEvent } from '../../events/index.js';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

/** Default Iconify icon per variant (neutral falls back to the info glyph). */
const DEFAULT_ICONS: Record<string, string> = {
  neutral: 'lucide:info',
  info: 'lucide:info',
  success: 'lucide:circle-check',
  warning: 'lucide:triangle-alert',
  danger: 'lucide:octagon-alert',
};

/**
 * @summary A callout box that highlights contextual information with a semantic color and a leading icon.
 * @customElement l-alert
 *
 * @event hide - Emitted when a dismissible alert is about to close. Cancelable — call `event.preventDefault()` to keep it open.
 * @event after-hide - Emitted after the dismiss animation completes and the alert is removed from the DOM. Not cancelable.
 *
 * @cssproperty [--gap=0.75rem] - Gap between the icon, content, and close button.
 * @cssproperty [--padding=1rem] - Inner padding.
 * @cssproperty [--border-radius=8px] - Corner radius.
 *
 * @cssClass .l-alert-icon - The leading icon, colored by variant (auto-injected).
 * @cssClass .l-alert-content - Wrapper the authored children are moved into; stacks them vertically (auto-injected).
 * @cssClass .l-alert-title - Optional bold heading placed above the body content. Use a real heading element (e.g. `<h3 class="l-alert-title">`) when the alert is a section callout so it is reachable by heading navigation.
 *
 * @example
 * ```html
 * <l-alert variant="warning" dismissible>
 *   <span class="l-alert-title">Heads up</span>
 *   This action cannot be undone.
 * </l-alert>
 * ```
 */
export class Alert extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Semantic variant: `info`, `success`, `warning`, or `danger`. Default is neutral. */
  @property({ reflect: true })
  variant?: AlertVariant;

  /** Iconify icon name (e.g. `lucide:bell`) overriding the variant's default icon. */
  @property()
  icon?: string;

  /** Hide the leading icon entirely. */
  @property({ attribute: 'without-icon', type: Boolean })
  withoutIcon = false;

  /** Show a close button that dismisses the alert when clicked. */
  @property({ type: Boolean, reflect: true })
  dismissible = false;

  private _localize = new LocalizeController(this);
  private _dismissTimer?: ReturnType<typeof setTimeout>;
  // Re-home children the parser (upgrade-before-parse) or the consumer
  // (imperative `append`) adds directly to the host after a sync. Lit's
  // `updated()` only fires on reactive-property changes, so without this an
  // appended text-node body would escape `.l-alert-content`.
  private _observer = new MutationObserver(() => this._sync());

  override connectedCallback() {
    super.connectedCallback();
    this._sync();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
    if (this._dismissTimer) clearTimeout(this._dismissTimer);
  }

  override updated(_changed: PropertyValues<this>) {
    this._sync();
  }

  /** Idempotently reconcile the injected icon, content wrapper, and close button. */
  private _sync() {
    // Pause the observer so our own DOM moves below don't re-trigger it.
    this._observer.disconnect();
    this._syncIcon();
    this._syncContent();
    this._syncClose();
    if (this.isConnected) this._observer.observe(this, { childList: true });
  }

  private _iconName(): string | null {
    if (this.withoutIcon) return null;
    if (this.icon) return this.icon;
    return DEFAULT_ICONS[this.variant ?? 'neutral'];
  }

  private _syncIcon() {
    const iconClass = cls('alert-icon');
    let iconEl = this.querySelector<HTMLElement>(`:scope > .${iconClass}`);
    const name = this._iconName();

    if (!name) {
      iconEl?.remove();
      return;
    }

    if (!iconEl) {
      iconEl = document.createElement('iconify-icon');
      iconEl.className = iconClass;
      iconEl.setAttribute('aria-hidden', 'true');
      this.prepend(iconEl);
    } else if (this.firstElementChild !== iconEl) {
      this.prepend(iconEl);
    }

    if (iconEl.getAttribute('icon') !== name) iconEl.setAttribute('icon', name);
  }

  /**
   * Move the authored children into a `.l-alert-content` wrapper so they stack
   * as one column regardless of node type. A wrapper (rather than placing bare
   * children directly) is required because text nodes — a plain string body —
   * cannot be targeted by CSS, so they would otherwise escape the layout.
   */
  private _syncContent() {
    const contentClass = cls('alert-content');
    const iconClass = cls('alert-icon');
    const closeClass = cls('close');

    let content = this.querySelector<HTMLElement>(`:scope > .${contentClass}`);
    if (!content) {
      content = document.createElement('div');
      content.className = contentClass;
      this.append(content);
    }

    for (const node of Array.from(this.childNodes)) {
      if (node === content) continue;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.classList.contains(iconClass) || el.classList.contains(closeClass)) continue;
      } else if (node.nodeType !== Node.TEXT_NODE) {
        // Leave comment/marker nodes in place — notably Lit's empty
        // ChildPart marker (`<!---->`) from the default light-DOM render.
        continue;
      }
      content.append(node);
    }
  }

  private _syncClose() {
    const closeClass = cls('close');
    let btn = this.querySelector<HTMLButtonElement>(`:scope > .${closeClass}[data-alert-close]`);

    if (!this.dismissible) {
      btn?.remove();
      return;
    }

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = closeClass;
      btn.dataset.appearance = 'ring';
      btn.dataset.alertClose = '';
      btn.addEventListener('click', this._dismiss);
      this.append(btn);
    } else if (this.lastElementChild !== btn) {
      this.append(btn);
    }

    btn.setAttribute('aria-label', this._localize.term('close'));
  }

  private _dismiss = () => {
    // Ignore repeat activations (fast double-click / double AT activation)
    // once a dismissal is already animating out.
    if (this.hasAttribute('data-dismissing')) return;
    if (!this.dispatchEvent(new HideEvent())) return;
    // A `hide` listener may have removed the alert itself; don't animate a
    // node that is no longer in the document.
    if (this.isConnected) this._animateOut();
  };

  private _animateOut() {
    this.setAttribute('data-dismissing', '');

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      this.removeEventListener('transitionend', onEnd);
      if (this._dismissTimer) clearTimeout(this._dismissTimer);
      this.dispatchEvent(new AfterHideEvent());
      this.remove();
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== this) return;
      finish();
    };

    const duration = parseFloat(getComputedStyle(this).transitionDuration) * 1000;
    if (!duration) {
      finish();
      return;
    }

    this.addEventListener('transitionend', onEnd);
    // Fallback: hidden Preview tabs never fire `transitionend`. Tracked so
    // `disconnectedCallback` can cancel it if the alert is removed mid-animation.
    this._dismissTimer = setTimeout(finish, duration + 50);
  }
}
