// Defines <iconify-icon> as a side effect, and gives us the storage lookup the
// unresolved-name warning below needs.
import { loadIcon } from 'iconify-icon';
import type { PropertyValues } from 'lit';
import { html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './icon.css?inline';

/**
 * Icon storage lives in the `iconify-icon` module, and every copy of that
 * module has its own. `@iconify/vue`, `@iconify/react` and friends each bundle
 * a separate one, so a collection registered through them is invisible here —
 * the icon simply renders nothing, at zero width, with no error.
 *
 * Re-exported so the registration API a consumer needs is the *same instance*
 * this element reads from, whatever the package manager did with two
 * `iconify-icon` ranges:
 *
 * ```js
 * import { addCollection } from 'luxen-ui/icon';
 * addCollection(myIconSet); // before the first icon mounts — see below
 * ```
 *
 * Registration is a plain write to storage: it does not re-render icons that
 * are already on the page, and a name the API has already reported missing is
 * not retried. Register before the first icon mounts.
 *
 * This reaches the npm build only. The CDN build inlines `iconify-icon` and
 * tree-shakes the re-export out of the entry, so a CDN consumer registers
 * through `window.IconifyPreload` instead — read once, at module init, so the
 * assignment has to come before the script tag.
 */
export { addCollection, addIcon, setCustomIconLoader } from 'iconify-icon';

const styles = unsafeCSS(rawStyles);

/**
 * Names already reported, so a collection that is missing on a table of 200
 * rows costs one line and not two hundred.
 */
const warnedNames = new Set<string>();

/**
 * @summary An icon component that renders icons from any Iconify icon set. Decorative by default. Set `label` for meaningful icons.
 * @customElement l-icon
 *
 * @cssproperty --color - The color of the icon. Defaults to `currentColor`.
 */
export class Icon extends LuxenElement {
  static override styles = [hostStyles, styles];

  /** The icon name in Iconify format (e.g. `mdi:home`, `lucide:check`). */
  @property()
  name = '';

  /** Accessible label. When set, the icon becomes meaningful (`role="img"` + `aria-label`). When absent, the icon is decorative. */
  @property()
  label?: string;

  /**
   * An unresolved name is otherwise completely silent: `iconify-icon` renders
   * no `<svg>`, the box collapses to 0px, and the API answers a well-formed
   * "not found" — so there is no console error and no failed request to
   * notice either. A criteria bar can ship with every icon invisible and look
   * merely tight. Say it once per name.
   *
   * `loadIcon()` resolves from storage when the icon is already there and
   * otherwise joins the request the element itself makes, so this costs no
   * extra network.
   */
  private _warnIfUnresolved(name: string) {
    if (!name || warnedNames.has(name)) return;
    loadIcon(name).catch(() => {
      if (warnedNames.has(name)) return;
      warnedNames.add(name);
      // eslint-disable-next-line no-console
      console.warn(
        `<${this.localName}>: icon "${name}" could not be resolved. Icons outside the ` +
          `Iconify CDN must be registered with the addCollection() re-exported from ` +
          `this package — the one from a framework binding writes to a different store.`,
      );
    });
  }

  override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('name')) this._warnIfUnresolved(this.name);

    if (changedProperties.has('label')) {
      if (this.label) {
        this.setAttribute('role', 'img');
        this.setAttribute('aria-label', this.label);
      } else {
        this.removeAttribute('role');
        this.removeAttribute('aria-label');
      }
    }
  }

  override render() {
    return html`
      <iconify-icon
        icon=${this.name}
        aria-hidden="true"
      ></iconify-icon>
    `;
  }
}
