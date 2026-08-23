import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tooltip/index.js';
import type { Tooltip } from '../../src/html/elements/tooltip/tooltip.js';
import { deepActiveElement } from './support/a11y.js';
import { userEvent } from './support/user-event.js';
import { waitUntil } from './support/timing.js';

// These tests drive l-tooltip the way a person would — hovering triggers with a
// real (CDP) pointer, tabbing, pressing Escape — and assert what a user or
// their screen reader observes: which bubbles are visible, role=tooltip
// exposure, aria-describedby wiring, and focus placement.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-tooltip');
  await settle();
  // Trigger listeners attach on the animation frame after connect.
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 0));
  // Park the pointer away from the fixture: the previous test may have left
  // the cursor resting exactly where a trigger now sits, which auto-opens its
  // tooltip before the test performs its first hover.
  const park = document.createElement('div');
  park.style.cssText = 'position: fixed; right: 4px; bottom: 4px; width: 24px; height: 24px';
  host.append(park);
  await userEvent.hover(park);
  await waitUntil(() => openTips().length === 0);
  await settle();
  return host;
}

async function settle() {
  await Promise.all(
    [...host.querySelectorAll<Tooltip>('l-tooltip')].map((el) => el.updateComplete),
  );
  await new Promise((r) => setTimeout(r, 0));
}

const tip = (id: string) => host.querySelector<Tooltip>(`#${id}`)!;
const cell = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
const openTips = () => [...host.querySelectorAll<Tooltip>('l-tooltip[open]')];
const bubble = () => page.getByRole('tooltip');

// A GitHub-contributions-style waffle grid: small adjacent triggers whose
// neighbours sit inside each other's safe-polygon corridor (the shape that
// produced two simultaneously visible tooltips on the fleet heatmap).
const GRID = `
  <div style="padding: 120px 40px 200px">
    <div style="display: flex; gap: 3px">
      <button id="cell-a" style="width: 14px; height: 14px; padding: 0" aria-label="Machine A"></button>
      <button id="cell-b" style="width: 14px; height: 14px; padding: 0" aria-label="Machine B"></button>
      <button id="cell-c" style="width: 14px; height: 14px; padding: 0" aria-label="Machine C"></button>
    </div>
    <l-tooltip id="tip-a" for="cell-a" style="--show-duration: 0ms; --hide-duration: 0ms">Machine A — 12 632 pages</l-tooltip>
    <l-tooltip id="tip-b" for="cell-b" style="--show-duration: 0ms; --hide-duration: 0ms">Machine B — 4 790 pages</l-tooltip>
    <l-tooltip id="tip-c" for="cell-c" style="--show-duration: 0ms; --hide-duration: 0ms">Machine C — 890 pages</l-tooltip>
  </div>
`;

// The same waffle grid, but with a show-delay: opening (and therefore the
// single-open eviction) is deferred, so a fast sweep can leave a peer's polygon
// invalidated while the newcomer hasn't opened yet.
const GRID_DELAY = `
  <div style="padding: 120px 40px 200px">
    <div style="display: flex; gap: 3px">
      <button id="cell-a" style="width: 14px; height: 14px; padding: 0" aria-label="Machine A"></button>
      <button id="cell-b" style="width: 14px; height: 14px; padding: 0" aria-label="Machine B"></button>
    </div>
    <l-tooltip id="tip-a" for="cell-a" show-delay="400" style="--show-duration: 0ms; --hide-duration: 0ms">Machine A</l-tooltip>
    <l-tooltip id="tip-b" for="cell-b" show-delay="400" style="--show-duration: 0ms; --hide-duration: 0ms">Machine B</l-tooltip>
  </div>
`;

// The bubble opens 8px above the trigger (placement top). #midway sits inside
// the bubble's area — the bubble itself is pointer-events: none, so "moving the
// pointer into the bubble" is simulated by hovering this target underneath it.
const SINGLE = `
  <div style="padding: 120px 40px 200px">
    <button id="lonely">Learn more</button>
    <l-tooltip id="tip" for="lonely" style="--show-duration: 0ms; --hide-duration: 0ms">More information</l-tooltip>
    <button id="away" style="display: block; margin-top: 160px">Elsewhere</button>
    <div id="midway" style="position: fixed; left: 72px; top: 98px; width: 20px; height: 12px"></div>
  </div>
`;

// ---------------------------------------------------------------------------
// Only one hover tooltip is visible at a time
// ---------------------------------------------------------------------------

describe('Only one hover tooltip is visible at a time', () => {
  it('sweeping across adjacent small triggers leaves exactly the last tooltip open', async () => {
    await mount(GRID);

    await userEvent.hover(cell('cell-a'));
    await waitUntil(() => tip('tip-a').open);
    expect(tip('tip-a').open).toBe(true);

    // Moving to the neighbour keeps the cursor inside A's safe-polygon
    // corridor — before the single-open invariant this left A and B both open.
    await userEvent.hover(cell('cell-b'));
    await waitUntil(() => tip('tip-b').open && !tip('tip-a').open);
    expect(openTips().map((t) => t.id)).toEqual(['tip-b']);

    await userEvent.hover(cell('cell-c'));
    await waitUntil(() => tip('tip-c').open && !tip('tip-b').open);
    expect(openTips().map((t) => t.id)).toEqual(['tip-c']);
  });

  it('closes an open tooltip when the pointer reaches another trigger, even before the newcomer opens (show-delay sweep)', async () => {
    await mount(GRID_DELAY);

    await userEvent.hover(cell('cell-a'));
    await waitUntil(() => tip('tip-a').open);

    // Sweep onto B's trigger. B won't open until its 400ms dwell elapses, so
    // eviction-on-open can't close A in time. Reaching B's trigger proves the
    // pointer is no longer travelling toward A's bubble, so A must close now —
    // otherwise it is orphaned open with no pointermove left to hide it.
    await userEvent.hover(cell('cell-b'));
    await waitUntil(() => !tip('tip-a').open);
    expect(tip('tip-a').open).toBe(false);
    // The newcomer is still only pending — not yet shown.
    expect(tip('tip-b').open).toBe(false);
  });

  it('exposes a single role=tooltip bubble to assistive tech after the sweep', async () => {
    await mount(GRID);

    await userEvent.hover(cell('cell-a'));
    await waitUntil(() => tip('tip-a').open);
    await userEvent.hover(cell('cell-b'));

    // The evicted bubble is dismissed from the accessibility tree, not merely
    // deferred: exactly one tooltip stays exposed and it belongs to the new cell.
    await waitUntil(() => bubble().elements().length === 1);
    const exposed = bubble().elements();
    expect(exposed).toHaveLength(1);
    expect((exposed[0].getRootNode() as ShadowRoot).host.id).toBe('tip-b');
  });

  it('keeps the safe polygon working: the pointer can travel into the bubble', async () => {
    await mount(SINGLE);

    await userEvent.hover(cell('lonely'));
    await waitUntil(() => tip('tip').open);

    // Leaving the trigger toward the bubble must not close it (the whole
    // point of the safe polygon).
    await userEvent.hover(cell('midway'));
    await settle();
    expect(tip('tip').open).toBe(true);

    // …while leaving the bubble toward unrelated content still closes it.
    await userEvent.hover(cell('away'));
    await waitUntil(() => !tip('tip').open);
    expect(tip('tip').open).toBe(false);
  });

  it('stays open while the pointer rests on the bubble to read it', async () => {
    await mount(SINGLE);

    await userEvent.hover(cell('lonely'));
    await waitUntil(() => tip('tip').open);

    // Travel onto the bubble and stop — no further `pointermove` follows. The
    // rest fallback must NOT fire here: the bubble is a stable "stay open"
    // surface, not the transient corridor. Wait well past the ~200ms fallback.
    await userEvent.hover(cell('midway'));
    await sleep(400);
    await settle();
    expect(tip('tip').open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// The tooltip hides when the pointer leaves and comes to rest
// ---------------------------------------------------------------------------

describe('The tooltip hides when the pointer leaves and comes to rest', () => {
  it('closes even when no pointermove follows the pointerleave (flick-and-stop)', async () => {
    await mount(SINGLE);

    await userEvent.hover(cell('lonely'));
    await waitUntil(() => tip('tip').open);

    // Flick-and-stop: the pointer leaves the trigger and immediately rests, so
    // the browser fires `pointerleave` but no further `pointermove`. The safe
    // polygon is only re-checked on move, so nothing after the leave could ever
    // close the tooltip — the timed fallback must hide it on its own.
    const trigger = cell('lonely');
    const r = trigger.getBoundingClientRect();
    trigger.dispatchEvent(
      new PointerEvent('pointerleave', {
        clientX: r.left + r.width / 2,
        clientY: r.bottom + 200, // far below, opposite the top-placed bubble
      }),
    );

    await waitUntil(() => !tip('tip').open);
    expect(tip('tip').open).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// A dwell delay filters out pass-through hovers
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A single trigger with a dwell delay on both directions. `away` sits far below,
// opposite the bubble, so leaving toward it exits the safe polygon at once.
const DELAY = `
  <div style="padding: 120px 40px 240px">
    <button id="dwell">Save</button>
    <l-tooltip id="tip" for="dwell" show-delay="250" hide-delay="250" style="--show-duration: 0ms; --hide-duration: 0ms">Save changes</l-tooltip>
    <button id="away" style="display: block; margin-top: 160px">Elsewhere</button>
  </div>
`;

describe('A dwell delay filters out pass-through hovers', () => {
  it('waits show-delay before opening — a resting pointer eventually shows it', async () => {
    await mount(DELAY);

    await userEvent.hover(cell('dwell'));
    // The dwell has not elapsed: the tooltip stays closed just after entering.
    await settle();
    expect(tip('tip').open).toBe(false);

    // Once the pointer has rested long enough, it opens.
    await waitUntil(() => tip('tip').open);
    expect(tip('tip').open).toBe(true);
  });

  it('cancels the pending open if the pointer leaves before the dwell elapses', async () => {
    await mount(DELAY);

    // Sweep across: enter then leave well before show-delay (250ms).
    await userEvent.hover(cell('dwell'));
    await userEvent.hover(cell('away'));

    // Past the original delay, the tooltip never opened and never wired ARIA.
    await sleep(350);
    await settle();
    expect(tip('tip').open).toBe(false);
    expect(cell('dwell').hasAttribute('aria-describedby')).toBe(false);
  });

  it('opens immediately on focus, ignoring the pointer dwell delay (WCAG 2.1.1 / RGAA 7.3)', async () => {
    await mount(DELAY);

    await userEvent.tab(); // focus lands on the trigger button
    // No wait: focus is a discrete affordance, so the delay must not apply.
    await settle();
    expect(tip('tip').open).toBe(true);
  });

  it('drops the pending open when the trigger is removed before the dwell elapses', async () => {
    await mount(DELAY);

    const removed = tip('tip');
    await userEvent.hover(cell('dwell'));
    removed.remove(); // disconnect must clear the queued show

    await sleep(350);
    expect(removed.open).toBe(false);
  });

  it('bridges a brief exit-and-return within hide-delay without flicker', async () => {
    await mount(DELAY);

    await userEvent.hover(cell('dwell'));
    await waitUntil(() => tip('tip').open);

    // Leave toward unrelated content — the safe polygon schedules a delayed hide.
    await userEvent.hover(cell('away'));
    // Return to the trigger within the hide-delay window: it must stay open.
    await userEvent.hover(cell('dwell'));
    await sleep(50);
    await settle();
    expect(tip('tip').open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A modal returning focus to a clicked trigger does not resurrect the tooltip
// ---------------------------------------------------------------------------

// A trigger that opens a modal <dialog>. Native `showModal()`/`close()`
// reproduces l-dialog's focus restoration: closing returns focus to the
// element that had it, firing `focusin` on the trigger.
const DIALOG = `
  <div style="padding: 120px 40px 200px">
    <button id="opener">Actions</button>
    <l-tooltip id="tip" for="opener" style="--show-duration: 0ms; --hide-duration: 0ms">Voir / ajouter des notes</l-tooltip>
    <dialog id="dlg" style="inset: 0; margin: auto">
      <p>Notes</p>
      <button id="dlg-close">Close</button>
    </dialog>
  </div>
`;

describe('A modal returning focus to a clicked trigger does not resurrect the tooltip', () => {
  function wireDialog() {
    const dlg = host.querySelector<HTMLDialogElement>('#dlg')!;
    cell('opener').addEventListener('click', () => dlg.showModal());
    cell('dlg-close').addEventListener('click', () => dlg.close());
    return dlg;
  }

  it('stays hidden after a mouse-opened dialog closes (the reported l-dialog bug)', async () => {
    await mount(DIALOG);
    wireDialog();

    // Hover shows the tooltip; clicking opens the modal, which pulls focus off
    // the trigger — so the tooltip hides.
    await userEvent.hover(cell('opener'));
    await waitUntil(() => tip('tip').open);
    await userEvent.click(cell('opener'));
    await waitUntil(() => !tip('tip').open);

    // Dismiss the modal with the mouse (over the close button, away from the
    // opener). The dialog restores focus to the opener, firing `focusin` — but
    // this was a pointer interaction, so the trigger is not `:focus-visible`
    // and the tooltip must not reappear.
    await userEvent.click(cell('dlg-close'));
    await settle();
    await sleep(50);
    expect(tip('tip').open).toBe(false);
  });

  it('still reappears for a keyboard user when the dialog returns focus (WCAG 2.1.1 / RGAA 7.3)', async () => {
    await mount(DIALOG);
    wireDialog();

    // A keyboard user tabs to the trigger (tooltip shows), activates it to open
    // the modal, then presses Escape to close it. Focus returns to the trigger
    // as `:focus-visible`, so the tooltip should come back — the accessible
    // behaviour the pointer path deliberately suppresses.
    await userEvent.tab();
    await waitUntil(() => tip('tip').open);
    await userEvent.keyboard('{Enter}');
    await waitUntil(() => !tip('tip').open);

    await userEvent.keyboard('{Escape}');
    await waitUntil(() => tip('tip').open);
    expect(tip('tip').open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Manual tooltips opt out of the single-open invariant
// ---------------------------------------------------------------------------

describe('Manual tooltips opt out of the single-open invariant', () => {
  const MANUAL = `
    <div style="padding: 120px 40px 200px">
      <div style="display: flex; gap: 24px">
        <button id="cell-a" aria-label="Step one"></button>
        <button id="cell-b" aria-label="Step two"></button>
        <button id="cell-h" aria-label="Hoverable"></button>
      </div>
      <l-tooltip id="man-a" for="cell-a" trigger="manual" style="--show-duration: 0ms; --hide-duration: 0ms">Coach mark one</l-tooltip>
      <l-tooltip id="man-b" for="cell-b" trigger="manual" style="--show-duration: 0ms; --hide-duration: 0ms">Coach mark two</l-tooltip>
      <l-tooltip id="tip-h" for="cell-h" style="--show-duration: 0ms; --hide-duration: 0ms">Hover me</l-tooltip>
    </div>
  `;

  it('two manual tooltips shown programmatically stay open together', async () => {
    await mount(MANUAL);

    tip('man-a').show();
    tip('man-b').show();
    await settle();

    expect(openTips().map((t) => t.id)).toEqual(['man-a', 'man-b']);
  });

  it('a hover-triggered open does not evict manual tooltips', async () => {
    await mount(MANUAL);

    tip('man-a').show();
    tip('man-b').show();
    await settle();

    await userEvent.hover(cell('cell-h'));
    await waitUntil(() => tip('tip-h').open);

    expect(openTips().map((t) => t.id)).toEqual(['man-a', 'man-b', 'tip-h']);
  });
});

// ---------------------------------------------------------------------------
// The `for` property reflects to the attribute
// ---------------------------------------------------------------------------

describe('The `for` property reflects to the attribute', () => {
  it('setting the property makes [for="…"] selectors match (framework prop-binding support)', async () => {
    await mount(`
      <button id="target">Target</button>
      <l-tooltip>Set via property</l-tooltip>
    `);

    // Vue/React set `for` as a DOM property on custom elements — DOM-level
    // tooling (CSS, querySelector, consumer workarounds) must still see it.
    const tooltip = host.querySelector<Tooltip>('l-tooltip')!;
    tooltip.for = 'target';
    await tooltip.updateComplete;

    expect(tooltip.getAttribute('for')).toBe('target');
    expect(host.querySelector('l-tooltip[for="target"]')).toBe(tooltip);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the bubble with role=tooltip and its text while open (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(SINGLE);
      expect(bubble().query()).toBeNull();

      await userEvent.hover(cell('lonely'));
      await waitUntil(() => bubble().query() !== null);
      const exposed = bubble().query()!;
      expect((exposed.getRootNode() as ShadowRoot).host).toBe(tip('tip'));
      // The slotted text renders inside the bubble (light DOM, composed tree).
      expect(tip('tip').textContent).toContain('More information');
    });

    it('links the trigger to the bubble via aria-describedby only while open', async () => {
      await mount(SINGLE);
      expect(cell('lonely').hasAttribute('aria-describedby')).toBe(false);

      await userEvent.hover(cell('lonely'));
      await waitUntil(() => cell('lonely').hasAttribute('aria-describedby'));
      expect(cell('lonely').getAttribute('aria-describedby')).toBeTruthy();

      await userEvent.hover(cell('away'));
      await waitUntil(() => !cell('lonely').hasAttribute('aria-describedby'));
      expect(cell('lonely').hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('Keyboard interaction (APG tooltip)', () => {
    it('shows the tooltip when the trigger receives keyboard focus (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(SINGLE);

      await userEvent.tab(); // focus lands on the trigger button
      await waitUntil(() => tip('tip').open);
      expect(tip('tip').open).toBe(true);
    });

    it('dismisses with Escape without moving focus (WCAG 1.4.13)', async () => {
      await mount(SINGLE);

      await userEvent.tab();
      await waitUntil(() => tip('tip').open);

      await userEvent.keyboard('{Escape}');
      await waitUntil(() => !tip('tip').open);
      expect(tip('tip').open).toBe(false);
      expect(deepActiveElement()).toBe(cell('lonely'));
    });

    it('hides when focus moves off the trigger (WCAG 1.4.13)', async () => {
      await mount(SINGLE);

      await userEvent.tab();
      await waitUntil(() => tip('tip').open);

      await userEvent.tab();
      await waitUntil(() => !tip('tip').open);
      expect(tip('tip').open).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('never moves focus into the bubble — focus stays on the trigger while open (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(SINGLE);

      await userEvent.tab();
      await waitUntil(() => tip('tip').open);
      expect(deepActiveElement()).toBe(cell('lonely'));
    });
  });
});

// Two widely spaced anchors and one manually driven tooltip: the shape a
// consumer uses when a single instance serves a whole chart. Spacing is what
// makes "did the bubble actually move?" assertable by rect rather than by
// implementation detail — but both must stay inside the 414px-wide test
// viewport, or `shift()` clamps the bubble and the rect stops matching the
// anchor for a legitimate reason.
const RETARGET = `
  <div style="padding: 160px 40px 240px">
    <button id="anchor-a" style="position: fixed; top: 120px; left: 40px; width: 40px; height: 24px">A</button>
    <button id="anchor-b" style="position: fixed; top: 120px; left: 280px; width: 40px; height: 24px">B</button>
    <l-tooltip id="tip" for="anchor-a" trigger="manual" style="--show-duration: 0ms; --hide-duration: 0ms">Detail</l-tooltip>
  </div>
`;

/** Centre-x of the bubble, in viewport pixels. */
const bubbleX = () => {
  const el = tip('tip').shadowRoot!.querySelector('[popover]') as HTMLElement;
  const rect = el.getBoundingClientRect();
  return rect.left + rect.width / 2;
};
const anchorX = (id: string) => {
  const rect = cell(id).getBoundingClientRect();
  return rect.left + rect.width / 2;
};

describe('Retargeting a shared instance', () => {
  it('follows `for` to the new anchor without closing (no reposition on retarget)', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await waitUntil(() => t.open);
    await settle();
    expect(bubbleX()).toBeCloseTo(anchorX('anchor-a'), 0);

    t.for = 'anchor-b';
    // Deliberately no long poll. `updatePosition` resolves the trigger freshly,
    // so any incidental observer tick would eventually land the bubble on B
    // even unfixed — polling for two seconds tests luck, not the fix. What has
    // to be true is that retargeting *schedules* the move, so assert as soon as
    // the update has settled.
    await settle();
    await settle();

    // The move must not have gone through a close/reopen.
    expect(t.open).toBe(true);
    expect(bubbleX()).toBeCloseTo(anchorX('anchor-b'), 0);
  });

  it('moves aria-describedby to the new anchor (a screen reader must not describe the old one)', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();
    expect(cell('anchor-a').getAttribute('aria-describedby')).toBeTruthy();

    t.for = 'anchor-b';
    await settle();
    await waitUntil(() => cell('anchor-b').hasAttribute('aria-describedby'));
    expect(cell('anchor-a').hasAttribute('aria-describedby')).toBe(false);
  });

  it('clears aria-describedby from the anchor that received it, not from whatever `for` names at close time', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();
    t.for = 'anchor-b';
    await settle();
    await settle();
    // Prove the retarget actually moved it before asserting the close clears it
    // — otherwise this passes on code that never retargets ARIA at all.
    expect(cell('anchor-b').getAttribute('aria-describedby')).toBeTruthy();

    t.open = false;
    await settle();
    // Both must be clean: re-resolving `for` at close time used to strand the
    // attribute on the anchor that actually had it.
    expect(cell('anchor-a').hasAttribute('aria-describedby')).toBe(false);
    expect(cell('anchor-b').hasAttribute('aria-describedby')).toBe(false);
  });

  it('hides instead of floating over unrelated content when the new anchor does not exist', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();

    t.for = 'anchor-gone';
    await settle();
    await waitUntil(() => !t.open);

    expect(t.open).toBe(false);
    expect(cell('anchor-a').hasAttribute('aria-describedby')).toBe(false);
  });

  it('opens on the new anchor when `for` and `open` change in the same update', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    // The common consumer pattern: point at the hovered datum and show, in one
    // tick. The open path must own positioning — no competing retarget.
    t.for = 'anchor-b';
    t.open = true;
    await settle();
    await waitUntil(() => Math.abs(bubbleX() - anchorX('anchor-b')) < 1);

    expect(t.open).toBe(true);
    expect(cell('anchor-b').getAttribute('aria-describedby')).toBeTruthy();
    expect(cell('anchor-a').hasAttribute('aria-describedby')).toBe(false);
  });

  it('drops aria-describedby when the tooltip itself leaves the DOM', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();
    expect(cell('anchor-a').getAttribute('aria-describedby')).toBeTruthy();

    t.remove();
    await settle();
    expect(cell('anchor-a').hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('reposition()', () => {
  it('follows an anchor moved by CSS, which Floating UI misses at frame rate', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();

    // Move once per frame, the cadence that starves floating-ui's IntersectionObserver
    // move detector and leaves the bubble a full second behind.
    const a = cell('anchor-a');
    /* oxlint-disable eslint/no-await-in-loop -- the per-frame cadence is the
       point: each reposition must land before the next move. */
    for (let i = 1; i <= 10; i++) {
      a.style.left = `${40 + i * 20}px`;
      await new Promise((r) => requestAnimationFrame(r));
      await t.reposition();
    }
    /* oxlint-enable eslint/no-await-in-loop */
    expect(bubbleX()).toBeCloseTo(anchorX('anchor-a'), 0);
  });

  it('is a no-op when closed', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    await expect(t.reposition()).resolves.toBeUndefined();
    expect(t.open).toBe(false);
  });

  it('hides when the anchor has gone', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();

    cell('anchor-a').remove();
    await t.reposition();
    expect(t.open).toBe(false);
  });
});

describe('Repositioning that races a close', () => {
  it('does not re-apply aria-describedby when the tooltip closes mid-flight', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();
    expect(cell('anchor-a').getAttribute('aria-describedby')).toBeTruthy();

    // `reposition()` awaits `computePosition`, which is async. Close inside
    // that gap: the close path clears the attribute, and the resuming
    // reposition must not write it back onto a now-hidden bubble.
    const inFlight = t.reposition();
    t.open = false;
    await inFlight;
    await settle();

    expect(t.open).toBe(false);
    expect(cell('anchor-a').hasAttribute('aria-describedby')).toBe(false);
  });

  it('lands on the final anchor when `for` is written twice in one tick', async () => {
    await mount(RETARGET);
    const t = tip('tip');

    t.open = true;
    await settle();

    t.for = 'anchor-b';
    t.for = 'anchor-a';
    await settle();
    await settle();

    // Lit coalesces both writes into a single update, so the bubble must end
    // up on the last value written rather than on the intermediate one.
    expect(cell('anchor-a').getAttribute('aria-describedby')).toBeTruthy();
    expect(cell('anchor-b').hasAttribute('aria-describedby')).toBe(false);
    expect(bubbleX()).toBeCloseTo(anchorX('anchor-a'), 0);
  });
});
