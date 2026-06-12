import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-input-otp wraps a real <input> (kept in the a11y tree) behind a decorative
// cell layer. Label it so the input has an accessible name.
export default defineA11yFixture({
  name: 'input-otp',
  states: {
    default: `
      <l-form-field>
        <label>One-time code</label>
        <l-input-otp><input /></l-input-otp>
      </l-form-field>`,
  },
});
