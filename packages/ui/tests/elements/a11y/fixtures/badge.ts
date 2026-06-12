import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-badge is a light-DOM text container. Variant × appearance drive different
// background/foreground token pairs, so each state exercises a distinct
// contrast pair — the highest-value check for a badge. `filled` is the
// appearance most at risk (solid background behind the label).
export default defineA11yFixture({
  name: 'badge',
  states: {
    default: `<l-badge>New</l-badge>`,
    info: `<l-badge variant="info">Info</l-badge>`,
    success: `<l-badge variant="success">Active</l-badge>`,
    warning: `<l-badge variant="warning">Pending</l-badge>`,
    danger: `<l-badge variant="danger">Error</l-badge>`,
    neutral: `<l-badge variant="neutral">Draft</l-badge>`,
    'filled-danger': `<l-badge variant="danger" appearance="filled">Error</l-badge>`,
    'filled-success': `<l-badge variant="success" appearance="filled">Active</l-badge>`,
    pill: `<l-badge variant="info" pill>3</l-badge>`,
  },
});
