import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-segmented-control exposes role="radiogroup" + aria-label (from `label`),
// and promotes each button to role="radio" with aria-checked. Icon-only
// segments carry their own aria-label (the icon is decorative to AT).
export default defineA11yFixture({
  name: 'segmented-control',
  states: {
    labelled: `
      <l-segmented-control label="View" value="board">
        <button value="list">List</button>
        <button value="board">Board</button>
        <button value="calendar">Calendar</button>
      </l-segmented-control>`,
    'icon-only': `
      <l-segmented-control label="Text alignment">
        <button value="left" aria-label="Align left">
          <l-icon name="test:check"></l-icon>
        </button>
        <button value="center" aria-label="Align center">
          <l-icon name="test:check"></l-icon>
        </button>
        <button value="right" aria-label="Align right">
          <l-icon name="test:check"></l-icon>
        </button>
      </l-segmented-control>`,
  },
});
