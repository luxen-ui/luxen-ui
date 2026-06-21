import { defineA11yFixture } from '../../support/a11y-fixture.js';

// .l-breadcrumb is a CSS-only nav trail. The a11y-critical surfaces are the
// landmark name, the ordered-list structure, `aria-current="page"` on the
// current crumb, link contrast, and that the decorative separators stay out of
// the accessibility tree. Each state exercises a distinct shape (plain trail,
// icon crumb, overflow collapsed into a dropdown).
export default defineA11yFixture({
  name: 'breadcrumb',
  states: {
    default: `
      <nav class="l-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/products">Products</a></li>
          <li><a href="/products/bags" aria-current="page">Bags</a></li>
        </ol>
      </nav>`,
    withIcon: `
      <nav class="l-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="/"><l-icon name="lucide:house" label="Home"></l-icon></a></li>
          <li><a href="/account">Account</a></li>
          <li><a href="/account/settings" aria-current="page">Settings</a></li>
        </ol>
      </nav>`,
  },
});
