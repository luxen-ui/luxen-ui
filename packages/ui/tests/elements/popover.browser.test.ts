import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/popover/index.js';
import type { Popover } from '../../src/html/elements/popover/popover.js';

// `l-popover` shares `PopoverController` with `l-tooltip`, so it inherits the
// same anchoring contract: a panel whose `for` moves while it is open has to
// follow, and the `aria-expanded` it wrote has to be cleaned off the element
// that actually received it. These tests cover that contract only — the panel's
// own click/hover/dismiss behaviour is exercised through the dropdown suite.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-popover');
  await settle();
  // Trigger listeners attach on the animation frame after connect.
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 0));
  return host;
}

async function settle() {
  await Promise.all(
    [...host.querySelectorAll<Popover>('l-popover')].map((el) => el.updateComplete),
  );
  await new Promise((r) => setTimeout(r, 0));
}

const panel = (id: string) => host.querySelector<Popover>(`#${id}`)!;
const anchor = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;

// Both anchors must stay inside the 414px-wide test viewport, or `shift()`
// clamps the panel and its rect stops matching the anchor for a legitimate
// reason.
const RETARGET = `
  <div style="padding: 160px 40px 240px">
    <button id="anchor-a" style="position: fixed; top: 120px; left: 40px; width: 40px; height: 24px">A</button>
    <button id="anchor-b" style="position: fixed; top: 120px; left: 260px; width: 40px; height: 24px">B</button>
    <l-popover id="panel" for="anchor-a" trigger="manual" style="--show-duration: 0ms; --hide-duration: 0ms">Detail</l-popover>
  </div>
`;

const panelX = () => {
  const el = panel('panel').shadowRoot!.querySelector('[popover]') as HTMLElement;
  const rect = el.getBoundingClientRect();
  return rect.left + rect.width / 2;
};
const anchorX = (id: string) => {
  const rect = anchor(id).getBoundingClientRect();
  return rect.left + rect.width / 2;
};

describe('Retargeting an open panel', () => {
  it('follows `for` to the new anchor without closing', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();
    expect(panelX()).toBeCloseTo(anchorX('anchor-a'), 0);

    p.for = 'anchor-b';
    await settle();
    await settle();

    expect(p.open).toBe(true);
    expect(panelX()).toBeCloseTo(anchorX('anchor-b'), 0);
  });

  it('moves aria-expanded to the new anchor and collapses the old one', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();
    expect(anchor('anchor-a').getAttribute('aria-expanded')).toBe('true');

    p.for = 'anchor-b';
    await settle();
    await settle();

    expect(anchor('anchor-b').getAttribute('aria-expanded')).toBe('true');
    expect(anchor('anchor-a').getAttribute('aria-expanded')).toBe('false');
  });

  it('collapses the anchor that was expanded, not whatever `for` names at close time', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();
    p.for = 'anchor-b';
    await settle();
    await settle();

    p.open = false;
    await settle();
    // Re-resolving `for` at close time used to strand aria-expanded="true" on
    // the anchor that actually had it. Closing keeps the resting "false" — the
    // buttons are still triggers, just collapsed.
    expect(anchor('anchor-a').getAttribute('aria-expanded')).toBe('false');
    expect(anchor('anchor-b').getAttribute('aria-expanded')).toBe('false');
  });

  it('hides rather than float over unrelated content when the new anchor does not exist', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();

    p.for = 'anchor-gone';
    await settle();
    await settle();

    expect(p.open).toBe(false);
    expect(anchor('anchor-a').getAttribute('aria-expanded')).toBe('false');
  });

  it('drops aria-expanded entirely when the panel itself leaves the DOM', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();
    expect(anchor('anchor-a').getAttribute('aria-expanded')).toBe('true');

    p.remove();
    await new Promise((r) => setTimeout(r, 0));
    // Not "false": with the panel gone the button expands nothing at all, and
    // aria-expanded="false" would still advertise a disclosure relationship.
    expect(anchor('anchor-a').hasAttribute('aria-expanded')).toBe(false);
  });
});

describe('reposition()', () => {
  it('follows an anchor moved by CSS', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();

    const a = anchor('anchor-a');
    /* oxlint-disable eslint/no-await-in-loop -- the per-frame cadence is the
       point: each reposition must land before the next move. */
    for (let i = 1; i <= 8; i++) {
      a.style.left = `${40 + i * 20}px`;
      await new Promise((r) => requestAnimationFrame(r));
      await p.reposition();
    }
    /* oxlint-enable eslint/no-await-in-loop */
    expect(panelX()).toBeCloseTo(anchorX('anchor-a'), 0);
  });

  it('is a no-op when closed', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    await expect(p.reposition()).resolves.toBeUndefined();
    expect(p.open).toBe(false);
  });

  it('hides when the anchor has gone', async () => {
    await mount(RETARGET);
    const p = panel('panel');

    p.open = true;
    await settle();

    anchor('anchor-a').remove();
    await p.reposition();
    expect(p.open).toBe(false);
  });
});
