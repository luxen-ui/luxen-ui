import { defineA11yFixture } from '../../support/a11y-fixture.js';

// .l-radio-group is CSS only: a <fieldset> of native radios captioned by its
// <legend>, each input wrapped in the <label> that names it, in either
// appearance — the radio primitive (`.l-radio` on the input) or joined buttons
// (`data-appearance="button"` + `.l-button` on the label).
export default defineA11yFixture({
  name: 'radio-group',
  states: {
    default: `
      <fieldset class="l-radio-group" data-orientation="vertical">
        <legend>Notifications</legend>
        <label>
          <input type="radio" class="l-radio" name="notifications" value="all" checked />
          All new messages
        </label>
        <label>
          <input type="radio" class="l-radio" name="notifications" value="none" />
          Nothing
        </label>
      </fieldset>`,
    button: `
      <fieldset class="l-radio-group" data-appearance="button">
        <legend>View</legend>
        <label class="l-button">
          <input type="radio" name="view" value="list" checked />
          List
        </label>
        <label class="l-button">
          <input type="radio" name="view" value="board" />
          Board
        </label>
      </fieldset>`,
    'no-legend': `
      <fieldset class="l-radio-group" data-appearance="button" aria-label="View">
        <label class="l-button">
          <input type="radio" name="view-bare" value="list" checked />
          List
        </label>
        <label class="l-button">
          <input type="radio" name="view-bare" value="board" />
          Board
        </label>
      </fieldset>`,
    vertical: `
      <fieldset class="l-radio-group" data-appearance="button" data-orientation="vertical">
        <legend>Density</legend>
        <label class="l-button">
          <input type="radio" name="density" value="compact" checked />
          Compact
        </label>
        <label class="l-button">
          <input type="radio" name="density" value="cosy" />
          Cosy
        </label>
      </fieldset>`,
    'disabled-segment': `
      <fieldset class="l-radio-group" data-appearance="button">
        <legend>Plan</legend>
        <label class="l-button">
          <input type="radio" name="plan" value="free" checked />
          Free
        </label>
        <label class="l-button">
          <input type="radio" name="plan" value="enterprise" disabled />
          Enterprise
        </label>
      </fieldset>`,
  },
});
