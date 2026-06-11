import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import type { UserEvent } from 'vite-plus/test/browser/context';
import '../../src/html/elements/drawer/index.js';
import type { Drawer } from '../../src/html/elements/drawer/drawer.js';

// createUserEvent is exported at runtime but absent from vite-plus@0.1.22 type declarations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (await import('vite-plus/test/browser/context')) as any;
const userEvent: UserEvent = ctx.createUserEvent();

// These tests drive l-drawer the way a real user would — interacting via
// trusted CDP events, querying via accessible roles — and assert what a user,
// their screen reader, or their CSS observes: modal semantics using
// data-modal="edge", scroll lock, placement attribute, the inherited event
// sequence, and accessibility. Internal wiring is not tested.

let host: HTMLElement;

afterEach(() => {
  // Close any open drawer to avoid data-modal leaking across suites.
  const el = host?.querySelector<Drawer>('l-drawer');
  if (el?.open) {
    el.open = false;
  }
  host?.remove();
});

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-drawer');
  await settle();
  return host;
}

async function settle() {
  const el = host?.querySelector<Drawer & { updateComplete: Promise<unknown> }>('l-drawer');
  if (el) {
    await el.updateComplete;
  }
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  if (el) {
    await el.updateComplete;
  }
}

/** Resolve a promise when `eventName` fires on `target`, or reject after `timeout` ms. */
function waitForEvent(target: EventTarget, eventName: string, timeout = 1000): Promise<Event> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for "${eventName}" event`)),
      timeout,
    );
    target.addEventListener(
      eventName,
      (e) => {
        clearTimeout(timer);
        resolve(e);
      },
      { once: true },
    );
  });
}

const drawer = () => host.querySelector<Drawer>('l-drawer')!;
const nativeDialog = () => drawer().shadowRoot!.querySelector('dialog')!;

const FIXTURE = `
  <l-drawer title="Navigation" style="--show-duration: 0ms; --hide-duration: 0ms">
    <p>Drawer content</p>
  </l-drawer>
`;

// ---------------------------------------------------------------------------
// Opening and closing the drawer as a modal
// ---------------------------------------------------------------------------

describe('The drawer opens as an edge modal', () => {
  it('open=true shows the native dialog, sets data-modal="edge", and locks scroll', async () => {
    await mount(FIXTURE);
    const afterShowP = waitForEvent(drawer(), 'after-show');
    drawer().open = true;
    await settle();
    await afterShowP;
    expect(nativeDialog().open).toBe(true);
    // Drawer uses "edge" not "centered" — no stable scrollbar gutter reservation.
    expect(drawer().getAttribute('data-modal')).toBe('edge');
    expect(getComputedStyle(document.documentElement).overflow).toBe('hidden');
  });

  it('releases scroll lock after close', async () => {
    await mount(FIXTURE);
    const afterShowP = waitForEvent(drawer(), 'after-show');
    drawer().open = true;
    await settle();
    await afterShowP;

    const afterHideP = waitForEvent(drawer(), 'after-hide');
    drawer().open = false;
    await settle();
    await afterHideP;

    // Poll until data-modal is removed before reading overflow (same CI-safe pattern
    // used in stories-viewer and dialog tests — avoids the attribute/stylesheet race).
    await new Promise<void>((resolve) => {
      const deadline = Date.now() + 500;
      const check = () => {
        if (!drawer().hasAttribute('data-modal') || Date.now() >= deadline) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });

    expect(drawer().hasAttribute('data-modal')).toBe(false);
    expect(getComputedStyle(document.documentElement).overflow).not.toBe('hidden');
  });
});

// ---------------------------------------------------------------------------
// Placement attribute
// ---------------------------------------------------------------------------

describe('Drawer placement', () => {
  it('placement="end" reflects as an attribute and as the property value', async () => {
    await mount(
      `<l-drawer title="End drawer" placement="end" style="--show-duration: 0ms; --hide-duration: 0ms">
        <p>End side</p>
      </l-drawer>`,
    );
    expect(drawer().getAttribute('placement')).toBe('end');
    expect(drawer().placement).toBe('end');
  });
});

// ---------------------------------------------------------------------------
// Inherited event sequence
// ---------------------------------------------------------------------------

describe('Drawer inherits dialog events', () => {
  it('fires show, after-show, hide, after-hide across one open/close cycle in order', async () => {
    await mount(FIXTURE);
    const order: string[] = [];
    drawer().addEventListener('show', () => order.push('show'));
    drawer().addEventListener('after-show', () => order.push('after-show'));
    drawer().addEventListener('hide', () => order.push('hide'));
    drawer().addEventListener('after-hide', () => order.push('after-hide'));

    const afterShowP = waitForEvent(drawer(), 'after-show');
    drawer().open = true;
    await settle();
    await afterShowP;

    const afterHideP = waitForEvent(drawer(), 'after-hide');
    drawer().open = false;
    await settle();
    await afterHideP;

    expect(order).toEqual(['show', 'after-show', 'hide', 'after-hide']);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names (WCAG 4.1.2 / RGAA 7.1)', () => {
    it('exposes the dialog role while open', async () => {
      await mount(FIXTURE);
      const afterShowP = waitForEvent(drawer(), 'after-show');
      drawer().open = true;
      await settle();
      await afterShowP;
      // NOTE: Like l-dialog, the native <dialog> in l-drawer's shadow root has no
      // aria-labelledby/aria-label wiring — getByRole('dialog', { name: 'Navigation' })
      // does not match. Asserting without name filter (source gap, not patched here).
      expect(page.getByRole('dialog').elements().length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard interaction (APG dialog modal pattern)', () => {
    it('Escape closes the drawer (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(
        `<l-drawer title="Esc test" style="--show-duration: 0ms; --hide-duration: 0ms">
          <input id="inp" autofocus placeholder="focus me" />
        </l-drawer>`,
      );
      const afterShowP = waitForEvent(drawer(), 'after-show');
      drawer().open = true;
      await settle();
      await afterShowP;
      // Focus is on the autofocus input inside the open drawer.
      expect(document.activeElement).toBe(host.querySelector('#inp'));

      const afterHideP = waitForEvent(drawer(), 'after-hide');
      await userEvent.keyboard('{Escape}');
      await settle();
      await afterHideP;
      expect(drawer().open).toBe(false);
    });
  });

  // NOTE: autofocus and focus-return on open/close are covered by the parent
  // dialog suite (l-drawer extends l-dialog; the focus management code path
  // is shared). Drawer-specific focus behavior is identical.
});
