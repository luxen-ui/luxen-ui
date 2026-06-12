import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/dropdown/index.js';
import '../../src/html/elements/dropdown-item/index.js';
import '../../src/html/elements/dropdown-label/index.js';
import type { Dropdown } from '../../src/html/elements/dropdown/dropdown.js';
import { DropdownSelectEvent } from '../../src/html/elements/dropdown/dropdown.js';
import type { DropdownItem } from '../../src/html/elements/dropdown-item/dropdown-item.js';
import { deepActiveElement } from './support/a11y.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// These tests drive l-dropdown the way a person would — clicking the trigger,
// pressing keys, clicking items — and assert what a user (or their screen
// reader, or their CSS) observes: open state, aria-expanded, focus, selection
// events, and checkbox state. All interactions use userEvent (trusted CDP
// events) so native behaviors like popover light-dismiss are exercised.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-dropdown');
  await customElements.whenDefined('l-dropdown-item');
  await settle();
  return host;
}

async function settle() {
  const dd = host.querySelector<Dropdown & { updateComplete: Promise<unknown> }>('l-dropdown');
  if (dd) {
    await dd.updateComplete;
    await Promise.all(
      [...host.querySelectorAll<DropdownItem>('l-dropdown-item')].map(
        (el) => (el as DropdownItem & { updateComplete: Promise<unknown> }).updateComplete,
      ),
    );
    await dd.updateComplete;
  }
  await new Promise((r) => setTimeout(r, 0));
}

/** Wait for rAF + macrotask — gives the element time to schedule initial focus after keyboard open. */
async function animFrame() {
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 0));
}

/**
 * Click to open, Escape to close (focus returns to trigger), then press a key.
 * This is the reliable user-driven way to get trigger focus before keyboard tests:
 * the Escape handler restores focus to the trigger so we get deterministic focus placement.
 */
async function openViaKey(key: string): Promise<void> {
  const shown = waitForEvent(el(), 'after-show');
  await userEvent.click(menuTrigger());
  await shown;
  await settle();
  const hidden = waitForEvent(el(), 'after-hide');
  await userEvent.keyboard('{Escape}');
  await hidden;
  await settle();
  // Trigger now has focus from the Escape handler — press the opening key
  const shown2 = waitForEvent(el(), 'after-show');
  await userEvent.keyboard(key);
  await shown2;
  await animFrame();
}

const el = () => host.querySelector<Dropdown>('l-dropdown')!;
const item = (id: string) => host.querySelector<DropdownItem>(`#${id}`)!;
const panel = () => el().shadowRoot!.querySelector<HTMLElement>('[popover]')!;
const trigger = () => el().querySelector<HTMLElement>('[slot="trigger"]')!;
const isOpen = () => panel().matches(':popover-open');

// Locator helpers (pierce shadow DOM via Playwright engine)
const menuTrigger = () => page.getByRole('button', { name: 'Menu' });
const menuItem = (name: string) => page.getByRole('menuitem', { name, disabled: false });
const disabledMenuItem = (name: string) => page.getByRole('menuitem', { name, disabled: true });
const checkboxItem = (name: string) => page.getByRole('menuitemcheckbox', { name });

const FIXTURE = `
  <l-dropdown style="--show-duration: 0; --hide-duration: 0">
    <button slot="trigger">Menu</button>
    <l-dropdown-item id="apple">Apple</l-dropdown-item>
    <l-dropdown-item id="banana">Banana</l-dropdown-item>
    <l-dropdown-item id="cherry" disabled>Cherry</l-dropdown-item>
    <l-dropdown-item id="check" type="checkbox">Notifications</l-dropdown-item>
  </l-dropdown>
`;

// ---------------------------------------------------------------------------
// Opening and closing the menu
// ---------------------------------------------------------------------------

describe('Opening and closing the menu', () => {
  it('opens when the trigger is clicked and marks aria-expanded on the trigger', async () => {
    await mount(FIXTURE);
    const ready = waitForEvent(el(), 'after-show');
    await userEvent.click(menuTrigger());
    await ready;
    await settle();
    expect(isOpen()).toBe(true);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on a second trigger click and clears aria-expanded', async () => {
    await mount(FIXTURE);
    const ready = waitForEvent(el(), 'after-show');
    await userEvent.click(menuTrigger());
    await ready;
    await settle();
    const hidden = waitForEvent(el(), 'after-hide');
    await userEvent.click(menuTrigger());
    await hidden;
    await settle();
    expect(isOpen()).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('respects a canceled show event and stays closed', async () => {
    await mount(FIXTURE);
    el().addEventListener('show', (e) => e.preventDefault(), { once: true });
    el().show();
    await settle();
    expect(el().open).toBe(false);
    expect(isOpen()).toBe(false);
  });

  it('ignores trigger clicks when disabled', async () => {
    await mount(`
      <l-dropdown disabled style="--show-duration: 0; --hide-duration: 0">
        <button slot="trigger">Menu</button>
        <l-dropdown-item id="apple">Apple</l-dropdown-item>
      </l-dropdown>
    `);
    await userEvent.click(menuTrigger());
    await settle();
    expect(el().open).toBe(false);
    expect(isOpen()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

describe('A keyboard user can navigate the menu', () => {
  it('opens on ArrowDown and focuses the first enabled item', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    expect(isOpen()).toBe(true);
    expect(item('apple').shadowRoot!.activeElement).not.toBeNull();
  });

  it('opens on ArrowUp and focuses the last enabled item (skipping disabled)', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowUp}');
    expect(isOpen()).toBe(true);
    // "Notifications" (type="checkbox") is the last enabled item; "Cherry" is disabled
    expect(item('check').shadowRoot!.activeElement).not.toBeNull();
  });

  it('moves focus from Apple to Banana with ArrowDown', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    // At Apple — press ArrowDown to move to Banana
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(item('banana').shadowRoot!.activeElement).not.toBeNull();
  });

  it('skips disabled Cherry when arrowing down from Banana and reaches Notifications', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    // At Apple — ArrowDown twice: Apple→Banana, Banana→Notifications (skips Cherry)
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(item('banana').shadowRoot!.activeElement).not.toBeNull();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(item('check').shadowRoot!.activeElement).not.toBeNull();
  });

  it('wraps from the last enabled item back to Apple with ArrowDown', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}'); // Apple→Banana
    await settle();
    await userEvent.keyboard('{ArrowDown}'); // Banana→Notifications
    await settle();
    // Wrap back to Apple
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(item('apple').shadowRoot!.activeElement).not.toBeNull();
  });

  it('jumps to the first enabled item with Home and the last with End', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowUp}');
    // At Notifications (last) — Home → Apple
    await userEvent.keyboard('{Home}');
    await settle();
    expect(item('apple').shadowRoot!.activeElement).not.toBeNull();
    // End → Notifications
    await userEvent.keyboard('{End}');
    await settle();
    expect(item('check').shadowRoot!.activeElement).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Typeahead
// ---------------------------------------------------------------------------

describe('Typing jumps to a matching item', () => {
  it('pressing "b" while open focuses Banana', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    await userEvent.keyboard('b');
    await settle();
    expect(item('banana').shadowRoot!.activeElement).not.toBeNull();
  });

  it('typing "no" within 500 ms focuses Notifications', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    await userEvent.keyboard('no');
    await settle();
    expect(item('check').shadowRoot!.activeElement).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Selecting items
// ---------------------------------------------------------------------------

describe('Selecting items', () => {
  it('clicking a normal item fires select with the item in detail and closes the menu', async () => {
    await mount(FIXTURE);
    const shown = waitForEvent(el(), 'after-show');
    await userEvent.click(menuTrigger());
    await shown;
    await settle();

    let selectedItem: DropdownItem | null = null;
    el().addEventListener('select', (e: Event) => {
      selectedItem = (e as DropdownSelectEvent).item;
    });

    const hidden = waitForEvent(el(), 'after-hide');
    await userEvent.click(menuItem('Apple'));
    await hidden;
    await settle();

    expect(selectedItem).toBe(item('apple'));
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('pressing Enter on a focused item selects it and closes the menu', async () => {
    await mount(FIXTURE);
    await openViaKey('{ArrowDown}');
    // At Apple — navigate to Banana
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(item('banana').shadowRoot!.activeElement).not.toBeNull();

    let selectedItem: DropdownItem | null = null;
    el().addEventListener('select', (e: Event) => {
      selectedItem = (e as DropdownSelectEvent).item;
    });

    const hidden = waitForEvent(el(), 'after-hide');
    await userEvent.keyboard('{Enter}');
    await hidden;
    await settle();

    expect(selectedItem).toBe(item('banana'));
    expect(isOpen()).toBe(false);
  });

  it('clicking a checkbox item toggles checked, fires select, and keeps the menu open', async () => {
    await mount(FIXTURE);
    const shown = waitForEvent(el(), 'after-show');
    await userEvent.click(menuTrigger());
    await shown;
    await settle();

    let selectedItem: DropdownItem | null = null;
    el().addEventListener('select', (e: Event) => {
      selectedItem = (e as DropdownSelectEvent).item;
    });

    await userEvent.click(checkboxItem('Notifications'));
    await settle();

    expect(selectedItem).toBe(item('check'));
    expect(item('check').checked).toBe(true);
    expect(isOpen()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Light dismiss
// ---------------------------------------------------------------------------

describe('Clicking outside closes the menu', () => {
  it('native light-dismiss syncs open to false and clears aria-expanded', async () => {
    await mount(`
      <l-dropdown style="--show-duration: 0; --hide-duration: 0">
        <button slot="trigger">Menu</button>
        <l-dropdown-item id="apple">Apple</l-dropdown-item>
        <l-dropdown-item id="banana">Banana</l-dropdown-item>
        <l-dropdown-item id="cherry" disabled>Cherry</l-dropdown-item>
        <l-dropdown-item id="check" type="checkbox">Notifications</l-dropdown-item>
      </l-dropdown>
      <button id="outside">Outside</button>
    `);
    const shown = waitForEvent(el(), 'after-show');
    await userEvent.click(menuTrigger());
    await shown;
    await settle();
    expect(isOpen()).toBe(true);

    // A real userEvent.click on an element outside the popover triggers
    // native popover="auto" light-dismiss (trusted pointer event pathway).
    await userEvent.click(page.getByRole('button', { name: 'Outside' }));
    await new Promise((r) => setTimeout(r, 50));
    await settle();

    expect(el().open).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Submenus
// ---------------------------------------------------------------------------

const SUBMENU_FIXTURE = `
  <l-dropdown style="--show-duration: 0; --hide-duration: 0">
    <button slot="trigger">Menu</button>
    <l-dropdown-item id="documents">
      Documents
      <l-dropdown-item id="pdf" slot="submenu" value="pdf">PDF</l-dropdown-item>
      <l-dropdown-item id="word" slot="submenu" value="docx">Word Document</l-dropdown-item>
      <l-dropdown-item id="formats" slot="submenu">
        More Formats
        <l-dropdown-item id="txt" slot="submenu" value="txt">Plain Text</l-dropdown-item>
      </l-dropdown-item>
    </l-dropdown-item>
    <l-dropdown-item id="rename">Rename</l-dropdown-item>
    <l-dropdown-item id="options">
      Options
      <l-dropdown-item id="compress" slot="submenu" type="checkbox" value="compress">Compress files</l-dropdown-item>
    </l-dropdown-item>
  </l-dropdown>
`;

const submenuPanel = (id: string) => item(id).shadowRoot!.querySelector<HTMLElement>('.submenu')!;
const isSubmenuOpen = (id: string) => submenuPanel(id).matches(':popover-open');

async function openMenu() {
  const shown = waitForEvent(el(), 'after-show');
  await userEvent.click(menuTrigger());
  await shown;
  await settle();
}

describe('Submenus', () => {
  describe('Pointer interaction', () => {
    it('clicking a parent item opens its submenu without selecting or closing the menu', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();

      let selected = false;
      el().addEventListener('select', () => (selected = true));

      await userEvent.click(menuItem('Documents'));
      await settle();

      expect(isOpen()).toBe(true);
      expect(isSubmenuOpen('documents')).toBe(true);
      expect(selected).toBe(false);
      // Nested items are now exposed to the user
      expect(menuItem('PDF').elements()).toHaveLength(1);
    });

    it('clicking the parent item again closes its submenu', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      await userEvent.click(menuItem('Documents'));
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);

      await userEvent.click(menuItem('Documents'));
      await settle();
      expect(isSubmenuOpen('documents')).toBe(false);
      expect(isOpen()).toBe(true);
    });

    it('hovering a parent item opens its submenu; hovering a sibling closes it', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();

      await userEvent.hover(menuItem('Documents'));
      await new Promise((r) => setTimeout(r, 250));
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);

      await userEvent.hover(menuItem('Rename'));
      await new Promise((r) => setTimeout(r, 250));
      await settle();
      expect(isSubmenuOpen('documents')).toBe(false);
      expect(isOpen()).toBe(true);
    });

    it('keeps focus inside the menu when a hovered sibling closes the focused submenu (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(SUBMENU_FIXTURE);
      // Keyboard focus lands inside the Documents submenu (on PDF)…
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(item('pdf').shadowRoot!.activeElement).not.toBeNull();

      // …then the mouse hovers a sibling, collapsing the focused panel.
      await userEvent.hover(menuItem('Rename'));
      await new Promise((r) => setTimeout(r, 250));
      await settle();

      expect(isSubmenuOpen('documents')).toBe(false);
      // Focus must not have fallen to <body> — it rode to the hovered row.
      expect(deepActiveElement()).not.toBe(document.body);
      expect(deepActiveElement()).toBe(item('rename').shadowRoot!.querySelector('.item'));
    });
  });

  describe('Selection', () => {
    it('selecting a nested item fires select with that item and closes the whole menu', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      await userEvent.click(menuItem('Documents'));
      await settle();

      let selectedItem: DropdownItem | null = null;
      el().addEventListener('select', (e: Event) => {
        selectedItem = (e as DropdownSelectEvent).item;
      });

      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.click(menuItem('PDF'));
      await hidden;
      await settle();

      expect(selectedItem).toBe(item('pdf'));
      expect(isOpen()).toBe(false);
      expect(isSubmenuOpen('documents')).toBe(false);
    });

    it('a checkbox item inside a submenu toggles, fires select, and keeps menu and submenu open', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      await userEvent.click(menuItem('Options'));
      await settle();

      let selectedItem: DropdownItem | null = null;
      el().addEventListener('select', (e: Event) => {
        selectedItem = (e as DropdownSelectEvent).item;
      });

      await userEvent.click(checkboxItem('Compress files'));
      await settle();

      expect(selectedItem).toBe(item('compress'));
      expect(item('compress').checked).toBe(true);
      expect(isOpen()).toBe(true);
      expect(isSubmenuOpen('options')).toBe(true);
    });
  });

  describe('Keyboard interaction (APG menu pattern)', () => {
    it('ArrowRight on a parent item opens the submenu and moves focus to its first item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');
      // Focus is on Documents — open its submenu
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);
      expect(item('pdf').shadowRoot!.activeElement).not.toBeNull();
    });

    it('Enter on a parent item opens the submenu instead of selecting it (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');

      let selected = false;
      el().addEventListener('select', () => (selected = true));

      await userEvent.keyboard('{Enter}');
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);
      expect(selected).toBe(false);
      expect(item('pdf').shadowRoot!.activeElement).not.toBeNull();
    });

    it('arrow keys navigate within the submenu level and wrap (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      // PDF → Word Document → More Formats → wraps to PDF
      await userEvent.keyboard('{ArrowDown}');
      await settle();
      expect(item('word').shadowRoot!.activeElement).not.toBeNull();
      await userEvent.keyboard('{ArrowDown}');
      await settle();
      expect(item('formats').shadowRoot!.activeElement).not.toBeNull();
      await userEvent.keyboard('{ArrowDown}');
      await settle();
      expect(item('pdf').shadowRoot!.activeElement).not.toBeNull();
    });

    it('ArrowRight opens a nested second-level submenu (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}'); // open Documents submenu, focus PDF
      await settle();
      await userEvent.keyboard('{End}'); // jump to More Formats
      await settle();
      await userEvent.keyboard('{ArrowRight}'); // open nested submenu
      await settle();
      expect(isSubmenuOpen('formats')).toBe(true);
      expect(item('txt').shadowRoot!.activeElement).not.toBeNull();
    });

    it('ArrowLeft closes the submenu and returns focus to the parent item (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);

      await userEvent.keyboard('{ArrowLeft}');
      await settle();
      expect(isSubmenuOpen('documents')).toBe(false);
      expect(item('documents').shadowRoot!.activeElement).not.toBeNull();
      expect(isOpen()).toBe(true);
    });

    it('Escape inside a submenu closes only that submenu, not the whole menu (WCAG 2.1.2 / RGAA 12.9)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await settle();

      await userEvent.keyboard('{Escape}');
      await settle();
      expect(isSubmenuOpen('documents')).toBe(false);
      expect(isOpen()).toBe(true);
      expect(item('documents').shadowRoot!.activeElement).not.toBeNull();
    });

    it('roving to a sibling at the same level collapses an open submenu (APG)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}'); // focus Documents (root level)
      // Open its submenu by click — focus stays on Documents, panel opens.
      await userEvent.click(menuItem('Documents'));
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);

      // ArrowDown roves to Rename → Documents' submenu must collapse.
      await userEvent.keyboard('{ArrowDown}');
      await settle();
      expect(item('rename').shadowRoot!.activeElement).not.toBeNull();
      expect(item('documents').submenuOpen).toBe(false);
      const docRow = item('documents').shadowRoot!.querySelector<HTMLElement>('.item')!;
      expect(docRow.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Roles and accessible names', () => {
    it('a parent item exposes aria-haspopup and reflects aria-expanded (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      const row = item('documents').shadowRoot!.querySelector<HTMLElement>('.item')!;
      expect(row.getAttribute('aria-haspopup')).toBe('menu');
      expect(row.getAttribute('aria-expanded')).toBe('false');

      await userEvent.click(menuItem('Documents'));
      await settle();
      expect(row.getAttribute('aria-expanded')).toBe('true');
    });

    it('a leaf item exposes neither aria-haspopup nor aria-expanded (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      const row = item('rename').shadowRoot!.querySelector<HTMLElement>('.item')!;
      expect(row.hasAttribute('aria-haspopup')).toBe(false);
      expect(row.hasAttribute('aria-expanded')).toBe(false);
    });

    it('a parent item points aria-controls at its submenu panel (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      const row = item('documents').shadowRoot!.querySelector<HTMLElement>('.item')!;
      const controls = row.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      const controlled = item('documents').shadowRoot!.getElementById(controls!);
      expect(controlled).toBe(submenuPanel('documents'));
    });

    it('a submenu panel takes its accessible name from the parent item (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      await userEvent.click(menuItem('Documents'));
      await settle();
      // The submenu role="menu" is named "Documents" via aria-labelledby.
      expect(page.getByRole('menu', { name: 'Documents' }).elements().length).toBeGreaterThan(0);
    });

    it('item hosts carry role="none" so the menu owns its menuitems directly (WCAG 1.3.1 / RGAA 7.1)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      expect(item('documents').getAttribute('role')).toBe('none');
      expect(item('rename').getAttribute('role')).toBe('none');
      // The menuitem role still resolves on the inner row.
      expect(menuItem('Rename').elements()).toHaveLength(1);
    });

    it('closing the whole menu also closes any open submenu', async () => {
      await mount(SUBMENU_FIXTURE);
      await openMenu();
      await userEvent.click(menuItem('Documents'));
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);

      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.keyboard('{Escape}');
      await hidden;
      await settle();
      expect(isOpen()).toBe(false);
      expect(isSubmenuOpen('documents')).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes a button trigger with the given accessible name (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      expect(menuTrigger().elements()).toHaveLength(1);
    });

    it('exposes the menu role once open (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.click(menuTrigger());
      await shown;
      await settle();
      expect(page.getByRole('menu').elements()).toHaveLength(1);
    });

    it('exposes enabled items as menuitem and disabled Cherry as disabled menuitem (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.click(menuTrigger());
      await shown;
      await settle();
      expect(menuItem('Apple').elements()).toHaveLength(1);
      expect(menuItem('Banana').elements()).toHaveLength(1);
      expect(disabledMenuItem('Cherry').elements()).toHaveLength(1);
    });

    it('exposes the checkbox item as menuitemcheckbox with aria-checked toggled on click (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.click(menuTrigger());
      await shown;
      await settle();
      const notifEl = item('check').shadowRoot!.querySelector<HTMLElement>('.item');
      expect(notifEl?.getAttribute('role')).toBe('menuitemcheckbox');
      expect(notifEl?.getAttribute('aria-checked')).toBe('false');
      // Toggle and recheck
      await userEvent.click(checkboxItem('Notifications'));
      await settle();
      expect(notifEl?.getAttribute('aria-checked')).toBe('true');
    });

    it('marks the trigger as a menu button before any interaction (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('names the root menu after its trigger (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.click(menuTrigger());
      await shown;
      await settle();
      expect(page.getByRole('menu', { name: 'Menu' }).elements()).toHaveLength(1);
    });

    it('reflects expanded state on the trigger button (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      // Closed: expanded=false
      expect(page.getByRole('button', { name: 'Menu', expanded: false }).elements()).toHaveLength(
        1,
      );
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.click(menuTrigger());
      await shown;
      await settle();
      // Open: expanded=true
      expect(page.getByRole('button', { name: 'Menu', expanded: true }).elements()).toHaveLength(1);
    });
  });

  describe('Keyboard interaction (APG menu button pattern)', () => {
    it('ArrowDown on trigger opens the menu and moves focus to the first item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowDown}');
      expect(isOpen()).toBe(true);
      expect(item('apple').shadowRoot!.activeElement).not.toBeNull();
    });

    it('ArrowUp on trigger opens the menu and moves focus to the last enabled item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowUp}');
      expect(isOpen()).toBe(true);
      expect(item('check').shadowRoot!.activeElement).not.toBeNull();
    });

    it('Home jumps to the first item, End jumps to the last (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowUp}');
      // At Notifications (last) — Home → Apple
      await userEvent.keyboard('{Home}');
      await settle();
      expect(item('apple').shadowRoot!.activeElement).not.toBeNull();
      // End → Notifications
      await userEvent.keyboard('{End}');
      await settle();
      expect(item('check').shadowRoot!.activeElement).not.toBeNull();
    });

    it('Escape closes the menu and returns focus to trigger — no keyboard trap (WCAG 2.1.2 / RGAA 12.9)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowDown}');
      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.keyboard('{Escape}');
      await hidden;
      await settle();
      expect(isOpen()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    });

    it('typeahead reaches a matching item by typing its initial letters (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('no');
      await settle();
      expect(item('check').shadowRoot!.activeElement).not.toBeNull();
    });

    it('Tab closes the menu and clears the trigger expanded state (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowDown}');
      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.tab();
      await hidden;
      await settle();
      expect(isOpen()).toBe(false);
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('Tab from a submenu closes the whole menu, submenu included (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(SUBMENU_FIXTURE);
      await openViaKey('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(isSubmenuOpen('documents')).toBe(true);

      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.tab();
      await hidden;
      await settle();
      expect(isOpen()).toBe(false);
      expect(isSubmenuOpen('documents')).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('exactly one item has tabindex="0" while the menu is open (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FIXTURE);
      await openViaKey('{ArrowDown}');
      const allItems = [...host.querySelectorAll<DropdownItem>('l-dropdown-item')];
      const tabbed = allItems.filter((i) => {
        const inner = i.shadowRoot!.querySelector<HTMLElement>('.item');
        return inner?.getAttribute('tabindex') === '0';
      });
      expect(tabbed).toHaveLength(1);
    });

    it('focus returns to trigger after selecting a normal item (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FIXTURE);
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.click(menuTrigger());
      await shown;
      await settle();
      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.click(menuItem('Apple'));
      await hidden;
      await settle();
      expect(deepActiveElement()).toBe(trigger());
    });

    it('the keyboard-focused item shows a visible focus ring (WCAG 2.4.7 / RGAA 10.7)', async () => {
      await mount(FIXTURE);
      // The tokens stylesheet isn't loaded in the bare test harness; supply the
      // one token the ring reads (it inherits into the shadow DOM) so the
      // `var(--l-focus-ring)` outline resolves the way it does in real usage.
      host.style.setProperty('--l-focus-ring', '#d9461f');
      await openViaKey('{ArrowDown}'); // focus Apple via keyboard (:focus-visible)
      const row = item('apple').shadowRoot!.querySelector<HTMLElement>('.item')!;
      expect(row.matches(':focus-visible')).toBe(true);
      const cs = getComputedStyle(row);
      expect(cs.outlineStyle).not.toBe('none');
      expect(parseFloat(cs.outlineWidth)).toBeGreaterThan(0);
    });
  });
});
