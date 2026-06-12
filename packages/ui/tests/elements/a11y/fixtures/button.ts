import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-button on a <button>). Each variant is a distinct
// background/foreground contrast pair. The disabled state is included because
// axe checks contrast on disabled controls too (they are exempt — see below).
export default defineA11yFixture({
  name: 'button',
  states: {
    secondary: `<button class="l-button">Save</button>`,
    primary: `<button class="l-button" data-variant="primary">Save</button>`,
    destructive: `<button class="l-button" data-variant="destructive">Delete</button>`,
    // An icon-only button needs an accessible name from aria-label (no text child).
    'icon-only': `<button class="l-button" aria-label="Close"><l-icon name="test:close"></l-icon></button>`,
    disabled: `<button class="l-button" disabled>Save</button>`,
  },
});
