import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-popover anchors to a trigger via `for`. Scanned open, so the panel content
// is in the a11y tree.
export default defineA11yFixture({
  name: 'popover',
  states: {
    open: {
      html: `
        <button id="popover-trigger">Details</button>
        <l-popover for="popover-trigger" style="--show-duration: 0; --hide-duration: 0">
          <p>Extra details about this item.</p>
        </l-popover>`,
      setup: (host) => openOverlay(host.querySelector('l-popover')!),
    },
  },
});
