import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-kbd on <kbd>). Plain inline text — the check that
// matters is contrast of the key cap against its background.
export default defineA11yFixture({
  name: 'kbd',
  states: {
    single: `<kbd class="l-kbd">Esc</kbd>`,
    combo: `<span><kbd class="l-kbd">Ctrl</kbd> + <kbd class="l-kbd">C</kbd></span>`,
  },
});
