import { defineA11yFixture } from '../../support/a11y-fixture.js';
import { openOverlay } from './_open.js';

// l-dropdown is a menu button; items + label only enter the a11y tree when open,
// so both the resting trigger and the open menu are worth scanning.
export default defineA11yFixture({
  name: 'dropdown',
  covers: ['dropdown-item', 'dropdown-label'],
  states: {
    closed: `
      <l-dropdown style="--show-duration: 0; --hide-duration: 0">
        <button slot="trigger">Menu</button>
        <l-dropdown-label>Fruit</l-dropdown-label>
        <l-dropdown-item>Apple</l-dropdown-item>
        <l-dropdown-item>Banana</l-dropdown-item>
        <l-dropdown-item disabled>Cherry</l-dropdown-item>
        <l-dropdown-item type="checkbox">Notifications</l-dropdown-item>
      </l-dropdown>`,
    open: {
      html: `
        <l-dropdown style="--show-duration: 0; --hide-duration: 0">
          <button slot="trigger">Menu</button>
          <l-dropdown-label>Fruit</l-dropdown-label>
          <l-dropdown-item>Apple</l-dropdown-item>
          <l-dropdown-item>Banana</l-dropdown-item>
          <l-dropdown-item disabled>Cherry</l-dropdown-item>
          <l-dropdown-item type="checkbox">Notifications</l-dropdown-item>
        </l-dropdown>`,
      setup: (host) => openOverlay(host.querySelector('l-dropdown')!),
    },
  },
});
