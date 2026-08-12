import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-color-scheme-icon is decorative by default (aria-hidden, no role), so the states
// below mostly prove it stays *out* of the accessibility tree. The `named`
// state covers the opt-in case where it carries its own role="img" name.
export default defineA11yFixture({
  name: 'color-scheme-icon',
  states: {
    light: `<l-color-scheme-icon scheme="light"></l-color-scheme-icon>`,
    dark: `<l-color-scheme-icon scheme="dark"></l-color-scheme-icon>`,
    named: `<l-color-scheme-icon
      scheme="dark"
      label="Dark theme"
    ></l-color-scheme-icon>`,
    // The real deployment: the row owns the role, name and state; the glyph is
    // decorative content inside it, in the column `check-placement="end"` frees
    // up. Opened through the shared helper with zero-duration transitions —
    // scanning mid-animation measures a half-faded panel and reports a contrast
    // failure that does not exist once it has settled.
    'in-a-menu-row': {
      html: `
        <l-dropdown style="--show-duration: 0; --hide-duration: 0">
          <button
            slot="trigger"
            class="l-button"
          >
            Account
          </button>
          <l-dropdown-item
            type="checkbox"
            check-placement="end"
            value="theme"
            checked
          >
            <l-color-scheme-icon
              slot="prefix"
              scheme="dark"
            ></l-color-scheme-icon>
            Dark theme
          </l-dropdown-item>
        </l-dropdown>`,
      setup: (host: HTMLElement) => openOverlay(host.querySelector('l-dropdown')!),
    },
  },
});
