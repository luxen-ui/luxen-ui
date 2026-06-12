import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-sticky-bar paints in the top layer (popover="manual"). Without `for` it can
// be opened directly; scanned open so its content is in the a11y tree.
export default defineA11yFixture({
  name: 'sticky-bar',
  states: {
    open: {
      html: `
        <l-sticky-bar placement="bottom" style="--show-duration: 0; --hide-duration: 0">
          <button class="l-button" data-variant="primary">Add to cart</button>
        </l-sticky-bar>`,
      setup: (host) => openOverlay(host.querySelector('l-sticky-bar')!),
    },
  },
});
