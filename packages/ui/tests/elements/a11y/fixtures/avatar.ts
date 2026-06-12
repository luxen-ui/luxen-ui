import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-avatar sets role="img" + aria-label from `name`. Initials/default-icon
// variants render without a network image (the src variant would need a real
// resource, out of scope for a hermetic test).
export default defineA11yFixture({
  name: 'avatar',
  states: {
    initials: `<l-avatar name="Jane Cooper"></l-avatar>`,
    'with-badge': `<l-avatar name="Jane Cooper" badge="3"></l-avatar>`,
    interactive: `<l-avatar name="Jane Cooper" interactive></l-avatar>`,
  },
});
