import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-tag is a Shadow-DOM chip. The highest-value checks: the chip's label keeps
// contrast over the neutral fill, the remove button exposes an accessible name
// ("Remove"), and its hit target stays ≥24px (target-size, WCAG 2.5.8).
export default defineA11yFixture({
  name: 'tag',
  states: {
    default: `<l-tag>Design</l-tag>`,
    removable: `<l-tag removable>Design</l-tag>`,
    disabled: `<l-tag removable disabled>Locked</l-tag>`,
    sm: `<l-tag size="sm" removable>QA</l-tag>`,
    lg: `<l-tag size="lg" removable>Development</l-tag>`,
  },
});
