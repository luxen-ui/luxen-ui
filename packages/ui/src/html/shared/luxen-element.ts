import { LitElement } from 'lit';

/**
 * Base class for all Luxen custom elements.
 * Extends LitElement with shared utilities.
 */
export class LuxenElement extends LitElement {
  /**
   * Dispatch a custom event. Returns `true` if not cancelled.
   *
   * @param name - Event name (unprefixed, e.g. `'show'`).
   * @param options - CustomEvent options. Defaults: bubbles + composed.
   */
  emit<T = unknown>(
    name: string,
    options?: {
      detail?: T;
      bubbles?: boolean;
      composed?: boolean;
      cancelable?: boolean;
    },
  ): boolean {
    const event = new CustomEvent<T>(name, {
      bubbles: options?.bubbles ?? true,
      composed: options?.composed ?? true,
      cancelable: options?.cancelable ?? false,
      detail: options?.detail as T,
    });
    this.dispatchEvent(event);
    return !event.defaultPrevented;
  }
}
