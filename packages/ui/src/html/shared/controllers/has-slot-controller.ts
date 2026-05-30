import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Reactive controller that tracks whether one or more slots have content, and
 * requests a host update whenever that changes. Lets a template react to empty
 * slots — e.g. collapse a footer row when nothing is slotted into it.
 *
 * Drives this off `slotchange` rather than a CSS selector because
 * `:host(:has(> [slot='name']))` is invalid (`:has()` can't be nested inside
 * `:host()`, so browsers drop the whole rule). Pair it with a data-attribute:
 *
 * ```ts
 * private _slots = new HasSlotController(this, 'footer');
 *
 * render() {
 *   return html`
 *     <footer part="footer" ?data-empty=${!this._slots.test('footer')}>
 *       <slot name="footer"></slot>
 *     </footer>
 *   `;
 * }
 * ```
 *
 * Pass `'[default]'` to test the default (unnamed) slot.
 */
export class HasSlotController implements ReactiveController {
  private host: ReactiveControllerHost & Element;
  private slotNames: string[];

  constructor(host: ReactiveControllerHost & Element, ...slotNames: string[]) {
    this.host = host;
    this.slotNames = slotNames;
    host.addController(this);
  }

  /** Whether the given slot currently has content. Use `'[default]'` for the default slot. */
  test(slotName: string): boolean {
    return slotName === '[default]' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  // A direct child projected into the named slot. `:scope >` keeps it to direct
  // children, so a nested `[slot="name"]` inside slotted content can't match.
  private hasNamedSlot(name: string): boolean {
    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  // Any non-whitespace text node or any element without a `slot` attribute
  // counts as default-slot content.
  private hasDefaultSlot(): boolean {
    return [...this.host.childNodes].some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').trim() !== '';
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return !(node as HTMLElement).hasAttribute('slot');
      }
      return false;
    });
  }

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    const watched = slot.name
      ? this.slotNames.includes(slot.name)
      : this.slotNames.includes('[default]');
    if (watched) this.host.requestUpdate();
  };

  hostConnected() {
    this.host.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
  }

  hostDisconnected() {
    this.host.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
  }
}
