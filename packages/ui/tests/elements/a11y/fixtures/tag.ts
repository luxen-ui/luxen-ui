import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-tag is a Shadow-DOM chip. The highest-value checks: the chip's label keeps
// contrast over the neutral fill, the remove button exposes an accessible name
// ("Remove"), and its hit target stays ≥24px (target-size, WCAG 2.5.8).
//
// The selectable states add the filter-chip surface: a toggle button carrying
// `aria-pressed`, and a chip whose label wraps a real checkbox — both over the
// selected tint, which is where contrast is tightest.
export default defineA11yFixture({
  name: 'tag',
  states: {
    default: `<l-tag>Design</l-tag>`,
    removable: `<l-tag removable>Design</l-tag>`,
    disabled: `<l-tag removable disabled>Locked</l-tag>`,
    sm: `<l-tag size="sm" removable>QA</l-tag>`,
    lg: `<l-tag size="lg" removable>Development</l-tag>`,
    selectable: `<l-tag selectable>A3</l-tag>`,
    selected: `<l-tag selectable selected>A4</l-tag>`,
    checkbox: `<l-tag selectable control="checkbox">Color <span slot="suffix">54</span></l-tag>`,
    'checkbox-selected': `<l-tag selectable control="checkbox" selected>Duplex <span slot="suffix">106</span></l-tag>`,
  },
});
