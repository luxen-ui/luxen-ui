import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tabs/index.js';
import type { Tabs } from '../../src/html/elements/tabs/tabs.js';
import { waitForEvent } from './support/events.js';
import { userEvent } from './support/user-event.js';

// These tests drive l-tabs the way a person would — clicking tabs, pressing
// arrow keys — and assert what a user (or their screen reader, or their CSS)
// observes: selection state, accessible roles, keyboard focus, and the
// animated indicator. All interactions use userEvent (trusted CDP events).
// l-tabs is a light-DOM progressive element, so document.activeElement works
// directly — no deepActiveElement needed.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-tabs');
  await settle();
  return host;
}

async function settle() {
  const tabs = host?.querySelector<Tabs & { updateComplete: Promise<unknown> }>('l-tabs');
  if (tabs) await tabs.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector<Tabs>('l-tabs')!;

// Locator helpers — match what assistive tech sees
const tab = (name: string, opts?: { selected?: boolean; disabled?: boolean }) =>
  page.getByRole('tab', { name, ...opts });
const tablist = () => page.getByRole('tablist');
const tabpanel = (name: string) => page.getByRole('tabpanel', { name });

const TABS = `
  <l-tabs>
    <div>
      <button>Tab 1</button>
      <button>Tab 2</button>
    </div>
    <div>Content 1</div>
    <div>Content 2</div>
  </l-tabs>
`;

const THREE_TABS = `
  <l-tabs>
    <div>
      <button>Tab 1</button>
      <button>Tab 2</button>
      <button>Tab 3</button>
    </div>
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
  </l-tabs>
`;

// ---------------------------------------------------------------------------
// Upgrade without animation frames
// ---------------------------------------------------------------------------

describe('l-tabs upgrades without waiting for an animation frame', () => {
  it('promotes the first child to a tablist role', async () => {
    await mount(TABS);
    expect(el().querySelector('[role="tablist"]')).not.toBeNull();
  });

  it('gives each button a tab role', async () => {
    await mount(TABS);
    const tabs = el().querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
  });

  it('promotes content divs to tabpanels', async () => {
    await mount(TABS);
    const panels = el().querySelectorAll('[role="tabpanel"]');
    expect(panels).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// DOM-move survival
// ---------------------------------------------------------------------------

describe('l-tabs survives being moved in the DOM', () => {
  it('still has a tablist after a remove-then-reattach', async () => {
    await mount(TABS);
    const tabs = el();
    // Move the element to another container to test DOM-move survival.
    // Re-attach it inside host (a different parent) so afterEach cleans it up.
    const container = document.createElement('div');
    host.append(container);
    tabs.remove();
    container.append(tabs);
    await settle();
    expect(tabs.querySelector('[role="tablist"]')).not.toBeNull();
  });

  it('still has exactly 2 tab roles after a remove-then-reattach', async () => {
    await mount(TABS);
    const tabs = el();
    const container = document.createElement('div');
    host.append(container);
    tabs.remove();
    container.append(tabs);
    await settle();
    expect(tabs.querySelectorAll('[role="tab"]')).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Indicator (ResizeObserver-based — no user interaction to convert)
// ---------------------------------------------------------------------------

describe('l-tabs positions its indicator without animation frames', () => {
  it('sets --_indicator-width on the tablist after mount in a visible document', async () => {
    await mount(TABS);
    const tablistEl = el().querySelector<HTMLElement>('[role="tablist"]')!;
    expect(tablistEl.style.getPropertyValue('--_indicator-width')).not.toBe('');
  });

  it('recovers and sets --_indicator-width when the element starts hidden and becomes visible', async () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'none';
    wrapper.innerHTML = TABS;
    document.body.append(wrapper);
    host = wrapper;
    await customElements.whenDefined('l-tabs');
    await settle();

    // Still hidden — indicator may be '' or '0px'
    const tablistEl = wrapper.querySelector<HTMLElement>('[role="tablist"]')!;

    // Make visible — ResizeObserver fires when box size transitions from 0
    wrapper.style.display = '';

    // Wait for ResizeObserver to fire (poll up to ~10 macrotasks)
    await vi.waitFor(
      () => {
        const width = tablistEl.style.getPropertyValue('--_indicator-width');
        if (!width || width === '0px') throw new Error(`indicator not set yet: "${width}"`);
      },
      { timeout: 500 },
    );

    const width = tablistEl.style.getPropertyValue('--_indicator-width');
    expect(width).not.toBe('');
    expect(width).not.toBe('0px');
  });

  it('moves --_indicator-left when the second tab is clicked', async () => {
    await mount(TABS);
    const tablistEl = el().querySelector<HTMLElement>('[role="tablist"]')!;
    await userEvent.click(tab('Tab 2'));
    await settle();
    const left = parseFloat(tablistEl.style.getPropertyValue('--_indicator-left'));
    expect(left).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// No initialization after immediate disconnect
// ---------------------------------------------------------------------------

describe('l-tabs does not initialize after an immediate disconnect', () => {
  it('has no role attributes when connected without children then removed before the retry fires', async () => {
    // Simulate the parser-upgrade case: the element is appended with no children
    // yet (children arrive later). The synchronous _trySetup() bails and queues
    // a setTimeout retry. If we disconnect before that timer fires, setup must
    // not run.
    await customElements.whenDefined('l-tabs');
    const tabs = document.createElement('l-tabs');
    // Add children so they are present but connect without them first to force
    // the retry path, then disconnect before the macrotask.
    document.body.append(tabs);
    // At this point no children — _trySetup() returned false and set a timer.
    tabs.remove();
    // Now add children (as would happen mid-parse) and wait for the macrotask.
    tabs.innerHTML = `<div><button>Tab 1</button><button>Tab 2</button></div><div>Content 1</div>`;
    await settle();
    // The timer fired after disconnect; _trySetup() must have bailed on !isConnected.
    expect(tabs.querySelector('[role="tablist"]')).toBeNull();
    expect(tabs.querySelector('[role="tab"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Click selection
// ---------------------------------------------------------------------------

describe('Clicking a tab selects it', () => {
  it('selects Tab 2 when clicked and fires a change event with the right index', async () => {
    await mount(TABS);
    let detail: { index: number; name: string | null } | null = null;
    el().addEventListener('change', (e) => {
      detail = { index: e.index, name: e.name };
    });
    await userEvent.click(tab('Tab 2'));
    await settle();
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    expect(detail).toEqual({ index: 1, name: null });
  });

  it('shows the corresponding panel and hides the others after clicking Tab 2', async () => {
    await mount(TABS);
    await userEvent.click(tab('Tab 2'));
    await settle();
    // Panel labelled by Tab 2 is visible; Tab 1 panel is hidden
    expect(tabpanel('Tab 2').elements()).toHaveLength(1);
    const panels = el().querySelectorAll<HTMLElement>('[role="tabpanel"]');
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
  });

  it('deselects the previously selected tab when a new one is clicked', async () => {
    await mount(TABS);
    await userEvent.click(tab('Tab 2'));
    await settle();
    expect(tab('Tab 1', { selected: false }).elements()).toHaveLength(1);
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

describe('A keyboard user can navigate tabs with arrow keys', () => {
  it('ArrowRight moves selection from Tab 1 to Tab 2', async () => {
    await mount(TABS);
    // Click Tab 1 to establish focus on it (click selects + focuses per element contract)
    await userEvent.click(tab('Tab 1'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowRight}');
    await changed;
    await settle();
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 2');
  });

  it('ArrowLeft moves selection from Tab 2 to Tab 1', async () => {
    await mount(TABS);
    await userEvent.click(tab('Tab 2'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowLeft}');
    await changed;
    await settle();
    expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 1');
  });

  it('ArrowRight wraps from the last tab to the first', async () => {
    await mount(THREE_TABS);
    await userEvent.click(tab('Tab 3'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowRight}');
    await changed;
    await settle();
    expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 1');
  });

  it('ArrowLeft wraps from the first tab to the last', async () => {
    await mount(THREE_TABS);
    await userEvent.click(tab('Tab 1'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowLeft}');
    await changed;
    await settle();
    expect(tab('Tab 3', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 3');
  });

  it('Home jumps to the first tab from any position', async () => {
    await mount(THREE_TABS);
    await userEvent.click(tab('Tab 3'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{Home}');
    await changed;
    await settle();
    expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 1');
  });

  it('End jumps to the last tab from any position', async () => {
    await mount(THREE_TABS);
    await userEvent.click(tab('Tab 1'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{End}');
    await changed;
    await settle();
    expect(tab('Tab 3', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 3');
  });
});

// ---------------------------------------------------------------------------
// Disabled tabs
// ---------------------------------------------------------------------------

// A natively-disabled button cannot take focus. If selection lands on one, the
// roving tabindex entry point moves to an unfocusable element and the whole
// tablist drops out of the tab sequence — so a disabled tab must never be
// reachable by arrow keys, Home/End, a click, or the `value` property.

const DISABLED_MIDDLE = `
  <l-tabs>
    <div>
      <button>Tab 1</button>
      <button disabled>Tab 2</button>
      <button>Tab 3</button>
    </div>
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
  </l-tabs>
`;

const DISABLED_FIRST = `
  <l-tabs>
    <div>
      <button disabled>Tab 1</button>
      <button>Tab 2</button>
      <button>Tab 3</button>
    </div>
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
  </l-tabs>
`;

const ARIA_DISABLED_MIDDLE = `
  <l-tabs>
    <div>
      <button>Tab 1</button>
      <button aria-disabled="true">Tab 2</button>
      <button>Tab 3</button>
    </div>
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
  </l-tabs>
`;

describe('A keyboard user cannot land on a disabled tab', () => {
  it('ArrowRight skips over the disabled tab', async () => {
    await mount(DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 1'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowRight}');
    await changed;
    await settle();
    expect(tab('Tab 3', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 3');
  });

  it('ArrowLeft skips over the disabled tab', async () => {
    await mount(DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 3'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowLeft}');
    await changed;
    await settle();
    expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 1');
  });

  it('Home selects the first enabled tab, not a disabled first tab', async () => {
    await mount(DISABLED_FIRST);
    await userEvent.click(tab('Tab 3'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{Home}');
    await changed;
    await settle();
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 2');
  });

  it('End selects the last enabled tab, not a disabled last tab', async () => {
    await mount(`
      <l-tabs>
        <div>
          <button>Tab 1</button>
          <button>Tab 2</button>
          <button disabled>Tab 3</button>
        </div>
        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
      </l-tabs>
    `);
    await userEvent.click(tab('Tab 1'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{End}');
    await changed;
    await settle();
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Tab 2');
  });

  it('keeps selection and focus together, so the tab sequence is never lost (WCAG 2.1.1 / RGAA 7.3)', async () => {
    await mount(DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 1'));
    await settle();
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    // The single roving entry point must be the tab that actually has focus.
    const tabbable = [...el().querySelectorAll<HTMLElement>('[role="tab"]')].filter(
      (t) => t.getAttribute('tabindex') === '0',
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(document.activeElement);
  });

  it('never gives a disabled tab the roving tabindex entry point', async () => {
    await mount(DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 1'));
    await settle();
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    const disabledTab = el().querySelectorAll<HTMLElement>('[role="tab"]')[1];
    expect(disabledTab.getAttribute('tabindex')).toBe('-1');
  });

  it('skips an aria-disabled tab with the arrow keys, exactly like a native one', async () => {
    await mount(ARIA_DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 1'));
    await settle();
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(tab('Tab 3', { selected: true }).elements()).toHaveLength(1);
  });

  it('leaves an aria-disabled tab out of the tab sequence too', async () => {
    await mount(ARIA_DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 1'));
    await settle();
    // `aria-disabled` keeps the button focusable in principle, but the roving
    // tabindex only ever promotes the selected tab — so Tab walks straight past
    // it and out of the tablist, onto the open panel. There is no keyboard
    // route to an aria-disabled tab, same as a native disabled one.
    await userEvent.tab();
    const panel = tabpanel('Tab 1').query();
    expect(panel).not.toBeNull();
    expect(document.activeElement).toBe(panel);
  });
});

describe('A disabled tab cannot be selected', () => {
  it('exposes the disabled state to assistive tech (WCAG 4.1.2 / RGAA 7.1)', async () => {
    await mount(DISABLED_MIDDLE);
    expect(tab('Tab 2', { disabled: true }).elements()).toHaveLength(1);
  });

  it('does not fire change when arrowing past a disabled tab', async () => {
    await mount(DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 1'));
    await settle();
    const events: Array<{ index: number }> = [];
    el().addEventListener('change', (e) => events.push({ index: e.index }));
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    // One event, for Tab 3 — never an intermediate one for the disabled Tab 2.
    expect(events).toEqual([{ index: 2 }]);
  });

  // A click on a disabled tab is not covered here: userEvent refuses to click an
  // element the browser reports as not enabled (it retries until it times out),
  // for both `disabled` and `aria-disabled`. The click path is still guarded in
  // the element — a real pointer can reach an `aria-disabled` button.

  it('falls back to the first enabled tab when the initial value points at a disabled one', async () => {
    await mount(`
      <l-tabs value="0">
        <div>
          <button disabled>Tab 1</button>
          <button>Tab 2</button>
        </div>
        <div>Content 1</div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    const panels = el().querySelectorAll<HTMLElement>('[role="tabpanel"]');
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
  });

  it('leaves the selection untouched when value is set to a disabled index', async () => {
    await mount(DISABLED_MIDDLE);
    el().value = '1';
    await settle();
    expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
    // The property must not keep lying about a selection that never happened.
    expect(el().value).toBe('0');
  });

  it('keeps each tab wired to its own panel when a middle tab is disabled', async () => {
    await mount(DISABLED_MIDDLE);
    await userEvent.click(tab('Tab 3'));
    await settle();
    const panels = el().querySelectorAll<HTMLElement>('[role="tabpanel"]');
    expect(panels[2].hidden).toBe(false);
    expect(panels[2].textContent?.trim()).toBe('Content 3');
  });
});

// ---------------------------------------------------------------------------
// Vertical orientation
// ---------------------------------------------------------------------------

describe('A keyboard user navigates a vertical tab list with up/down arrows', () => {
  it('ArrowDown moves selection from Tab 1 to Tab 2 in a vertical tablist', async () => {
    await mount(`
      <l-tabs orientation="vertical">
        <div>
          <button>Tab 1</button>
          <button>Tab 2</button>
        </div>
        <div>Content 1</div>
        <div>Content 2</div>
      </l-tabs>
    `);
    await userEvent.click(tab('Tab 1'));
    await settle();
    const changed = waitForEvent(el(), 'change');
    await userEvent.keyboard('{ArrowDown}');
    await changed;
    await settle();
    expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Panel tab stop (APG: conditional tabindex)
// ---------------------------------------------------------------------------

const LINK_FIRST = `
  <l-tabs>
    <div>
      <button>Tab 1</button>
      <button>Tab 2</button>
    </div>
    <div><p><a href="#report">Jump to the report</a> — updated hourly.</p></div>
    <div>Content 2</div>
  </l-tabs>
`;

const PROSE_FIRST = `
  <l-tabs>
    <div>
      <button>Tab 1</button>
      <button>Tab 2</button>
    </div>
    <div>
      <p>Usage for the current period.</p>
      <a href="#report">Jump to the report</a>
    </div>
    <div>Content 2</div>
  </l-tabs>
`;

describe('A panel joins the tab sequence only when its first content is not focusable', () => {
  it('drops the panel tab stop when the panel opens with a link', async () => {
    await mount(LINK_FIRST);
    const panel = tabpanel('Tab 1').query()!;
    expect(panel.hasAttribute('tabindex')).toBe(false);
  });

  it('sends Tab straight to that link instead of stopping on the panel box', async () => {
    await mount(LINK_FIRST);
    await userEvent.click(tab('Tab 1'));
    await settle();
    await userEvent.tab();
    expect(document.activeElement?.textContent?.trim()).toBe('Jump to the report');
  });

  it('keeps the panel tab stop when the panel opens with prose, link below or not', async () => {
    // The APG's second clause: a link lower down is no reason to strand the
    // paragraph above it outside the tab sequence.
    await mount(PROSE_FIRST);
    const panel = tabpanel('Tab 1').query()!;
    expect(panel.getAttribute('tabindex')).toBe('0');
  });

  it('lands on the panel first when the panel opens with prose', async () => {
    await mount(PROSE_FIRST);
    await userEvent.click(tab('Tab 1'));
    await settle();
    await userEvent.tab();
    expect(document.activeElement).toBe(tabpanel('Tab 1').query());
  });

  it('drops the panel tab stop when the panel opens with a button', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><button class="l-button" type="button">Refresh</button><p>Then some text.</p></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.hasAttribute('tabindex')).toBe(false);
  });

  it('sends Tab straight to that button', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><button class="l-button" type="button">Refresh</button><p>Then some text.</p></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    await userEvent.click(tab('Tab 1'));
    await settle();
    await userEvent.tab();
    expect(document.activeElement?.textContent?.trim()).toBe('Refresh');
  });

  it('keeps the stop when that first button is disabled', async () => {
    // A disabled button takes no tab stop, so the panel still needs one of its
    // own — otherwise nothing in the panel is reachable from the tablist.
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><button class="l-button" type="button" disabled>Refresh</button><p>Then some text.</p></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it('descends through wrappers, so a link nested in a heading still counts', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><h2><span><a href="#x">Linked heading</a></span></h2></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.hasAttribute('tabindex')).toBe(false);
  });

  it('does not mistake a style block for the panel content', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><style>.x { color: red }</style><a href="#x">A link</a></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.hasAttribute('tabindex')).toBe(false);
  });

  it('stops on an image rather than skipping ahead to a link below it', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><img alt="Chart" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><a href="#x">A link</a></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it('keeps the stop on a panel holding nothing focusable at all', async () => {
    await mount(TABS);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it('re-decides when the panel is filled after mount', async () => {
    // Hosts render into a panel once their data lands, long after setup — the
    // decision cannot be frozen at connectedCallback.
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    const panel = tabpanel('Tab 1').query()!;
    expect(panel.getAttribute('tabindex')).toBe('0');

    panel.innerHTML = '<p><a href="#x">Arrived late</a></p>';
    await new Promise((r) => setTimeout(r, 0));
    expect(panel.hasAttribute('tabindex')).toBe(false);
  });

  it('gives the stop back when the focusable content is removed again', async () => {
    await mount(LINK_FIRST);
    const panel = tabpanel('Tab 1').query()!;
    expect(panel.hasAttribute('tabindex')).toBe(false);

    panel.innerHTML = '<p>Nothing to click here.</p>';
    await new Promise((r) => setTimeout(r, 0));
    expect(panel.getAttribute('tabindex')).toBe('0');
  });

  it("does not count a hidden input as the panel's first content", async () => {
    // A CSRF field is a routine first child of a form panel; it renders nothing
    // and takes no focus, so the prose after it still needs the panel stop.
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><input type="hidden" name="csrf" value="x"><p>Visible prose.</p><a href="#z">link</a></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it("does not count display:none content as the panel's first content", async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><div style="display:none"><a href="#x">Hidden link</a></div><p>Visible prose.</p></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it('keeps the stop when the first content is inert', async () => {
    // Inert content is visible but unfocusable, so it settles the question —
    // unlike an unrendered block, which is skipped.
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><div inert><p>Saving…</p></div><a href="#x">A link</a></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it('does not blur the panel when content arrives while it holds focus', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div>Prose only for now.</div>
        <div>Content 2</div>
      </l-tabs>
    `);
    const panel = tabpanel('Tab 1').query()!;
    panel.focus();
    expect(document.activeElement).toBe(panel);

    panel.innerHTML = '<p><a href="#y">Arrived late</a></p>';
    await new Promise((r) => setTimeout(r, 0));

    // The stop is kept while focus is on it — losing it would drop the user at
    // the top of the document.
    expect(document.activeElement).toBe(panel);
    expect(panel.getAttribute('tabindex')).toBe('0');
  });

  it('retakes the decision once focus leaves the panel', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div>Prose only for now.</div>
        <div>Content 2</div>
      </l-tabs>
    `);
    const panel = tabpanel('Tab 1').query()!;
    panel.focus();
    panel.innerHTML = '<p><a href="#y">Arrived late</a></p>';
    await new Promise((r) => setTimeout(r, 0));

    tab('Tab 1').element().focus();
    await new Promise((r) => setTimeout(r, 0));
    expect(panel.hasAttribute('tabindex')).toBe(false);
  });

  it('retakes the decision when a custom element upgrades later', async () => {
    const tag = `x-late-${Math.random().toString(36).slice(2, 8)}`;
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><${tag}></${tag}></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    const panel = tabpanel('Tab 1').query()!;
    // Undecidable while the element is unknown, so the panel keeps its stop.
    expect(panel.getAttribute('tabindex')).toBe('0');

    customElements.define(
      tag,
      class extends HTMLElement {
        connectedCallback() {
          this.attachShadow({ mode: 'open' }).innerHTML = '<button>Shadow control</button>';
        }
      },
    );
    await customElements.whenDefined(tag);
    await new Promise((r) => setTimeout(r, 10));
    expect(panel.hasAttribute('tabindex')).toBe(false);
  });

  it('wires a panel added after setup', async () => {
    await mount(TABS);
    const tabs = el();
    tabs.querySelector('div')!.insertAdjacentHTML('beforeend', '<button>Tab 3</button>');
    tabs.insertAdjacentHTML('beforeend', '<div><a href="#x">Third panel link</a></div>');
    await new Promise((r) => setTimeout(r, 0));

    const panels = tabs.querySelectorAll('[role="tabpanel"]');
    expect(panels).toHaveLength(3);
    expect(tabs.querySelectorAll('[role="tab"]')).toHaveLength(3);
    // And the new panel gets the same verdict as one present from the start.
    expect(panels[2].hasAttribute('tabindex')).toBe(false);
  });

  it('does not churn the attribute when nothing changed', async () => {
    await mount(TABS);
    const panel = tabpanel('Tab 1').query()!;
    const writes: string[] = [];
    const spy = new MutationObserver((records) => {
      for (const r of records) if (r.attributeName === 'tabindex') writes.push('write');
    });
    spy.observe(panel, { attributes: true });

    panel.insertAdjacentHTML('beforeend', '<span> more prose</span>');
    await new Promise((r) => setTimeout(r, 0));
    spy.disconnect();

    // The verdict is unchanged (still prose-first), so no attribute write.
    expect(writes).toEqual([]);
  });

  it('hands the stop to an iframe the panel opens with', async () => {
    // Tab moves into an iframe's content, so the panel needs no stop of its own.
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><iframe title="Map" src="about:blank"></iframe></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.hasAttribute('tabindex')).toBe(false);
  });

  it('drops the stop when the panel opens with a details disclosure', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><details><summary>More detail</summary><p>Body.</p></details></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.hasAttribute('tabindex')).toBe(false);
  });

  it('keeps the stop for a summary that is not a disclosure control', async () => {
    // Only the first summary child of a details takes focus; anywhere else it is
    // inert content, so the panel still needs its own stop.
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div><summary>Not a disclosure</summary></div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('0');
  });

  it('leaves a tabindex the consumer wrote alone', async () => {
    await mount(`
      <l-tabs>
        <div><button>Tab 1</button><button>Tab 2</button></div>
        <div tabindex="-1">Content 1</div>
        <div>Content 2</div>
      </l-tabs>
    `);
    expect(tabpanel('Tab 1').query()!.getAttribute('tabindex')).toBe('-1');
  });

  it('still manages the tab stop after a detach and reattach', async () => {
    // By then the panel carries our own tabindex; that must not be mistaken for
    // a consumer-authored one and freeze the panel out of the sync.
    await mount(TABS);
    const tabs = el();
    const parent = tabs.parentElement!;
    tabs.remove();
    parent.append(tabs);
    await settle();

    const panel = tabpanel('Tab 1').query()!;
    panel.innerHTML = '<p><a href="#x">A link</a></p>';
    await new Promise((r) => setTimeout(r, 0));
    expect(panel.hasAttribute('tabindex')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes a tablist role on the first child container (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(TABS);
      expect(tablist().elements()).toHaveLength(1);
    });

    it('exposes tab roles for every button in the tablist (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(TABS);
      expect(tab('Tab 1').elements()).toHaveLength(1);
      expect(tab('Tab 2').elements()).toHaveLength(1);
    });

    it('exposes tabpanel roles for every content child (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(TABS);
      // Panels are named via aria-labelledby → their accessible name is the tab label
      expect(tabpanel('Tab 1').elements()).toHaveLength(1);
    });

    it('wires each tab to its panel via aria-controls and aria-labelledby (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(TABS);
      const firstTab = el().querySelectorAll<HTMLElement>('[role="tab"]')[0];
      const firstPanel = el().querySelectorAll<HTMLElement>('[role="tabpanel"]')[0];
      expect(firstTab.getAttribute('aria-controls')).toBe(firstPanel.id);
      expect(firstPanel.getAttribute('aria-labelledby')).toBe(firstTab.id);
    });

    it('reflects aria-selected on the active tab and clears it on the others (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(TABS);
      // Tab 1 selected by default
      expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
      expect(tab('Tab 2', { selected: false }).elements()).toHaveLength(1);
      // Click Tab 2 — selection moves
      await userEvent.click(tab('Tab 2'));
      await settle();
      expect(tab('Tab 1', { selected: false }).elements()).toHaveLength(1);
      expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    });
  });

  describe('Keyboard interaction (APG tabs pattern)', () => {
    it('ArrowRight selects the next tab with automatic activation (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(THREE_TABS);
      await userEvent.click(tab('Tab 1'));
      await settle();
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowRight}');
      await changed;
      await settle();
      expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    });

    it('ArrowLeft selects the previous tab with automatic activation (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(THREE_TABS);
      await userEvent.click(tab('Tab 3'));
      await settle();
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowLeft}');
      await changed;
      await settle();
      expect(tab('Tab 2', { selected: true }).elements()).toHaveLength(1);
    });

    it('arrow navigation wraps around at the ends (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(THREE_TABS);
      // Wrap forward: Tab 3 → Tab 1
      await userEvent.click(tab('Tab 3'));
      await settle();
      const changed1 = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowRight}');
      await changed1;
      await settle();
      expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
      // Wrap backward: Tab 1 → Tab 3
      const changed2 = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowLeft}');
      await changed2;
      await settle();
      expect(tab('Tab 3', { selected: true }).elements()).toHaveLength(1);
    });

    it('Home selects the first tab; End selects the last tab (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(THREE_TABS);
      await userEvent.click(tab('Tab 2'));
      await settle();
      // End → Tab 3
      const changed1 = waitForEvent(el(), 'change');
      await userEvent.keyboard('{End}');
      await changed1;
      await settle();
      expect(tab('Tab 3', { selected: true }).elements()).toHaveLength(1);
      // Home → Tab 1
      const changed2 = waitForEvent(el(), 'change');
      await userEvent.keyboard('{Home}');
      await changed2;
      await settle();
      expect(tab('Tab 1', { selected: true }).elements()).toHaveLength(1);
    });

    it('fires a change event with index and name on every keyboard selection (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(TABS);
      await userEvent.click(tab('Tab 1'));
      await settle();
      const events: Array<{ index: number; name: string | null }> = [];
      el().addEventListener('change', (e) => {
        events.push({ index: e.index, name: e.name });
      });
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowRight}');
      await changed;
      await settle();
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ index: 1, name: null });
    });
  });

  describe('Focus management', () => {
    it('exactly one tab has tabindex="0" — the roving tabindex entry point (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(THREE_TABS);
      const allTabs = [...el().querySelectorAll<HTMLElement>('[role="tab"]')];
      const tabbable = allTabs.filter((t) => t.getAttribute('tabindex') === '0');
      expect(tabbable).toHaveLength(1);
      // After moving to Tab 2, the single entry point follows
      await userEvent.click(tab('Tab 2'));
      await settle();
      const tabbable2 = allTabs.filter((t) => t.getAttribute('tabindex') === '0');
      expect(tabbable2).toHaveLength(1);
      expect(tabbable2[0].textContent?.trim()).toBe('Tab 2');
    });

    it('clicking a tab moves focus to that tab (selection follows focus) (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(TABS);
      await userEvent.click(tab('Tab 2'));
      await settle();
      expect(document.activeElement?.textContent?.trim()).toBe('Tab 2');
    });

    it('the active panel is focusable (tabindex="0") when its content is not (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(TABS);
      const panels = el().querySelectorAll<HTMLElement>('[role="tabpanel"]');
      // These panels are plain text, so nothing inside them takes a tab stop and
      // the panel needs one of its own for Tab to reach the content at all.
      expect(panels[0].getAttribute('tabindex')).toBe('0');
      // Inactive panel is still in the DOM but hidden
      expect(panels[1].hidden).toBe(true);
    });
  });
});
