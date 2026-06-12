/**
 * Fired after an element's open animation completes. Not cancelable.
 *
 * Does not bubble and is not composed: listen on the element itself.
 */
export class AfterShowEvent extends Event {
  constructor() {
    super('after-show', { bubbles: false, composed: false, cancelable: false });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'after-show': AfterShowEvent;
  }
}
