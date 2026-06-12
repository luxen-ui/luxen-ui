/**
 * Fired when an overlay element is about to close. Cancelable — call
 * `event.preventDefault()` to keep it open.
 *
 * Does not bubble and is not composed: listen on the element itself.
 */
export class HideEvent extends Event {
  constructor() {
    super('hide', { bubbles: false, composed: false, cancelable: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    hide: HideEvent;
  }
}
