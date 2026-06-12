import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-icon is decorative by default (inner iconify-icon is aria-hidden); set
// `label` to make it meaningful (role="img" + aria-label). The `test:` icons
// are registered locally by the spec (registerTestIcons) so nothing hits the
// Iconify CDN.
export default defineA11yFixture({
  name: 'icon',
  states: {
    decorative: `<span>Saved <l-icon name="test:check"></l-icon></span>`,
    meaningful: `<l-icon name="test:check" label="Saved"></l-icon>`,
  },
});
