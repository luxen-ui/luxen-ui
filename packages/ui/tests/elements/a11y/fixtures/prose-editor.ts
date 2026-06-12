import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-prose-editor renders a role="toolbar" (aria-label="Formatting") plus a
// ProseMirror contenteditable. Static — the resting state exposes the full
// toolbar and editing surface. Label the editor region for an accessible name.
export default defineA11yFixture({
  name: 'prose-editor',
  states: {
    empty: `<l-prose-editor aria-label="Description"></l-prose-editor>`,
    'with-content': `<l-prose-editor aria-label="Description" initial-html="<p>Hello world</p>"></l-prose-editor>`,
  },
});
