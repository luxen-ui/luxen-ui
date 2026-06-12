import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { waitForEvent } from '../../support/events.js';

// l-stories is a role="list" of l-story thumbnail buttons; l-stories-viewer is
// the modal that plays them. The thumbnail row is static; the viewer is opened
// imperatively via openAt(storyEls, index).
type Viewer = HTMLElement & {
  openAt: (stories: Element[], index: number) => void;
  updateComplete?: Promise<unknown>;
};

const MARKUP = `
  <l-stories for="a11y-viewer" appearance="rounded">
    <l-story poster="data:image/gif;base64,R0lGODlhAQABAAAAACw=" label="Chapter 1"></l-story>
    <l-story poster="data:image/gif;base64,R0lGODlhAQABAAAAACw=" label="Chapter 2"></l-story>
  </l-stories>
  <l-stories-viewer id="a11y-viewer" style="--show-duration: 0ms; --hide-duration: 0ms"></l-stories-viewer>`;

export default defineA11yFixture({
  name: 'stories',
  covers: ['story', 'stories-viewer'],
  states: {
    thumbnails: MARKUP,
    'viewer-open': {
      html: MARKUP,
      setup: async (host) => {
        const viewer = host.querySelector<Viewer>('l-stories-viewer')!;
        const stories = [...host.querySelectorAll('l-story')];
        const shown = waitForEvent(viewer, 'after-show');
        viewer.openAt(stories, 0);
        await shown;
        await viewer.updateComplete;
        await new Promise((r) => setTimeout(r, 0));
      },
    },
  },
});
