import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-spinner renders role="progressbar" with a built-in aria-label="Loading".
export default defineA11yFixture({
  name: 'spinner',
  states: {
    default: `<l-spinner></l-spinner>`,
    sized: `<l-spinner style="font-size:2rem"></l-spinner>`,
  },
});
