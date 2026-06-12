import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-disclosure on <details>). The native
// details/summary gives the disclosure semantics for free; both resting states
// are worth checking (collapsed + expanded reveal different contrast surfaces).
export default defineA11yFixture({
  name: 'disclosure',
  states: {
    collapsed: `
      <details class="l-disclosure" data-marker="arrow">
        <summary>Shipping details</summary>
        <div>Ships in 2–3 business days.</div>
      </details>`,
    expanded: `
      <details class="l-disclosure" data-marker="arrow" open>
        <summary>Shipping details</summary>
        <div>Ships in 2–3 business days.</div>
      </details>`,
    bordered: `
      <details class="l-disclosure" data-variant="bordered" open>
        <summary>Returns policy</summary>
        <div>Free returns within 30 days.</div>
      </details>`,
  },
});
