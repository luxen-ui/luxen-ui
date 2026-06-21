import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-combobox is a Shadow-DOM, form-associated element. The input exposes
// role="combobox"; `label` provides its accessible name. Options are authored
// as a native <datalist> of <option>.
export default defineA11yFixture({
  name: 'combobox',
  states: {
    default: `
      <l-combobox label="Country" placeholder="Search a country">
        <datalist>
          <option value="us">United States</option>
          <option value="fr">France</option>
          <option value="de">Germany</option>
        </datalist>
      </l-combobox>`,
  },
});
