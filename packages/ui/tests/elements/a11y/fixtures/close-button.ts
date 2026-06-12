import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-close on a <button>). The X is a CSS mask with no
// text content, so an accessible name MUST come from aria-label — axe's
// button-name rule is the real value here. One state per appearance skin.
export default defineA11yFixture({
  name: 'close-button',
  states: {
    ring: `<button class="l-close" data-appearance="ring" aria-label="Close"></button>`,
    square: `<button class="l-close" data-appearance="square" aria-label="Close"></button>`,
    circle: `<button class="l-close" data-appearance="circle" aria-label="Close"></button>`,
  },
});
