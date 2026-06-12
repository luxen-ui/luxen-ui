import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-divider exposes role="separator" and aria-orientation for vertical.
export default defineA11yFixture({
  name: 'divider',
  states: {
    horizontal: `<div>Above<l-divider></l-divider>Below</div>`,
    vertical: `<div style="display:flex">A<l-divider orientation="vertical"></l-divider>B</div>`,
  },
});
