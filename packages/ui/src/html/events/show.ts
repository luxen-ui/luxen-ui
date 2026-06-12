/**
 * Fired when an overlay element (dialog, drawer, dropdown, sticky-bar,
 * stories-viewer, toast) is about to open. Cancelable — call
 * `event.preventDefault()` to keep it closed.
 *
 * Does not bubble and is not composed: listen on the element itself.
 */
export class ShowEvent extends Event {
  constructor() {
    super('show', { bubbles: false, composed: false, cancelable: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    show: ShowEvent;
  }
}
