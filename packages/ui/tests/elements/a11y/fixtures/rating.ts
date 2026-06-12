import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-rating: display mode renders a masked visual; edit mode renders a radio
// group (visually-hidden inputs). The radio group needs a group label.
export default defineA11yFixture({
  name: 'rating',
  states: {
    display: `<l-rating value="3" label="Rated 3 out of 5"></l-rating>`,
    'edit-mode': `<l-rating value="3" edit-mode label="Rate this product"></l-rating>`,
  },
});
