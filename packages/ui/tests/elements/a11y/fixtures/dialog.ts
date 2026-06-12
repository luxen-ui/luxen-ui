import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-dialog is a modal <dialog> in shadow DOM; `title` becomes the accessible
// name. The open state is where the content + footer actions enter the a11y
// tree, so that is what axe should scan.
export default defineA11yFixture({
  name: 'dialog',
  states: {
    open: {
      html: `
        <l-dialog title="Confirm action" style="--show-duration: 0ms; --hide-duration: 0ms">
          <p>Are you sure you want to delete this item?</p>
          <button slot="footer" class="l-button">Cancel</button>
          <button slot="footer" class="l-button" data-variant="destructive">Delete</button>
        </l-dialog>`,
      setup: (host) => openOverlay(host.querySelector('l-dialog')!),
    },
  },
});
