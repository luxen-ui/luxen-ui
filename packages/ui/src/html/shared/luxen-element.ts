import { LitElement } from 'lit';

/**
 * Base class for all Luxen custom elements.
 * Extends LitElement with shared utilities.
 *
 * Events are dispatched as typed `Event` subclasses (see `../events/` and the
 * per-element event classes), not via a generic `emit()` helper —
 * `dispatchEvent(new HideEvent())` returns `false` when a cancelable event was
 * prevented, which is all the call sites need.
 */
export class LuxenElement extends LitElement {}
