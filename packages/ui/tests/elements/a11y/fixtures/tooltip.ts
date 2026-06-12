import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-tooltip anchors to a trigger via `for`. Scanned open (text contrast on the
// tooltip surface is the high-value check).
export default defineA11yFixture({
  name: 'tooltip',
  states: {
    open: {
      html: `
        <button id="tooltip-trigger">Learn more</button>
        <l-tooltip for="tooltip-trigger" style="--show-duration: 0; --hide-duration: 0">
          More information about this action.
        </l-tooltip>`,
      setup: (host) => openOverlay(host.querySelector('l-tooltip')!),
    },
  },
});
