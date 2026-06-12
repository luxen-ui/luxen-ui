import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-carousel wraps embla; slides are l-carousel-item (role="group"). Always
// visible — no open state. Images carry alt text.
export default defineA11yFixture({
  name: 'carousel',
  covers: ['carousel-item'],
  states: {
    default: `
      <l-carousel aria-label="Product photos">
        <l-carousel-item>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Front view" />
        </l-carousel-item>
        <l-carousel-item>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Side view" />
        </l-carousel-item>
      </l-carousel>`,
  },
});
