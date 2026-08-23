import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-input-stepper wraps a native <input type="number"> (role="spinbutton") with
// labelled increment/decrement buttons. Label the input for its accessible name.
export default defineA11yFixture({
  name: 'input-stepper',
  states: {
    default: `
      <l-form-field>
        <label>Quantity</label>
        <l-input-stepper><input type="number" min="0" max="10" value="3" /></l-input-stepper>
      </l-form-field>`,
    rounded: `
      <l-form-field>
        <label>Guests</label>
        <l-input-stepper appearance="rounded">
          <input type="number" min="1" max="8" value="2" />
        </l-input-stepper>
      </l-form-field>`,
    pill: `
      <l-form-field>
        <label>Tickets</label>
        <l-input-stepper appearance="pill">
          <input type="number" min="1" max="8" value="5" />
        </l-input-stepper>
      </l-form-field>`,
  },
});
