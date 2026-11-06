import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-avatar sets role="img" + aria-label from `name`. Initials/default-icon
// variants render without a network image (the src variant would need a real
// resource, out of scope for a hermetic test).
export default defineA11yFixture({
  name: 'avatar',
  states: {
    initials: `<l-avatar name="Jane Cooper"></l-avatar>`,
    'with-badge': `<l-avatar name="Jane Cooper" badge="3"></l-avatar>`,
    interactive: {
      html: `<l-avatar name="Jane Cooper" interactive></l-avatar>`,
      disabledRules: [
        {
          id: 'label-content-name-mismatch',
          reason:
            'False positive: the initials ("JC") abbreviate `name`, which is the button’s accessible name ("Jane Cooper"). They are an image of the person, not a text label (WCAG 2.5.3 covers labels). axe-core ≥4.14 compares the visible text even when it is aria-hidden, so no markup change satisfies it without dropping the full name.',
        },
      ],
    },
  },
});
