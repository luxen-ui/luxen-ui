import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-slider is a Shadow-DOM, form-associated element. Each thumb is a
// role="slider"; `label` provides the accessible name (range mode suffixes
// Minimum / Maximum).
export default defineA11yFixture({
  name: 'slider',
  states: {
    default: `<l-slider label="Volume" value="40"></l-slider>`,
    range: `<l-slider label="Price" range min-value="20" max-value="70"></l-slider>`,
  },
});
