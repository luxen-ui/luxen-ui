import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-toast is a live-region container (role="log", aria-live="polite"); items are
// created imperatively via `.toast(options)`. Scan after a toast is shown so the
// alert/status item is in the a11y tree. (No after-show await — with duration:0
// the show event is gated on an animationend that never fires; settling is
// enough for the item to be in the DOM.)
type ToastContainer = HTMLElement & {
  toast: (opts: Record<string, unknown>) => HTMLElement;
  updateComplete?: Promise<unknown>;
};

export default defineA11yFixture({
  name: 'toast',
  states: {
    shown: {
      html: `<l-toast placement="top-end" style="--show-duration: 0ms; --hide-duration: 0ms"></l-toast>`,
      setup: async (host) => {
        const container = host.querySelector<ToastContainer>('l-toast')!;
        container.toast({ heading: 'Saved', text: 'Your changes were saved.', duration: 0 });
        await container.updateComplete;
        await new Promise((r) => setTimeout(r, 0));
        await container.updateComplete;
        await new Promise((r) => setTimeout(r, 0));
      },
    },
  },
});
