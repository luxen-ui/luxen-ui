import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-alert is a light-DOM callout. Each variant tints the icon, title, and border
// from a semantic text token over a soft background, while the body stays in the
// primary text color — so the highest-value checks are the per-variant contrast
// pairs (title/link on soft fill, body on soft fill) and the injected close
// button's accessible name. The title+body+link state also exercises
// `link-in-text-block` (links must be distinguishable from body text without
// relying on color alone — they are underlined).
export default defineA11yFixture({
  name: 'alert',
  states: {
    neutral: `<l-alert>A neutral message.</l-alert>`,
    info: `<l-alert variant="info">A new update is available.</l-alert>`,
    success: `<l-alert variant="success">Your profile has been updated.</l-alert>`,
    warning: `<l-alert variant="warning">Your trial ends in 3 days.</l-alert>`,
    danger: `<l-alert variant="danger">We couldn't process your payment.</l-alert>`,
    'title-body-link': `<l-alert variant="warning"><span class="l-alert-title">Trial ending</span>Your trial ends soon. <a href="#">Upgrade now</a> to keep access.</l-alert>`,
    dismissible: `<l-alert variant="success" dismissible><span class="l-alert-title">Saved</span>Your profile has been updated.</l-alert>`,
    'without-icon': `<l-alert variant="info" without-icon>A message without an icon.</l-alert>`,
  },
});
