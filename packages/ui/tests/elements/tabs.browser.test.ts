import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import '../../src/html/elements/tabs/index.js';

// Tests drive l-tabs the way a person would and assert what a user
// (or their screen reader) observes. Internal wiring is not tested.

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
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector('l-tabs')!;

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

describe('l-tabs survives being moved in the DOM', () => {
  it('still has a tablist after a remove-then-reattach', async () => {
    await mount(TABS);
    const tabs = el();
    tabs.remove();
    document.body.append(tabs);
    await settle();
    expect(tabs.querySelector('[role="tablist"]')).not.toBeNull();
  });

  it('still has exactly 2 tab roles after a remove-then-reattach', async () => {
    await mount(TABS);
    const tabs = el();
    tabs.remove();
    document.body.append(tabs);
    await settle();
    expect(tabs.querySelectorAll('[role="tab"]')).toHaveLength(2);
  });
});

describe('l-tabs positions its indicator without animation frames', () => {
  it('sets --_indicator-width on the tablist after mount in a visible document', async () => {
    await mount(TABS);
    const tablist = el().querySelector<HTMLElement>('[role="tablist"]')!;
    expect(tablist.style.getPropertyValue('--_indicator-width')).not.toBe('');
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
    const tablist = wrapper.querySelector<HTMLElement>('[role="tablist"]')!;

    // Make visible — ResizeObserver fires when box size transitions from 0
    wrapper.style.display = '';

    // Wait for ResizeObserver to fire (poll up to ~10 macrotasks)
    await vi.waitFor(
      () => {
        const width = tablist.style.getPropertyValue('--_indicator-width');
        if (!width || width === '0px') throw new Error(`indicator not set yet: "${width}"`);
      },
      { timeout: 500 },
    );

    const width = tablist.style.getPropertyValue('--_indicator-width');
    expect(width).not.toBe('');
    expect(width).not.toBe('0px');
  });

  it('moves --_indicator-left when the second tab is clicked', async () => {
    await mount(TABS);
    const tablist = el().querySelector<HTMLElement>('[role="tablist"]')!;
    const secondTab = el().querySelectorAll<HTMLButtonElement>('[role="tab"]')[1];
    secondTab.click();
    await settle();
    const left = parseFloat(tablist.style.getPropertyValue('--_indicator-left'));
    expect(left).toBeGreaterThan(0);
  });
});

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
