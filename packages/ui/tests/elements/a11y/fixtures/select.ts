import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-select on <select>). Platform-native semantics;
// it needs an accessible name from an associated label.
export default defineA11yFixture({
  name: 'select',
  states: {
    default: `
      <l-form-field>
        <label>Country</label>
        <select class="l-select">
          <option>France</option>
          <option>Germany</option>
          <option disabled>Spain</option>
        </select>
      </l-form-field>`,
  },
});
