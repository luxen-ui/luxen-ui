import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  size,
  type Placement,
} from '@floating-ui/dom';

// --- Pure geometry helpers ---

type Point = [number, number];

/** Check if a point is inside a polygon using ray-casting. */
function isPointInPolygon([px, py]: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi >= py !== yj >= py && px <= ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Check if a point is inside a rect. */
function isPointInRect([px, py]: Point, rect: DOMRect) {
  return px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
}

/**
 * Build a safe polygon (triangle/quadrilateral) from cursor to floating element edges.
 * Adapted from floating-ui/safePolygon.
 * @see https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/safePolygon.ts
 */
function getSafePolygon(
  cursorX: number,
  cursorY: number,
  rect: DOMRect,
  refRect: DOMRect,
  placement: string,
): Point[] {
  const side = placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
  const buffer = 2;

  const isFloatingWider = rect.width > refRect.width;
  const isFloatingTaller = rect.height > refRect.height;

  const cursorLeaveFromRight = cursorX > rect.right - rect.width / 2;
  const cursorLeaveFromBottom = cursorY > rect.bottom - rect.height / 2;

  switch (side) {
    case 'top': {
      const c1: Point = [
        isFloatingWider
          ? cursorX + buffer / 2
          : cursorLeaveFromRight
            ? cursorX + buffer * 4
            : cursorX - buffer * 4,
        cursorY + buffer + 1,
      ];
      const c2: Point = [
        isFloatingWider
          ? cursorX - buffer / 2
          : cursorLeaveFromRight
            ? cursorX + buffer * 4
            : cursorX - buffer * 4,
        cursorY + buffer + 1,
      ];
      return [
        c1,
        c2,
        [
          rect.left,
          cursorLeaveFromRight
            ? rect.bottom - buffer
            : isFloatingWider
              ? rect.bottom - buffer
              : rect.top,
        ],
        [
          rect.right,
          cursorLeaveFromRight
            ? isFloatingWider
              ? rect.bottom - buffer
              : rect.top
            : rect.bottom - buffer,
        ],
      ];
    }
    case 'bottom': {
      const c1: Point = [
        isFloatingWider
          ? cursorX + buffer / 2
          : cursorLeaveFromRight
            ? cursorX + buffer * 4
            : cursorX - buffer * 4,
        cursorY - buffer,
      ];
      const c2: Point = [
        isFloatingWider
          ? cursorX - buffer / 2
          : cursorLeaveFromRight
            ? cursorX + buffer * 4
            : cursorX - buffer * 4,
        cursorY - buffer,
      ];
      return [
        c1,
        c2,
        [
          rect.left,
          cursorLeaveFromRight
            ? rect.top + buffer
            : isFloatingWider
              ? rect.top + buffer
              : rect.bottom,
        ],
        [
          rect.right,
          cursorLeaveFromRight
            ? isFloatingWider
              ? rect.top + buffer
              : rect.bottom
            : rect.top + buffer,
        ],
      ];
    }
    case 'left': {
      const c1: Point = [
        cursorX + buffer + 1,
        isFloatingTaller
          ? cursorY + buffer / 2
          : cursorLeaveFromBottom
            ? cursorY + buffer * 4
            : cursorY - buffer * 4,
      ];
      const c2: Point = [
        cursorX + buffer + 1,
        isFloatingTaller
          ? cursorY - buffer / 2
          : cursorLeaveFromBottom
            ? cursorY + buffer * 4
            : cursorY - buffer * 4,
      ];
      return [
        [
          cursorLeaveFromBottom
            ? rect.right - buffer
            : isFloatingTaller
              ? rect.right - buffer
              : rect.left,
          rect.top,
        ],
        [
          cursorLeaveFromBottom
            ? isFloatingTaller
              ? rect.right - buffer
              : rect.left
            : rect.right - buffer,
          rect.bottom,
        ],
        c1,
        c2,
      ];
    }
    case 'right': {
      const c1: Point = [
        cursorX - buffer,
        isFloatingTaller
          ? cursorY + buffer / 2
          : cursorLeaveFromBottom
            ? cursorY + buffer * 4
            : cursorY - buffer * 4,
      ];
      const c2: Point = [
        cursorX - buffer,
        isFloatingTaller
          ? cursorY - buffer / 2
          : cursorLeaveFromBottom
            ? cursorY + buffer * 4
            : cursorY - buffer * 4,
      ];
      return [
        [
          cursorLeaveFromBottom
            ? rect.left + buffer
            : isFloatingTaller
              ? rect.left + buffer
              : rect.right,
          rect.top,
        ],
        [
          cursorLeaveFromBottom
            ? isFloatingTaller
              ? rect.left + buffer
              : rect.right
            : rect.left + buffer,
          rect.bottom,
        ],
        c1,
        c2,
      ];
    }
    default:
      return [];
  }
}

// --- Constants ---

const STATIC_SIDE = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' } as const;

const reducedMotion =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined;

// --- Controller ---

export interface PopoverControllerConfig {
  getTriggerElement: () => HTMLElement | null;
  getFloatingElement: () => HTMLElement | null;
  getArrowElement: () => HTMLElement | null;
  onPlacementChange?: (placement: string) => void;
}

export interface PositionOptions {
  placement: Placement;
  distance: number;
  fullWidth?: boolean;
  /** Floor the floating element's width at the trigger's width (`'trigger'`). */
  minWidth?: 'trigger';
}

type TriggerHandlers = {
  onPointerEnter?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
  onFocusIn?: (e: FocusEvent) => void;
  onFocusOut?: (e: FocusEvent) => void;
  onClick?: (e: MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
};

export class PopoverController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _config: PopoverControllerConfig;
  private _cleanupAutoUpdate?: () => void;
  private _cleanupSafePolygon?: () => void;
  private _handlers?: TriggerHandlers;
  private _triggerElement?: HTMLElement | null;
  private _currentPlacement = '';

  constructor(host: ReactiveControllerHost & HTMLElement, config: PopoverControllerConfig) {
    this._host = host;
    this._config = config;
    host.addController(this);
  }

  hostConnected() {}

  hostDisconnected() {
    this.stopPositioning();
    this.cleanupSafePolygon();
    this.removeTriggerListeners();
  }

  get currentPlacement() {
    return this._currentPlacement;
  }

  // --- Positioning ---

  async updatePosition(options: PositionOptions) {
    const trigger = this._config.getTriggerElement();
    const floating = this._config.getFloatingElement();
    const arrowEl = this._config.getArrowElement();
    if (!trigger || !floating) return;

    const middleware = [
      offset(options.distance),
      // Size before flip/shift so the adopted floor feeds collision detection.
      ...(options.minWidth === 'trigger'
        ? [
            size({
              apply({ rects, elements }) {
                elements.floating.style.minWidth = `${rects.reference.width}px`;
              },
            }),
          ]
        : []),
      flip(),
      shift(),
      ...(arrowEl ? [arrow({ element: arrowEl, padding: 8 })] : []),
    ];

    const { x, y, placement, middlewareData } = await computePosition(trigger, floating, {
      placement: options.placement,
      strategy: 'fixed',
      middleware,
    });

    Object.assign(floating.style, {
      position: 'fixed',
      left: options.fullWidth ? '0px' : `${x}px`,
      top: `${y}px`,
      width: options.fullWidth ? '100vw' : '',
    });

    // The `size` middleware (above) sets minWidth when syncing; clear it otherwise.
    if (options.minWidth !== 'trigger') floating.style.minWidth = '';

    if (placement !== this._currentPlacement) {
      this._currentPlacement = placement;
      this._config.onPlacementChange?.(placement);
    }

    if (middlewareData.arrow && arrowEl) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const side = STATIC_SIDE[placement.split('-')[0] as keyof typeof STATIC_SIDE];
      Object.assign(arrowEl.style, {
        left: ax != null ? `${ax}px` : '',
        top: ay != null ? `${ay}px` : '',
        [side]: `${-arrowEl.offsetWidth / 2}px`,
      });
    }
  }

  startPositioning(options: PositionOptions) {
    const trigger = this._config.getTriggerElement();
    const floating = this._config.getFloatingElement();
    if (!trigger || !floating) return;

    this._cleanupAutoUpdate?.();
    this._cleanupAutoUpdate = autoUpdate(trigger, floating, () => this.updatePosition(options));
  }

  stopPositioning() {
    this._cleanupAutoUpdate?.();
    this._cleanupAutoUpdate = undefined;
  }

  // --- Safe polygon ---

  handlePointerLeave(e: PointerEvent, onHide: () => void) {
    const floating = this._config.getFloatingElement();
    const trigger = this._config.getTriggerElement();
    if (!floating || !trigger) {
      onHide();
      return;
    }

    const cursorX = e.clientX;
    const cursorY = e.clientY;

    const onMove = (moveEvent: PointerEvent) => {
      const { clientX: mx, clientY: my } = moveEvent;
      const cursor: Point = [mx, my];
      const rect = floating.getBoundingClientRect();
      const refRect = trigger.getBoundingClientRect();
      const side = this._currentPlacement.split('-')[0];

      if (isPointInRect(cursor, rect)) return;
      if (isPointInRect(cursor, refRect)) return;

      if (
        (side === 'top' && cursorY >= refRect.bottom - 1) ||
        (side === 'bottom' && cursorY <= refRect.top + 1) ||
        (side === 'left' && cursorX >= refRect.right - 1) ||
        (side === 'right' && cursorX <= refRect.left + 1)
      ) {
        cleanup();
        onHide();
        return;
      }

      const polygon = getSafePolygon(cursorX, cursorY, rect, refRect, this._currentPlacement);
      if (isPointInPolygon(cursor, polygon)) return;

      cleanup();
      onHide();
    };

    const cleanup = () => {
      document.removeEventListener('pointermove', onMove);
    };

    document.addEventListener('pointermove', onMove);

    this._cleanupSafePolygon?.();
    this._cleanupSafePolygon = cleanup;
  }

  cleanupSafePolygon() {
    this._cleanupSafePolygon?.();
    this._cleanupSafePolygon = undefined;
  }

  // --- Trigger listener management ---

  addTriggerListeners(handlers: TriggerHandlers) {
    const trigger = this._config.getTriggerElement();
    if (!trigger) return;

    this._handlers = handlers;
    this._triggerElement = trigger;

    if (handlers.onPointerEnter)
      trigger.addEventListener('pointerenter', handlers.onPointerEnter as EventListener);
    if (handlers.onPointerLeave)
      trigger.addEventListener('pointerleave', handlers.onPointerLeave as EventListener);
    if (handlers.onFocusIn)
      trigger.addEventListener('focusin', handlers.onFocusIn as EventListener);
    if (handlers.onFocusOut)
      trigger.addEventListener('focusout', handlers.onFocusOut as EventListener);
    if (handlers.onClick) trigger.addEventListener('click', handlers.onClick as EventListener);
    if (handlers.onKeyDown)
      trigger.addEventListener('keydown', handlers.onKeyDown as EventListener);
  }

  removeTriggerListeners(triggerOverride?: HTMLElement | null) {
    const trigger = triggerOverride ?? this._triggerElement;
    const handlers = this._handlers;
    if (!trigger || !handlers) return;

    if (handlers.onPointerEnter)
      trigger.removeEventListener('pointerenter', handlers.onPointerEnter as EventListener);
    if (handlers.onPointerLeave)
      trigger.removeEventListener('pointerleave', handlers.onPointerLeave as EventListener);
    if (handlers.onFocusIn)
      trigger.removeEventListener('focusin', handlers.onFocusIn as EventListener);
    if (handlers.onFocusOut)
      trigger.removeEventListener('focusout', handlers.onFocusOut as EventListener);
    if (handlers.onClick) trigger.removeEventListener('click', handlers.onClick as EventListener);
    if (handlers.onKeyDown)
      trigger.removeEventListener('keydown', handlers.onKeyDown as EventListener);

    if (!triggerOverride) {
      this._handlers = undefined;
      this._triggerElement = undefined;
    }
  }

  // --- Animation ---

  async animateShow(el: HTMLElement, duration: number, keyframes?: Keyframe[]) {
    const d = reducedMotion?.matches ? 0 : duration;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      keyframes ?? [
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1 },
      ],
      { duration: d, fill: 'forwards' },
    );
  }

  async animateHide(el: HTMLElement, duration: number, keyframes?: Keyframe[]) {
    const d = reducedMotion?.matches ? 0 : duration;
    const anim = el.animate(
      keyframes ?? [
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 0.96 },
      ],
      { duration: d, fill: 'forwards' },
    );
    await anim.finished;
  }
}
