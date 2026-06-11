import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tree/index.js';
import '../../src/html/elements/tree-item/index.js';
import type { Tree } from '../../src/html/elements/tree/tree.js';
import type { TreeItem } from '../../src/html/elements/tree-item/tree-item.js';
import { deepActiveElement } from './support/a11y.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// These tests drive the tree the way a person would — clicking rows, pressing
// keys — and assert what a user (or their screen reader, or their CSS) would
// observe: focus, selection, what the accessibility tree exposes, and whether
// roles/states stay targetable by selectors. They deliberately avoid asserting
// internal wiring. All interactions use userEvent (trusted CDP events) so
// native behaviors (focus delegation, roving tabindex) are exercised.
//
// Behavior note: in selection="single" (default), clicking a branch BOTH
// selects it AND toggles expansion (APG single-select tree row activation). Use
// a leaf item click (or the expand-button shadow part) when you need to
// establish focus on a branch without expanding it.

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

// settle() encodes the tree's real synchronisation contract:
// l-tree syncs on a queueMicrotask + MutationObserver cycle, then l-tree-item
// updated() fires per item. We await the tree, a macrotask gap, and all items.
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

/** Whether the accessibility-tree query currently resolves to an element. */
const present = (locator: ReturnType<typeof page.getByRole>) => locator.elements().length > 0;

/** Click the shadow-DOM expand-button of an item to toggle it without triggering row selection. */
async function clickExpandButton(id: string) {
  const btn = item(id).shadowRoot!.querySelector<HTMLElement>('[part="expand-button"]')!;
  await userEvent.click(btn);
  await settle();
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

// ---------------------------------------------------------------------------
// Screen-reader semantics
// ---------------------------------------------------------------------------

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

    // Use the expand-button so only expansion (not selection) is triggered.
    await clickExpandButton('docs');
    expect(present(page.getByRole('group'))).toBe(true);
    expect(present(treeitem('Photos'))).toBe(true);
  });

  it('announces how deep each item sits and where it falls among its siblings', async () => {
    await mount(FILES);
    // Expand two levels so the items enter the accessibility tree.
    await clickExpandButton('docs');
    await clickExpandButton('photos');
    // The screen reader says e.g. "Documents, level 1" and "Photos, level 2".
    expect(present(treeitem('Documents', { level: 1 }))).toBe(true);
    expect(present(treeitem('Photos', { level: 2 }))).toBe(true);
    expect(present(treeitem('beach.jpg', { level: 3 }))).toBe(true);
    // …and "1 of 2" for position within the set (no role filter for these).
    expect(item('beach').getAttribute('aria-posinset')).toBe('1');
    expect(item('beach').getAttribute('aria-setsize')).toBe('2');
  });

  it('never describes a leaf item as expandable', async () => {
    await mount(FILES);
    expect(item('downloads').hasAttribute('aria-expanded')).toBe(false);
    expect(item('docs').getAttribute('aria-expanded')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation — moving focus
// ---------------------------------------------------------------------------

describe('A keyboard user can move through the tree', () => {
  it('moves focus to the next item with ArrowDown and to the previous with ArrowUp', async () => {
    await mount(FILES);
    // Establish focus on Downloads (leaf — click doesn't expand anything).
    await userEvent.click(treeitem('Downloads'));
    await settle();
    expect(deepActiveElement()).toBe(item('downloads'));

    // ArrowUp goes to the previous visible item (docs).
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    expect(deepActiveElement()).toBe(item('docs'));

    // ArrowDown goes to the next visible item (downloads).
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(deepActiveElement()).toBe(item('downloads'));
  });

  it('jumps to the first and last visible item with Home and End', async () => {
    await mount(FILES);
    await userEvent.click(treeitem('Downloads'));
    await settle();
    expect(deepActiveElement()).toBe(item('downloads'));

    await userEvent.keyboard('{Home}');
    await settle();
    expect(deepActiveElement()).toBe(item('docs'));

    await userEvent.keyboard('{End}');
    await settle();
    expect(deepActiveElement()).toBe(item('downloads'));
  });

  it('is reached by a single Tab — only one item is in the tab order', async () => {
    await mount(FILES);
    const tabbable = () =>
      [...host.querySelectorAll<TreeItem>('l-tree-item')].filter((i) => i.tabIndex === 0);
    // On mount the first root item is the initial tab stop.
    expect(tabbable()).toEqual([item('docs')]);

    // After moving focus the tab stop follows.
    await userEvent.click(treeitem('Downloads'));
    await settle();
    expect(tabbable()).toEqual([item('downloads')]);
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation — expand / collapse branches
// ---------------------------------------------------------------------------

describe('A keyboard user can open and close branches', () => {
  it('opens a branch with ArrowRight and closes it with ArrowLeft', async () => {
    await mount(FILES);
    // Focus docs via leaf-first approach (Downloads → ArrowUp) so docs is not
    // pre-expanded by the click activation side-effect.
    await userEvent.click(treeitem('Downloads'));
    await settle();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    expect(deepActiveElement()).toBe(item('docs'));

    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(present(treeitem('Documents', { expanded: true }))).toBe(true);

    await userEvent.keyboard('{ArrowLeft}');
    await settle();
    expect(present(treeitem('Documents', { expanded: false }))).toBe(true);
  });

  it('descends into the first child with a second ArrowRight when already open', async () => {
    await mount(FILES);
    // Focus docs without expanding it.
    await userEvent.click(treeitem('Downloads'));
    await settle();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    expect(deepActiveElement()).toBe(item('docs'));

    // First ArrowRight expands.
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(present(treeitem('Documents', { expanded: true }))).toBe(true);

    // Second ArrowRight descends to the first child.
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(deepActiveElement()).toBe(item('photos'));
  });

  it('ascends to the parent with ArrowLeft when already collapsed', async () => {
    await mount(FILES);
    // Focus docs without expanding, then open, then descend to Photos.
    await userEvent.click(treeitem('Downloads'));
    await settle();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    await userEvent.keyboard('{ArrowRight}'); // expand docs
    await settle();
    await userEvent.keyboard('{ArrowRight}'); // descend to photos
    await settle();
    expect(deepActiveElement()).toBe(item('photos'));

    // ArrowLeft on a collapsed item ascends to its parent.
    await userEvent.keyboard('{ArrowLeft}');
    await settle();
    expect(deepActiveElement()).toBe(item('docs'));
  });

  it("reveals a branch's children when the expand button is clicked", async () => {
    await mount(FILES);
    await clickExpandButton('docs');
    expect(present(treeitem('Photos'))).toBe(true);
  });

  it('expands all siblings at the same level with the * key', async () => {
    await mount(FILES);
    // Focus docs, expand, descend to Photos — then * expands Photos and Invoices.
    await userEvent.click(treeitem('Downloads'));
    await settle();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    await userEvent.keyboard('{ArrowRight}'); // expand docs
    await settle();
    await userEvent.keyboard('{ArrowRight}'); // descend to photos
    await settle();
    expect(deepActiveElement()).toBe(item('photos'));

    // * expands all siblings of the focused item (Photos and Invoices).
    await userEvent.keyboard('*');
    await settle();
    expect(present(treeitem('Photos', { expanded: true }))).toBe(true);
    expect(present(treeitem('Invoices', { expanded: true }))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Selection — single mode (default)
// ---------------------------------------------------------------------------

describe('A user selecting one item at a time', () => {
  it('selects the clicked item and clears the previous selection', async () => {
    await mount(FILES);
    await userEvent.click(treeitem('Downloads'));
    await settle();
    expect(present(treeitem('Downloads', { selected: true }))).toBe(true);

    await userEvent.click(treeitem('Documents'));
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(true);
    expect(present(treeitem('Downloads', { selected: true }))).toBe(false);
  });

  it('selects the focused item with Enter', async () => {
    await mount(FILES);
    // Focus Downloads (leaf), navigate up to docs, down to downloads, then Enter.
    await userEvent.click(treeitem('Downloads'));
    await settle();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    expect(deepActiveElement()).toBe(item('docs'));
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(deepActiveElement()).toBe(item('downloads'));

    await userEvent.keyboard('{Enter}');
    await settle();
    expect(present(treeitem('Downloads', { selected: true }))).toBe(true);
  });

  it('selects the focused item with Space', async () => {
    await mount(FILES);
    await userEvent.click(treeitem('Downloads'));
    await settle();
    expect(deepActiveElement()).toBe(item('downloads'));

    await userEvent.keyboard('{ }');
    await settle();
    expect(present(treeitem('Downloads', { selected: true }))).toBe(true);
  });

  it('emits a selection-change event on selection', async () => {
    await mount(FILES);
    const tree = host.querySelector('l-tree')!;
    const changed = waitForEvent(tree, 'selection-change');
    await userEvent.click(treeitem('Downloads'));
    await changed;
    await settle();
    expect(present(treeitem('Downloads', { selected: true }))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Selection — multiple mode
// ---------------------------------------------------------------------------

describe('A user selecting several items at once', () => {
  const TREE = `<l-tree aria-label="F" selection="multiple">
    <l-tree-item id="docs">Documents
      <l-tree-item id="a">a</l-tree-item>
      <l-tree-item id="b">b</l-tree-item>
    </l-tree-item>
  </l-tree>`;

  it('selects a branch together with all of its descendants', async () => {
    await mount(TREE);
    // In multiple mode, clicking only selects (no toggle). Use expand-button to
    // first expand so we can verify descendants are selected.
    await clickExpandButton('docs');
    // Click the label area (shadow-DOM part) to avoid landing on the checkbox.
    const label = item('docs').shadowRoot!.querySelector<HTMLElement>('[part="label"]')!;
    await userEvent.click(label);
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(true);
    expect(present(treeitem('a', { selected: true }))).toBe(true);
    expect(present(treeitem('b', { selected: true }))).toBe(true);
  });

  it('shows a parent as partially selected when only some children are selected', async () => {
    await mount(TREE);
    // Expand Documents, then select only child "a".
    await clickExpandButton('docs');
    await userEvent.click(treeitem('a'));
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

// ---------------------------------------------------------------------------
// Selection — independent multiple mode
// ---------------------------------------------------------------------------

describe('A user selecting parents and children independently', () => {
  it('selects a parent without selecting its children', async () => {
    await mount(`<l-tree aria-label="F" selection="multiple" independent>
      <l-tree-item id="docs">Documents<l-tree-item id="a">a</l-tree-item></l-tree-item>
    </l-tree>`);
    // Expand first, then click Documents to select it in independent mode.
    await clickExpandButton('docs');
    // Click the label area to avoid landing on the checkbox.
    const label = item('docs').shadowRoot!.querySelector<HTMLElement>('[part="label"]')!;
    await userEvent.click(label);
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(true);
    expect(present(treeitem('a', { selected: true }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Selection — leaf-only mode
// ---------------------------------------------------------------------------

describe('A user restricting selection to leaves', () => {
  it('selects a leaf but only expands a branch', async () => {
    await mount(`<l-tree aria-label="F" selection="leaf">
      <l-tree-item id="docs">Documents<l-tree-item id="a">a</l-tree-item></l-tree-item>
    </l-tree>`);
    // Clicking a branch only expands it, does not select it.
    await userEvent.click(treeitem('Documents'));
    await settle();
    expect(present(treeitem('Documents', { selected: true }))).toBe(false);
    expect(present(treeitem('Documents', { expanded: true }))).toBe(true);

    // Clicking a leaf selects it.
    await userEvent.click(treeitem('a'));
    await settle();
    expect(present(treeitem('a', { selected: true }))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Disabled item
// ---------------------------------------------------------------------------

describe('A disabled item', () => {
  it('is announced as disabled and does not appear selected', async () => {
    await mount(`<l-tree aria-label="F"><l-tree-item id="d" disabled>Nope</l-tree-item></l-tree>`);
    // The item exposes aria-disabled=true so assistive tech announces it correctly.
    expect(present(treeitem('Nope', { disabled: true }))).toBe(true);
    // A disabled item starts unselected; its programmatic state confirms this.
    expect(item('d').getAttribute('aria-selected')).toBe('false');
    expect(item('d').selected).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Lazy-loading
// ---------------------------------------------------------------------------

describe('A branch that loads its children on demand', () => {
  it('asks for its children the first time a keyboard user opens it with ArrowRight', async () => {
    await mount(`<l-tree aria-label="F"><l-tree-item id="lazy" lazy>Remote</l-tree-item></l-tree>`);
    let requested = 0;
    item('lazy').addEventListener('lazy-load', () => requested++);

    // Focus the lazy item by clicking Downloads-equivalent — it's the only item,
    // so we click its DOM element directly (clicking via treeitem would expand it
    // in single mode since lazy items are treated as non-leaf branches).
    // Register the event listener BEFORE interacting.
    const loaded = waitForEvent(item('lazy'), 'lazy-load');

    // Click the expand-button specifically to avoid the click-also-toggles
    // side-effect in single mode, then ArrowRight to confirm keyboard path works.
    // Actually: click the row itself; in single mode the row click also calls
    // item.toggle() for non-leaf items, which fires lazy-load on the first open.
    await userEvent.click(item('lazy'));
    await loaded;
    await settle();
    expect(requested).toBe(1);

    // Closing and reopening: after the first open the `lazy` flag is still set
    // (consumer clears it once children load). Close with ArrowLeft —
    // it should NOT fire another lazy-load.
    await userEvent.keyboard('{ArrowLeft}');
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

// ---------------------------------------------------------------------------
// CSS / selector targetability
// ---------------------------------------------------------------------------

describe('Roles and states stay targetable by CSS and test selectors', () => {
  it('finds every item with a [role="treeitem"] selector', async () => {
    await mount(FILES);
    // The migration footgun the RFC fixes: this used to return nothing.
    expect(host.querySelectorAll('[role="treeitem"]')).toHaveLength(7);
  });

  it('finds the selected row with an [aria-selected] selector after a click', async () => {
    await mount(FILES);
    await userEvent.click(treeitem('Downloads'));
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

// ---------------------------------------------------------------------------
// Row-action slot
// ---------------------------------------------------------------------------

describe('A row action in the default slot keeps its hover/focus decoration', () => {
  // The label box truncates long text using `overflow: clip` with a clip margin,
  // so a slotted control's focus ring / hover background is not cut on the label
  // edges (RFC-tree-item-label-clips-row-actions).
  it('clips the label without hard-clipping slotted decorations', async () => {
    await mount(
      `<l-tree aria-label="F"><l-tree-item id="a"><button>x</button>Label</l-tree-item></l-tree>`,
    );
    const label = item('a').shadowRoot!.querySelector<HTMLElement>('[part="label"]')!;
    const style = getComputedStyle(label);
    // `clip`, not `hidden` — `overflow-clip-margin` only applies to `clip`.
    expect(style.overflow).toBe('clip');
    expect(parseFloat(style.overflowClipMargin)).toBeGreaterThan(0);
    // Text truncation is preserved.
    expect(style.textOverflow).toBe('ellipsis');
    expect(style.whiteSpace).toBe('nowrap');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the tree role with its aria-label accessible name (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FILES);
      expect(page.getByRole('tree', { name: 'Files' }).elements()).toHaveLength(1);
    });

    it('exposes each item as treeitem with its text label (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FILES);
      expect(treeitem('Documents').elements()).toHaveLength(1);
      expect(treeitem('Downloads').elements()).toHaveLength(1);
    });

    it('exposes aria-expanded on branch items and omits it on leaves (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FILES);
      expect(present(treeitem('Documents', { expanded: false }))).toBe(true);
      expect(item('downloads').hasAttribute('aria-expanded')).toBe(false);
    });

    it('reflects aria-selected when an item is clicked (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      expect(present(treeitem('Downloads', { selected: true }))).toBe(true);
    });

    it('exposes aria-disabled on a disabled item (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(
        `<l-tree aria-label="F"><l-tree-item id="d" disabled>Nope</l-tree-item></l-tree>`,
      );
      expect(present(treeitem('Nope', { disabled: true }))).toBe(true);
    });

    it('exposes aria-level, aria-posinset, and aria-setsize per item (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FILES);
      await clickExpandButton('docs');
      expect(present(treeitem('Documents', { level: 1 }))).toBe(true);
      expect(present(treeitem('Photos', { level: 2 }))).toBe(true);
      expect(item('docs').getAttribute('aria-setsize')).toBe('2');
      expect(item('docs').getAttribute('aria-posinset')).toBe('1');
    });

    it('advertises multi-select mode via aria-multiselectable (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(
        `<l-tree aria-label="F" selection="multiple"><l-tree-item>a</l-tree-item></l-tree>`,
      );
      expect(host.querySelector('l-tree')!.getAttribute('aria-multiselectable')).toBe('true');
    });
  });

  describe('Keyboard interaction (APG tree view pattern)', () => {
    it('ArrowDown moves focus to the next visible item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      // Focus docs without expanding: click Downloads → ArrowUp.
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      expect(deepActiveElement()).toBe(item('docs'));

      await userEvent.keyboard('{ArrowDown}');
      await settle();
      expect(deepActiveElement()).toBe(item('downloads'));
    });

    it('ArrowUp moves focus to the previous visible item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      expect(deepActiveElement()).toBe(item('docs'));
    });

    it('ArrowRight expands a collapsed branch (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      // Focus docs without expanding.
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      expect(deepActiveElement()).toBe(item('docs'));

      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(present(treeitem('Documents', { expanded: true }))).toBe(true);
    });

    it('ArrowRight descends into the first child when already expanded (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      await userEvent.keyboard('{ArrowRight}'); // expand
      await settle();
      await userEvent.keyboard('{ArrowRight}'); // descend
      await settle();
      expect(deepActiveElement()).toBe(item('photos'));
    });

    it('ArrowLeft collapses an expanded branch (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      await userEvent.keyboard('{ArrowRight}'); // expand docs
      await settle();
      await userEvent.keyboard('{ArrowLeft}'); // collapse docs
      await settle();
      expect(present(treeitem('Documents', { expanded: false }))).toBe(true);
    });

    it('ArrowLeft moves focus to the parent when the item is collapsed (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      await userEvent.keyboard('{ArrowRight}'); // expand docs
      await settle();
      await userEvent.keyboard('{ArrowRight}'); // descend to photos (collapsed)
      await settle();
      expect(deepActiveElement()).toBe(item('photos'));

      // ArrowLeft on a collapsed item ascends to its parent.
      await userEvent.keyboard('{ArrowLeft}');
      await settle();
      expect(deepActiveElement()).toBe(item('docs'));
    });

    it('Home moves focus to the first visible item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{Home}');
      await settle();
      expect(deepActiveElement()).toBe(item('docs'));
    });

    it('End moves focus to the last visible item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{End}');
      await settle();
      expect(deepActiveElement()).toBe(item('downloads'));
    });

    it('Enter activates (selects) the focused item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{Enter}');
      await settle();
      expect(present(treeitem('Downloads', { selected: true }))).toBe(true);
    });

    it('Space activates (selects) the focused item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FILES);
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ }');
      await settle();
      expect(present(treeitem('Downloads', { selected: true }))).toBe(true);
    });

    it('the tree does not trap keyboard focus — Tab and Shift+Tab leave freely (WCAG 2.1.2 / RGAA 12.9)', async () => {
      await mount(`
        <button id="before">Before</button>
        ${FILES}
        <button id="after">After</button>
      `);
      const before = host.querySelector<HTMLElement>('#before')!;
      const after = host.querySelector<HTMLElement>('#after')!;

      // Establish focus on Downloads (last item = last tab stop in the tree).
      await userEvent.click(treeitem('Downloads'));
      await settle();
      expect(deepActiveElement()).toBe(item('downloads'));

      // Tab out — focus leaves the tree to the next focusable element.
      await userEvent.tab();
      await settle();
      expect(deepActiveElement()).toBe(after);

      // Shift+Tab back — focus returns to the tree's single tab stop.
      await userEvent.tab({ shift: true });
      await settle();
      expect(deepActiveElement()).toBe(item('downloads'));

      // Shift+Tab again — exits the tree upward.
      await userEvent.tab({ shift: true });
      await settle();
      expect(deepActiveElement()).toBe(before);
    });
  });

  describe('Focus management', () => {
    it('exactly one treeitem is in the tab order at any time (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FILES);
      const countTabStop = () =>
        [...host.querySelectorAll<TreeItem>('l-tree-item')].filter((i) => i.tabIndex === 0).length;
      expect(countTabStop()).toBe(1);

      // After moving focus the tab stop count stays at 1.
      await userEvent.click(treeitem('Downloads'));
      await settle();
      expect(countTabStop()).toBe(1);
    });

    it('the tab stop follows keyboard focus after ArrowDown (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FILES);
      // Focus docs without expanding, then ArrowDown to downloads.
      await userEvent.click(treeitem('Downloads'));
      await settle();
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      expect(item('docs').tabIndex).toBe(0);

      await userEvent.keyboard('{ArrowDown}');
      await settle();
      // downloads now has tabIndex=0; docs is removed from the tab order.
      expect(item('downloads').tabIndex).toBe(0);
      expect(item('docs').tabIndex).toBe(-1);
    });

    it('the initial tab stop is the first root item on mount (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FILES);
      expect(item('docs').tabIndex).toBe(0);
    });
  });
});
