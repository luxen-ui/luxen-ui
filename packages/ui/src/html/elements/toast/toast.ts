/* eslint-disable no-shadow -- the local `toast` HTMLElement intentionally
   shadows the module-level `toast()` export; renaming would touch ~50 lines
   without behavioral benefit. */
import { LuxenElement } from '../../shared/luxen-element';
import { property } from 'lit/decorators.js';
import { tagName, cls, uniqueId } from '../../registry';

declare global {
  interface Element {
    /** @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML */
    setHTML(input: string, options?: Record<string, unknown>): void;
  }
}

/** Minimal custom element for toast items — no render, no shadow DOM. */
export class ToastItem extends HTMLElement {}

interface ToastOptionsBase {
  /** Optional heading text displayed above the message. */
  heading?: string;
  /** Override the element's variant for this toast. */
  variant?: string;
  /** Override auto-dismiss duration (ms) for this toast. 0 = no auto-dismiss. */
  duration?: number;
  /** Iconify icon name (e.g. 'lucide:check'). Replaces the accent bar. */
  icon?: string;
  /** Show a countdown progress bar at the bottom. Default `false`. */
  timer?: boolean;
}

export type ToastOptions =
  | (ToastOptionsBase & { /** The message text to display. */ text: string; html?: never })
  | (ToastOptionsBase & {
      text?: never;
      /** HTML content (sanitized via the Sanitizer API). */ html: string;
    });

interface TimerState {
  remaining: number;
  startTime: number;
  timeoutId: number;
  paused: boolean;
}

/**
 * @summary A toast notification container that generates toast items internally.
 * @customElement l-toast
 *
 * @event show - Emitted when a toast begins to show. Cancelable.
 * @event after-show - Emitted after the show animation completes.
 * @event hide - Emitted when a toast begins to hide. Cancelable.
 * @event after-hide - Emitted after the hide animation completes and toast is removed.
 *
 * @cssproperty --gap - Gap between stacked toast items.
 * @cssproperty --width - Width of the toast stack.
 * @cssproperty --show-duration - Duration of the show animation.
 * @cssproperty --hide-duration - Duration of the hide animation.
 */
export class Toast extends LuxenElement {
  /** Use light DOM — no Shadow DOM. */
  override createRenderRoot() {
    return this;
  }

  /** Position of the toast stack on the screen. */
  @property({ reflect: true }) placement:
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end' = 'top-end';

  /** Default auto-dismiss delay in milliseconds. 0 disables auto-dismiss. */
  @property({ type: Number, reflect: true }) duration = 5000;

  /** Default variant for toast items: info, success, warning, danger. */
  @property({ reflect: true }) variant = '';

  private _timers = new WeakMap<HTMLElement, TimerState>();
  private _positionCache = new WeakMap<Element, DOMRect>();
  private _documentHidden = false;

  override connectedCallback() {
    super.connectedCallback();
    this.popover = 'manual';
    this.setAttribute('role', 'log');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-relevant', 'additions');

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
  }

  /** Create and show a toast notification. */
  toast(options: ToastOptions): HTMLElement {
    const { heading, variant = this.variant, duration = this.duration } = options;

    // Build toast DOM
    const uid = uniqueId('toast');
    const toast = document.createElement(tagName('toast-item'));
    if (variant) toast.setAttribute('variant', variant);
    toast.setAttribute('role', variant === 'danger' ? 'alert' : 'status');
    toast.setAttribute('aria-atomic', 'true');

    if (options.icon) {
      const icon = document.createElement('iconify-icon');
      icon.setAttribute('icon', options.icon);
      icon.setAttribute('width', '20');
      icon.setAttribute('height', '20');
      icon.setAttribute('aria-hidden', 'true');
      icon.className = cls('toast-icon');
      toast.appendChild(icon);
    } else {
      const accent = document.createElement('div');
      accent.className = cls('toast-accent');
      accent.setAttribute('aria-hidden', 'true');
      toast.appendChild(accent);
    }

    const content = document.createElement('div');
    content.className = cls('toast-content');

    const textWrap = document.createElement('div');

    if (heading) {
      const headingEl = document.createElement('div');
      headingEl.id = `${uid}-heading`;
      headingEl.className = `${cls('toast-heading')} font-medium`;
      headingEl.textContent = heading;
      textWrap.appendChild(headingEl);
      toast.setAttribute('aria-labelledby', `${uid}-heading`);
    }

    const messageEl = document.createElement('div');
    messageEl.id = `${uid}-message`;
    messageEl.className = cls('toast-message');
    if ('html' in options && options.html) {
      messageEl.setHTML(options.html);
    } else {
      messageEl.textContent = options.text ?? '';
    }
    textWrap.appendChild(messageEl);
    toast.setAttribute(heading ? 'aria-describedby' : 'aria-labelledby', `${uid}-message`);

    content.appendChild(textWrap);
    toast.appendChild(content);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = cls('close');
    closeBtn.setAttribute('data-appearance', 'ring');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => this._hideToast(toast));
    toast.appendChild(closeBtn);

    // Timer bar (opt-in)
    if (options.timer && duration > 0 && isFinite(duration)) {
      const timerBar = document.createElement('div');
      timerBar.className = cls('toast-timer');
      timerBar.setAttribute('aria-hidden', 'true');
      timerBar.style.setProperty('--_timer-duration', `${duration}ms`);
      toast.appendChild(timerBar);
    }

    // FLIP: capture existing positions
    this._capturePositions();

    // Insert into container
    if (this.placement.includes('bottom')) {
      this.appendChild(toast);
    } else {
      this.prepend(toast);
    }

    // Show popover if not already open
    if (!this.matches(':popover-open')) {
      this.showPopover();
    }

    // Dispatch show
    if (!this.emit('show', { cancelable: true, detail: { toast } })) {
      toast.remove();
      return toast;
    }

    // Trigger show animation on next frame
    requestAnimationFrame(() => {
      toast.setAttribute('showing', '');
      this._animatePositions();

      const onShown = (e: TransitionEvent) => {
        if (e.target !== toast) return;
        toast.removeEventListener('transitionend', onShown);
        this.emit('after-show', { detail: { toast } });
      };
      toast.addEventListener('transitionend', onShown);
    });

    // Auto-dismiss timer (0 or Infinity = persistent)
    if (duration > 0 && isFinite(duration)) {
      this._startTimer(toast, duration);
    }

    // Pause/resume timer on hover and focus
    toast.addEventListener('pointerenter', () => this._pauseTimer(toast));
    toast.addEventListener('pointerleave', () => this._resumeTimer(toast));
    toast.addEventListener('focusin', () => this._pauseTimer(toast));
    toast.addEventListener('focusout', () => this._resumeTimer(toast));

    // ── Swipe-to-dismiss ──────────────────────────────────────────────────────

    let swipeStart: { x: number; y: number } | null = null;
    let swiping = false;

    toast.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as Element).closest('button, a, [role="button"]')) return;
      swipeStart = { x: e.clientX, y: e.clientY };
      swiping = false;
      toast.setPointerCapture(e.pointerId);
      toast.style.transition = 'none';
    });

    // Only allow swiping away from the screen edge, never inward
    const clampDelta = (dx: number) =>
      this.placement.endsWith('-start')
        ? Math.min(dx, 0)
        : this.placement.endsWith('-end')
          ? Math.max(dx, 0)
          : dx;

    toast.addEventListener('pointermove', (e: PointerEvent) => {
      if (!swipeStart) return;
      const deltaX = clampDelta(e.clientX - swipeStart.x);
      const deltaY = e.clientY - swipeStart.y;

      const buffer = e.pointerType === 'touch' ? 10 : 2;
      if (!swiping && Math.abs(deltaX) < buffer) return;

      // If vertical movement dominates, cancel swipe tracking
      if (!swiping && Math.abs(deltaY) > Math.abs(deltaX)) {
        swipeStart = null;
        return;
      }

      swiping = true;
      this._pauseTimer(toast);
      toast.style.transform = `translateX(${deltaX}px)`;
      toast.style.opacity = `${1 - Math.abs(deltaX) / 300}`;
    });

    toast.addEventListener('pointerup', (e: PointerEvent) => {
      if (!swipeStart) return;
      const deltaX = clampDelta(e.clientX - swipeStart.x);
      swipeStart = null;
      toast.style.transition = '';

      if (swiping && Math.abs(deltaX) > 50) {
        const dir = deltaX > 0 ? 1 : -1;
        toast.style.transform = `translateX(${dir * 120}%)`;
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => this._hideToast(toast), { once: true });
      } else {
        toast.style.transform = '';
        toast.style.opacity = '';
        if (swiping) this._resumeTimer(toast);
      }
      swiping = false;
    });

    return toast;
  }

  // ── Timer management ──────────────────────────────────────────────────────────

  private _startTimer(toast: HTMLElement, duration: number) {
    const timeoutId = window.setTimeout(() => this._hideToast(toast), duration);
    this._timers.set(toast, {
      remaining: duration,
      startTime: performance.now(),
      timeoutId,
      paused: false,
    });
  }

  private _pauseTimer(toast: HTMLElement) {
    const timer = this._timers.get(toast);
    if (!timer || timer.paused) return;
    clearTimeout(timer.timeoutId);
    timer.remaining -= performance.now() - timer.startTime;
    timer.paused = true;

    // Use the Web Animations API to pause the countdown bar. CSS `animation-play-state`
    // cannot be used here because browsers defer style recalculations while the tab is
    // hidden, so the animation runs to completion before the style change takes effect.
    const timerBar = toast.querySelector(`.${cls('toast-timer')}`);
    if (timerBar) for (const anim of timerBar.getAnimations()) anim.pause();
  }

  private _resumeTimer(toast: HTMLElement) {
    const timer = this._timers.get(toast);
    if (!timer || !timer.paused || timer.remaining <= 0 || this._documentHidden) return;
    timer.startTime = performance.now();
    timer.timeoutId = window.setTimeout(() => this._hideToast(toast), timer.remaining);
    timer.paused = false;

    const timerBar = toast.querySelector(`.${cls('toast-timer')}`);
    if (timerBar) for (const anim of timerBar.getAnimations()) anim.play();
  }

  // ── Hide a toast ──────────────────────────────────────────────────────────────

  private _hideToast(toast: HTMLElement) {
    // Clear timer
    const timer = this._timers.get(toast);
    if (timer) {
      clearTimeout(timer.timeoutId);
      this._timers.delete(toast);
    }

    // Prevent double-hide
    if (!toast.hasAttribute('showing')) return;

    // Dispatch hide
    if (!this.emit('hide', { cancelable: true, detail: { toast } })) return;

    this._capturePositions();

    // Remove showing class to trigger exit transition
    toast.removeAttribute('showing');

    const remove = () => {
      toast.remove();
      this._animatePositions();

      this.emit('after-hide', { detail: { toast } });

      // Close popover if no toasts remain
      const remaining = this.querySelectorAll(`:scope > ${tagName('toast-item')}`);
      if (remaining.length === 0 && this.matches(':popover-open')) {
        this.hidePopover();
      }
    };

    // Handle zero-duration transitions (reduced motion)
    const duration = parseFloat(getComputedStyle(toast).transitionDuration);
    if (duration === 0) {
      remove();
    } else {
      const onEnd = (e: TransitionEvent) => {
        if (e.target !== toast) return;
        toast.removeEventListener('transitionend', onEnd);
        remove();
      };
      toast.addEventListener('transitionend', onEnd);
    }
  }

  // ── FLIP animation for reordering ─────────────────────────────────────────────

  private _capturePositions() {
    const items = this.querySelectorAll(`:scope > ${tagName('toast-item')}`);
    for (const child of items) {
      this._positionCache.set(child, child.getBoundingClientRect());
    }
  }

  private _animatePositions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = this.querySelectorAll(`:scope > ${tagName('toast-item')}`);
    for (const child of items) {
      const oldRect = this._positionCache.get(child);
      if (!oldRect) continue;

      const newRect = child.getBoundingClientRect();
      const deltaY = oldRect.top - newRect.top;

      if (Math.abs(deltaY) < 1) continue;

      (child as HTMLElement).animate(
        [{ transform: `translateY(${deltaY}px)` }, { transform: 'translateY(0)' }],
        { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    }
  }

  // ── Document visibility ──────────────────────────────────────────────────────

  private _onVisibilityChange = () => {
    this._documentHidden = document.hidden;
    const items = this.querySelectorAll<HTMLElement>(`:scope > ${tagName('toast-item')}`);
    if (document.hidden) {
      for (const item of items) this._pauseTimer(item);
    } else {
      for (const item of items) this._resumeTimer(item);
    }
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────────

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    if (!this.matches(':popover-open')) return;

    const last = this.querySelector<HTMLElement>(`:scope > ${tagName('toast-item')}:last-of-type`);
    if (last) {
      e.preventDefault();
      this._hideToast(last);
    }
  };
}

// ── Standalone function ───────────────────────────────────────────────────────

let _defaultInstance: Toast | null = null;

function _getDefault(): Toast {
  if (!_defaultInstance || !_defaultInstance.isConnected) {
    _defaultInstance =
      document.querySelector(tagName('toast')) ??
      (document.createElement(tagName('toast')) as Toast);
    if (!_defaultInstance.isConnected) {
      document.body.appendChild(_defaultInstance);
    }
  }
  return _defaultInstance;
}

/** Show a toast notification. Auto-creates `<l-toast>` if none exists in the DOM. */
export function toast(options: ToastOptions): HTMLElement {
  return _getDefault().toast(options);
}
