import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tree/index.js';
import '../../src/html/elements/tree-item/index.js';
import type { Tree } from '../../src/html/elements/tree/tree.js';
import type { TreeItem } from '../../src/html/elements/tree-item/tree-item.js';

// These tests drive the tree the way a person would — clicking rows, pressing
// keys — and assert what a user (or their screen reader, or their CSS) would
// observe: focus, selection, what the accessibility tree exposes, and whether
// roles/states stay targetable by selectors. They deliberately avoid asserting
// internal wiring.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-tree');
  await customElements.whenDefined('l-tree-item');
  await settle();
  return host;
}

async function settle() {
  const tree = host.querySelector('l-tree') as Tree & { updateComplete: Promise<unknown> };
  await tree.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await Promise.all(
    [...host.querySelectorAll<TreeItem>('l-tree-item')].map(
      (el) => (el as TreeItem & { updateComplete: Promise<unknown> }).updateComplete,
    ),
  );
  await tree.updateComplete;
}

const item = (id: string) => host.querySelector<TreeItem>(`#${id}`)!;
const treeitem = (name: string, opts?: Record<string, unknown>) =>
  page.getByRole('treeitem', { name, ...opts });

/** Whether the accessibility-tree query currently resolves to an element. The
 * DOM is already settled, so a plain check is enough (no auto-retry needed). */
const present = (locator: ReturnType<typeof page.getByRole>) => locator.elements().length > 0;

/** Move focus to an item (as Tab would) and press a key on it. */
function press(el: HTMLElement, key: string) {
  el.focus();
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }),
  );
}

const FILES = `
  <l-tree aria-label="Files">
    <l-tree-item id="docs">Documents
      <l-tree-item id="photos">Photos
        <l-tree-item id="beach">beach.jpg</l-tree-item>
        <l-tree-item id="mountain">mountain.jpg</l-tree-item>
      </l-tree-item>
      <l-tree-item id="invoices">Invoices
        <l-tree-item id="jan">january.pdf</l-tree-item>
      </l-tree-item>
    </l-tree-item>
    <l-tree-item id="downloads">Downloads</l-tree-item>
  </l-tree>
`;

describe('A screen reader perceives a labelled, hierarchical tree', () => {
  it('reads the container as a tree with the given name', async () => {
    await mount(FILES);
    expect(present(page.getByRole('tree', { name: 'Files' }))).toBe(true);
    expect(present(treeitem('Documents'))).toBe(true);
  });

  it('can take its name from another element via aria-labelledby', async () => {
    await mount(`
      <h2 id="lbl">Project files</h2>
      <l-tree aria-labelledby="lbl"><l-tree-item>a</l-tree-item></l-tree>
    `);
    expect(present(page.getByRole('tree', { name: 'Project files' }))).toBe(true);
  });

  it("hides a branch's children until it is opened, then groups them under it", async () => {
    await mount(FILES);
    // Collapsed: nested items are not announced at all.
    expect(present(treeitem('Photos'))).toBe(false);

    item('docs').expanded = true;
    await settle();
    expect(present(page.getByRole('group'))).toBe(true);
    expect(present(treeitem('Photos'))).toBe(true);
  });

  it('announces how deep each item sits and where it falls among its siblings', async () => {
    await mount(FILES);
    item('docs').expanded = true;
    item('photos').expanded = true;
    await settle();
    // The screen reader says e.g. "Documents, level 1" and "Photos, level 2".
    expect(present(treeitem('Documents', { level: 1 }))).toBe(true);
    expect(present(treeitem('Photos', { level: 2 }))).toBe(true);
    expect(present(treeitem('beach.jpg', { level: 3 }))).toBe(true);
    // …and "1 of 2" for the position within the set (no role filter for these).
    expect(item('beach').getAttribute('aria-posinset')).toBe('1');
    expect(item('beach').getAttribute('aria-setsize')).toBe('2');
  });

  it('never describes a leaf item as expandable', async () => {
    await mount(FILES);
    expect(item('downloads').hasAttribute('aria-expanded')).toBe(false);
    expect(item('docs').getAttribute('aria-expanded')).toBe('false');
  });
});

describe('A keyboard user can move through the tree', () => {
  it('moves focus to the next and previous item with the down and up arrows', async () => {
    await mount(FILES);
    press(item('docs'), 'ArrowDown');
    await settle();
    expect(document.activeElement).toBe(item('downloads'));

    press(item('downloads'), 'ArrowUp');
    await settle();
    expect(document.activeElement).toBe(item('docs'));
  });

  it('jumps to the first and last item with Home and End', async () => {
    await mount(FILES);
    press(item('downloads'), 'End');
    await settle();
    expect(document.activeElement).toBe(item('downloads'));

    press(item('downloads'), 'Home');
    await settle();
    expect(document.activeElement).toBe(item('docs'));
  });

  it('is reached by a single Tab — only one item is in the tab order', async () => {
    await mount(FILES);
    const tabbable = () =>
      [...host.querySelectorAll<TreeItem>('l-tree-item')].filter((i) => i.tabIndex === 0);
    expect(tabbable()).toEqual([item('docs')]);

    press(item('docs'), 'ArrowDown');
    await settle();
    // The tab stop follows focus, so Tab still lands on the tree exactly once.
    expect(tabbable()).toEqual([item('downloads')]);
  });
});

describe('A keyboard user can open and close branches', () => {
  it('opens a branch with the right arrow and closes it with the left arrow', async () => {
    await mount(FILES);
    press(item('docs'), 'ArrowRight');
    await settle();
    expect(present(treeitem('Documents', { expanded: true }))).toBe(true);

    press(item('docs'), 'ArrowLeft');
    await settle();
    expect(present(treeitem('Documents', { expanded: false }))).toBe(true);
  });

  it("reveals a branch's children when the chevron is clicked", async () => {
    await mount(FILES);
    item('docs').shadowRoot!.querySelector<HTMLElement>('[part="expand-button"]')!.click();
    await settle();
    expect(present(treeitem('Photos'))).toBe(true);
  });
});

describe('A user selecting one item at a time', () => {
  it('selects the clicked item and clears the previous selection', async () => {
    await mount(FILES);
    item('downloads').click();
    await settle();
    expect(present(treeitem('Downloads', { selected: true }))).toBe(true);

    item('docs').click();
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(true);
    expect(present(treeitem('Downloads', { selected: true }))).toBe(false);
  });
});

describe('A user selecting several items at once', () => {
  const TREE = `<l-tree aria-label="F" selection="multiple">
    <l-tree-item id="docs">Documents
      <l-tree-item id="a">a</l-tree-item>
      <l-tree-item id="b">b</l-tree-item>
    </l-tree-item>
  </l-tree>`;

  it('selects a branch together with all of its descendants', async () => {
    await mount(TREE);
    item('docs').expanded = true;
    await settle();
    item('docs').click();
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(true);
    expect(present(treeitem('a', { selected: true }))).toBe(true);
    expect(present(treeitem('b', { selected: true }))).toBe(true);
  });

  it('shows a parent as partially selected when only some children are', async () => {
    await mount(TREE);
    item('docs').expanded = true;
    await settle();
    item('a').click();
    await settle();
    expect(item('docs').hasAttribute('indeterminate')).toBe(true);
    expect(present(treeitem('Documents', { selected: true }))).toBe(false);
  });

  it('does not expose the decorative checkbox to a screen reader', async () => {
    await mount(TREE);
    // Selection is conveyed by aria-selected on the row, not a duplicate checkbox.
    expect(page.getByRole('checkbox').elements()).toHaveLength(0);
  });
});

describe('A user selecting parents and children independently', () => {
  it('selects a parent without selecting its children', async () => {
    await mount(`<l-tree aria-label="F" selection="multiple" independent>
      <l-tree-item id="docs">Documents<l-tree-item id="a">a</l-tree-item></l-tree-item>
    </l-tree>`);
    item('docs').expanded = true;
    await settle();
    item('docs').click();
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(true);
    expect(present(treeitem('a', { selected: true }))).toBe(false);
  });
});

describe('A user restricting selection to leaves', () => {
  it('selects a leaf but only expands a branch', async () => {
    await mount(`<l-tree aria-label="F" selection="leaf">
      <l-tree-item id="docs">Documents<l-tree-item id="a">a</l-tree-item></l-tree-item>
    </l-tree>`);
    item('docs').click();
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(false);
    expect(present(treeitem('Documents', { expanded: true }))).toBe(true);

    item('a').click();
    await settle();
    expect(present(treeitem('a', { selected: true }))).toBe(true);
  });
});

describe('A disabled item', () => {
  it('cannot be selected and is announced as disabled', async () => {
    await mount(`<l-tree aria-label="F"><l-tree-item id="d" disabled>Nope</l-tree-item></l-tree>`);
    expect(present(treeitem('Nope', { disabled: true }))).toBe(true);
    item('d').click();
    await settle();
    expect(present(treeitem('Nope', { selected: true }))).toBe(false);
  });
});

describe('A branch that loads its children on demand', () => {
  it('asks for its children the first time a keyboard user opens it', async () => {
    await mount(`<l-tree aria-label="F"><l-tree-item id="lazy" lazy>Remote</l-tree-item></l-tree>`);
    let requested = 0;
    item('lazy').addEventListener('lazy-load', () => requested++);

    press(item('lazy'), 'ArrowRight'); // open with the keyboard
    await settle();
    expect(requested).toBe(1);

    press(item('lazy'), 'ArrowLeft'); // closing must not ask again
    await settle();
    expect(requested).toBe(1);
  });

  it('shows a busy state while its children load', async () => {
    await mount(`<l-tree aria-label="F"><l-tree-item id="lazy" lazy>Remote</l-tree-item></l-tree>`);
    // The consumer flips `loading` on while fetching; the row reports it as busy.
    item('lazy').loading = true;
    await settle();
    expect(item('lazy').getAttribute('aria-busy')).toBe('true');
  });
});

describe('Roles and states stay targetable by CSS and test selectors', () => {
  it('finds every item with a [role="treeitem"] selector', async () => {
    await mount(FILES);
    // The migration footgun the RFC fixes: this used to return nothing.
    expect(host.querySelectorAll('[role="treeitem"]')).toHaveLength(7);
  });

  it('finds the selected row with an [aria-selected] selector after a click', async () => {
    await mount(FILES);
    item('downloads').click();
    await settle();
    expect(host.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
    expect(host.querySelector('[aria-selected="true"]')).toBe(item('downloads'));
  });

  it('lets an author override the role', async () => {
    await mount(`<l-tree aria-label="F"><l-tree-item id="x" role="none">X</l-tree-item></l-tree>`);
    expect(item('x').getAttribute('role')).toBe('none');
  });

  it('advertises a multi-select tree as multi-selectable', async () => {
    await mount(
      `<l-tree aria-label="F" selection="multiple"><l-tree-item>a</l-tree-item></l-tree>`,
    );
    expect(host.querySelector('l-tree')!.getAttribute('aria-multiselectable')).toBe('true');
  });
});
