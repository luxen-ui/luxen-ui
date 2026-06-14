import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-radio on <input type="radio">). A radio needs an
// associated label for its accessible name, and the group is named by wrapping
// the options in a <fieldset> with a <legend>.
export default defineA11yFixture({
  name: 'radio',
  states: {
    unselected: `<fieldset>
      <legend>Notifications</legend>
      <label><input type="radio" class="l-radio" name="a11y-notifications"> All messages</label>
      <label><input type="radio" class="l-radio" name="a11y-notifications"> Mentions only</label>
    </fieldset>`,
    selected: `<fieldset>
      <legend>Notifications</legend>
      <label><input type="radio" class="l-radio" name="a11y-notifications" checked> All messages</label>
      <label><input type="radio" class="l-radio" name="a11y-notifications"> Mentions only</label>
    </fieldset>`,
    disabled: `<fieldset>
      <legend>Notifications</legend>
      <label><input type="radio" class="l-radio" name="a11y-notifications" disabled> All messages</label>
      <label><input type="radio" class="l-radio" name="a11y-notifications" disabled> Mentions only</label>
    </fieldset>`,
    required: `<fieldset>
      <legend>Notifications</legend>
      <label><input type="radio" class="l-radio" name="a11y-notifications" required> All messages</label>
      <label><input type="radio" class="l-radio" name="a11y-notifications" required> Mentions only</label>
    </fieldset>`,
  },
});
