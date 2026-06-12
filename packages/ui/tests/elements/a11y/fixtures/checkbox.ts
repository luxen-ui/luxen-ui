import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-checkbox on <input type="checkbox">). A checkbox
// needs an associated label for its accessible name — pair each with a <label>.
export default defineA11yFixture({
  name: 'checkbox',
  states: {
    unchecked: `<label><input type="checkbox" class="l-checkbox"> Subscribe to updates</label>`,
    checked: `<label><input type="checkbox" class="l-checkbox" checked> Subscribe to updates</label>`,
    disabled: `<label><input type="checkbox" class="l-checkbox" disabled> Subscribe to updates</label>`,
    required: `<label><input type="checkbox" class="l-checkbox" required> Accept the terms</label>`,
  },
});
