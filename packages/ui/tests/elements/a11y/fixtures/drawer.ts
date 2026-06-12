import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-drawer is an edge-anchored modal that reuses the dialog lifecycle; `title`
// is the accessible name. Scanned open, where its content enters the a11y tree.
export default defineA11yFixture({
  name: 'drawer',
  states: {
    open: {
      html: `
        <l-drawer title="Navigation" style="--show-duration: 0ms; --hide-duration: 0ms">
          <nav aria-label="Main">
            <a href="#home">Home</a>
            <a href="#about">About</a>
          </nav>
        </l-drawer>`,
      setup: (host) => openOverlay(host.querySelector('l-drawer')!),
    },
  },
});
