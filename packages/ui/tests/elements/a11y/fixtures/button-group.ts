import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-button-group exposes role="group" + aria-label (from `label`). No
// aria-orientation: ARIA 1.2 does not allow it on role="group". Children are
// native .l-button elements, and may carry their own aria-pressed state.
export default defineA11yFixture({
  name: 'button-group',
  states: {
    horizontal: `
      <l-button-group label="Record actions">
        <button class="l-button">Edit</button>
        <button class="l-button">Duplicate</button>
        <button class="l-button">Archive</button>
      </l-button-group>`,
    toggle: `
      <l-button-group label="Text formatting">
        <button class="l-button" aria-pressed="true">Bold</button>
        <button class="l-button" aria-pressed="false">Italic</button>
        <button class="l-button" aria-pressed="false">Underline</button>
      </l-button-group>`,
    vertical: `
      <l-button-group label="Actions" orientation="vertical">
        <button class="l-button">Edit</button>
        <button class="l-button">Delete</button>
      </l-button-group>`,
  },
});
