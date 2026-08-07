import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tabs/index.js';
import type { Tabs } from '../../src/html/elements/tabs/tabs.js';

// The browser config has no setup file, so light-DOM stylesheets are not loaded
// by default — `tabs.browser.test.ts` asserts DOM/ARIA and does not need them.
// This suite asserts what is *painted*, so it pulls in the tokens and the line
// skin that owns the hover pill.
import '../../src/css/tokens.css';
import '../../src/css/elements/tabs/line.css';

// `:hover` is not gated on `disabled` — the platform still matches it on a
// disabled button. So the hover pill, which is click feedback, has to opt out
// explicitly or it promises a click that will never register. Nothing else
// catches this: the DOM is identical either way, only the paint differs.

let host: HTMLElement;

afterEach(() => host?.remove());

const TABS = `
  <l-tabs variant="line">
    <div>
      <button aria-selected="true">Tab 1</button>
      <button>Tab 2</button>
      <button disabled>Tab 3</button>
      <button aria-disabled="true">Tab 4</button>
    </div>
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
    <div>Content 4</div>
  </l-tabs>
`;

async function mount(): Promise<void> {
  host = document.createElement('div');
  host.innerHTML = TABS;
  document.body.append(host);
  await customElements.whenDefined('l-tabs');
  const tabs = host.querySelector<Tabs & { updateComplete: Promise<unknown> }>('l-tabs');
  if (tabs) await tabs.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const tab = (name: string) => page.getByRole('tab', { name });

/** The pill fades in over `--_duration` (150ms), so reading it straight after
 *  hovering returns the transparent start of the transition, not the result. */
const PILL_TRANSITION_MS = 150;

/** Hover a tab and let its pill transition finish before anything is measured. */
async function hover(name: string): Promise<void> {
  await userEvent.hover(tab(name));
  await new Promise((r) => setTimeout(r, PILL_TRANSITION_MS * 2));
}

/** Background actually painted by the hover pill (`::after`) on a tab. */
function pill(name: string): string {
  const el = [...host.querySelectorAll('[role="tab"]')].find(
    (t) => t.textContent?.trim() === name,
  )!;
  return getComputedStyle(el, '::after').backgroundColor;
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('The hover pill is click feedback, so it never lands on a tab that cannot be clicked', () => {
  it('paints behind an enabled tab on hover', async () => {
    await mount();
    await hover('Tab 2');
    expect(pill('Tab 2')).not.toBe(TRANSPARENT);
  });

  it('paints behind the selected tab too — the fill is feedback, not a selection cue', async () => {
    await mount();
    await hover('Tab 1');
    expect(pill('Tab 1')).not.toBe(TRANSPARENT);
  });

  it('stays transparent on a disabled tab', async () => {
    await mount();
    await hover('Tab 3');
    expect(pill('Tab 3')).toBe(TRANSPARENT);
  });

  it('stays transparent on an aria-disabled tab', async () => {
    await mount();
    await hover('Tab 4');
    expect(pill('Tab 4')).toBe(TRANSPARENT);
  });
});

describe('A disabled tab reads as unavailable', () => {
  it('greys the label away from the enabled tab colour', async () => {
    await mount();
    const enabled = getComputedStyle(tab('Tab 2').element()).color;
    const disabled = getComputedStyle(tab('Tab 3').element()).color;
    expect(disabled).not.toBe(enabled);
  });

  it('shows a not-allowed cursor instead of a pointer', async () => {
    await mount();
    expect(getComputedStyle(tab('Tab 2').element()).cursor).toBe('pointer');
    expect(getComputedStyle(tab('Tab 3').element()).cursor).toBe('not-allowed');
    expect(getComputedStyle(tab('Tab 4').element()).cursor).toBe('not-allowed');
  });

  it('does not brighten the label on hover the way an enabled tab does', async () => {
    await mount();
    const before = getComputedStyle(tab('Tab 3').element()).color;
    await hover('Tab 3');
    expect(getComputedStyle(tab('Tab 3').element()).color).toBe(before);
  });
});
