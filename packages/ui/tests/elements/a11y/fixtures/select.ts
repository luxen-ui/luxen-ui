import { defineA11yFixture } from '../../support/a11y-fixture.js';

// `select` is now the Shadow-DOM custom element `<l-select>` (button/combobox
// trigger + popover listbox). The native CSS-only `<select class="l-select">`
// still ships as the "platform" tier — kept here as a state so its contrast and
// label wiring stay covered by axe.
export default defineA11yFixture({
  name: 'select',
  states: {
    single: `
      <l-select label="Country" placeholder="Select a country">
        <datalist>
          <option value="fr">France</option>
          <option value="de">Germany</option>
          <option value="es" disabled>Spain</option>
        </datalist>
      </l-select>`,
    multiple: `
      <l-select multiple label="Tags">
        <datalist>
          <option value="design" selected>Design</option>
          <option value="dev" selected>Development</option>
          <option value="qa">QA</option>
        </datalist>
      </l-select>`,
    native: `
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
