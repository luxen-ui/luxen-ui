import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-switch on <input type="checkbox" role="switch">).
// `role="switch"` exposes the on/off semantic; the control still needs an
// associated label for its accessible name — pair each with a <label>.
export default defineA11yFixture({
  name: 'switch',
  states: {
    off: `<label><input type="checkbox" role="switch" class="l-switch"> Email notifications</label>`,
    on: `<label><input type="checkbox" role="switch" class="l-switch" checked> Email notifications</label>`,
    disabled: `<label><input type="checkbox" role="switch" class="l-switch" disabled> Email notifications</label>`,
    required: `<label><input type="checkbox" role="switch" class="l-switch" required> Accept the terms</label>`,
  },
});
