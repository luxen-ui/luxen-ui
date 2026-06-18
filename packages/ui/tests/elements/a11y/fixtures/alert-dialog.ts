import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-alert-dialog is an interruptive modal <dialog> (role="alertdialog") in
// shadow DOM; `title` is the accessible name and the body is the accessible
// description. The open state is where the actions enter the a11y tree, so that
// is what axe should scan.
export default defineA11yFixture({
  name: 'alert-dialog',
  states: {
    open: {
      html: `
        <l-alert-dialog
          title="Delete this project?"
          tone="danger"
          confirm-text="Delete"
          style="--show-duration: 0ms; --hide-duration: 0ms"
        >
          This permanently deletes the project and everything in it. This action cannot be undone.
        </l-alert-dialog>`,
      setup: (host) => openOverlay(host.querySelector('l-alert-dialog')!),
    },
  },
});
