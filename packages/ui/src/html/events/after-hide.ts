/**
 * Fired after an element's close animation completes. Not cancelable.
 *
 * Does not bubble and is not composed: listen on the element itself.
 */
export class AfterHideEvent extends Event {
  constructor() {
    super('after-hide', { bubbles: false, composed: false, cancelable: false });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'after-hide': AfterHideEvent;
  }
}
