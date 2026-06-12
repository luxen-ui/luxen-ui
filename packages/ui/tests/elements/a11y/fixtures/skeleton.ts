import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-skeleton is a purely decorative loading placeholder. It carries no text and
// conveys no information to assistive tech, so it should be inert in the
// accessibility tree (the consumer marks the loading region busy).
export default defineA11yFixture({
  name: 'skeleton',
  states: {
    block: `<l-skeleton style="width:200px;height:1rem"></l-skeleton>`,
    circle: `<l-skeleton style="width:40px;height:40px;border-radius:50%"></l-skeleton>`,
  },
  // Decorative box with a background gradient and no foreground text — there is
  // no meaningful foreground/background contrast pair to evaluate.
  disabledRules: [
    { id: 'color-contrast', reason: 'Decorative placeholder; no text/foreground to contrast.' },
  ],
});
