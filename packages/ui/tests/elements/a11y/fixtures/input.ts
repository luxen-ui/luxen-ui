import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-input on a text-like <input>) plus its
// progressive adornment wrapper <l-input-group> (covered here — same anatomy,
// the group only adds layout chrome and the injected password toggle, which
// names itself via a localized aria-label).
export default defineA11yFixture({
  name: 'input',
  covers: ['input-group'],
  states: {
    text: `<label>Full name <input type="text" class="l-input" placeholder="Jane Cooper"></label>`,
    search: `<label>Search <input type="search" class="l-input" value="This a value"></label>`,
    date: `<label>Date <input type="date" class="l-input"></label>`,
    time: `<label>Time <input type="time" class="l-input"></label>`,
    disabled: `<label>Full name <input type="text" class="l-input" value="Jane Cooper" disabled></label>`,
    invalid: `<label>Email <input type="email" class="l-input" value="not-an-email" aria-invalid="true"></label>`,
    'group-unit': `
      <l-input-group>
        <input type="number" aria-label="Height" placeholder="170">
        <span>cm</span>
      </l-input-group>`,
    'group-icon': `
      <l-input-group>
        <l-icon name="test:check"></l-icon>
        <input type="search" aria-label="Search">
      </l-input-group>`,
    'group-password-toggle': `
      <l-input-group password-toggle>
        <input type="password" value="hunter2" aria-label="Password" autocomplete="current-password">
      </l-input-group>`,
  },
});
