import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-progress on <progress>). The native <progress>
// element has an implicit progressbar role; it needs an accessible name, so
// pair it with a <label> (or aria-label).
export default defineA11yFixture({
  name: 'progress',
  states: {
    determinate: `<label>Upload<progress class="l-progress" value="0.6" max="1"></progress></label>`,
    indeterminate: `<label>Loading<progress class="l-progress" max="1"></progress></label>`,
    full: `<label>Complete<progress class="l-progress" value="1" max="1"></progress></label>`,
  },
});
