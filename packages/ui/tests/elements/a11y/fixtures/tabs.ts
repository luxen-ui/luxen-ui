import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-tabs promotes the first child div to role="tablist", its buttons to
// role="tab", and the remaining divs to role="tabpanel". Static — the resting
// state already wires the full tab/panel relationship.
export default defineA11yFixture({
  name: 'tabs',
  states: {
    horizontal: `
      <l-tabs>
        <div>
          <button>Account</button>
          <button>Password</button>
        </div>
        <div>Account settings</div>
        <div>Password settings</div>
      </l-tabs>`,
    vertical: `
      <l-tabs orientation="vertical">
        <div>
          <button>General</button>
          <button>Advanced</button>
        </div>
        <div>General settings</div>
        <div>Advanced settings</div>
      </l-tabs>`,
  },
});
