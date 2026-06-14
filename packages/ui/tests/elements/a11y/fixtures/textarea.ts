import { defineA11yFixture } from '../../support/a11y-fixture.js';

// Native CSS-only element (.l-textarea on a <textarea>). The multi-line sibling
// of .l-input — same form-control chrome, so the same a11y surface (label
// association, disabled, invalid).
export default defineA11yFixture({
  name: 'textarea',
  states: {
    default: `<label>Message <textarea class="l-textarea" rows="3" placeholder="Tell us more"></textarea></label>`,
    filled: `<label>Message <textarea class="l-textarea" rows="3">This is a longer message.</textarea></label>`,
    disabled: `<label>Message <textarea class="l-textarea" rows="3" disabled>Disabled value</textarea></label>`,
    invalid: `<label>Message <textarea class="l-textarea" rows="3" required aria-invalid="true"></textarea></label>`,
  },
});
