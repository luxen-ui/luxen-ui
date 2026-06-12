import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-form-field wires id/for/aria-describedby/aria-invalid around a native control.
// The invalid state reveals the .l-error message with role="alert".
export default defineA11yFixture({
  name: 'form-field',
  states: {
    text: `
      <l-form-field>
        <label>Email</label>
        <input type="email" />
        <p class="l-hint">We'll never share your email.</p>
      </l-form-field>`,
    required: `
      <l-form-field required>
        <label>Full name</label>
        <input type="text" required />
      </l-form-field>`,
    checkbox: `
      <l-form-field>
        <label>Subscribe</label>
        <input type="checkbox" />
      </l-form-field>`,
    invalid: {
      html: `
        <l-form-field>
          <label>Email</label>
          <input type="email" />
          <p class="l-error">Enter a valid email address.</p>
        </l-form-field>`,
      setup: (host) => {
        (host.querySelector('l-form-field') as HTMLElement & { invalid?: boolean }).invalid = true;
      },
    },
  },
});
