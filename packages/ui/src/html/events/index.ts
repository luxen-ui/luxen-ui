/**
 * Shared lifecycle event classes emitted by Luxen overlay elements.
 *
 * Event names are unprefixed and brand-neutral (white-label by construction).
 * Each class bakes its name and `bubbles`/`composed`/`cancelable` flags into
 * the constructor, and augments `GlobalEventHandlersEventMap` so listeners are
 * typed without a cast. Discriminate with `instanceof` (e.g.
 * `e instanceof HideEvent`) rather than the event name alone.
 */
export { ShowEvent } from './show.js';
export { AfterShowEvent } from './after-show.js';
export { HideEvent } from './hide.js';
export { AfterHideEvent } from './after-hide.js';
