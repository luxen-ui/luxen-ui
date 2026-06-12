import { defineA11yFixture } from '../../support/a11y-fixture.js';

// l-tree (APG tree view): items carry role="treeitem" + aria-expanded/selected/
// level/posinset/setsize. The expanded state reveals nested items in the a11y
// tree, so check both.
export default defineA11yFixture({
  name: 'tree',
  covers: ['tree-item'],
  states: {
    collapsed: `
      <l-tree aria-label="Files">
        <l-tree-item>Documents
          <l-tree-item>Photos</l-tree-item>
        </l-tree-item>
        <l-tree-item>Downloads</l-tree-item>
      </l-tree>`,
    expanded: {
      html: `
        <l-tree aria-label="Files">
          <l-tree-item>Documents
            <l-tree-item>Photos</l-tree-item>
          </l-tree-item>
          <l-tree-item>Downloads</l-tree-item>
        </l-tree>`,
      setup: async (host) => {
        const branch = host.querySelector<HTMLElement & { expanded?: boolean }>('l-tree-item');
        if (branch) branch.expanded = true;
        await new Promise((r) => setTimeout(r, 0));
      },
    },
  },
});
