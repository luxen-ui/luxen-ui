import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-button-group exposes role="group" + aria-label (from `label`) and
// aria-orientation. Children are native .l-button elements.
export default defineA11yFixture({
  name: 'button-group',
  states: {
    horizontal: `
      <l-button-group label="Text alignment">
        <button class="l-button">Left</button>
        <button class="l-button">Center</button>
        <button class="l-button">Right</button>
      </l-button-group>`,
    vertical: `
      <l-button-group label="Actions" orientation="vertical">
        <button class="l-button">Edit</button>
        <button class="l-button">Delete</button>
      </l-button-group>`,
  },
});
