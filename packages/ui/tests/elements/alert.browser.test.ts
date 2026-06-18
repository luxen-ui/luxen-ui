import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/alert/index.js';
import type { Alert } from '../../src/html/elements/alert/alert.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// These tests drive l-alert the way a real user (and their screen reader)
// observes it: the variant-driven icon that gets injected, the close button's
// accessible name, and the cancelable hide → removal flow on dismiss.

let host: HTMLElement;

afterEach(() => {
  host?.remove();
});

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-alert');
  await settle();
  return host;
}

async function settle() {
  const el = host?.querySelector<Alert & { updateComplete: Promise<unknown> }>('l-alert');
  if (el) await el.updateComplete;
  // One macrotask flushes the MutationObserver content re-homing (a microtask)
  // and the zero-duration dismiss removal.
  await new Promise((r) => setTimeout(r, 0));
  if (el) await el.updateComplete;
}

const alert = () => host.querySelector<Alert>('l-alert')!;
const icon = () => host.querySelector('l-alert > .l-alert-icon');

// Transitions are disabled inline so the dismiss removal is synchronous.
const NO_ANIM = 'transition-duration: 0s';

describe('The leading icon reflects the variant', () => {
  it('injects the variant default icon as a decorative first child', async () => {
    await mount(`<l-alert variant="success">Saved</l-alert>`);
    expect(icon()).not.toBeNull();
    expect(icon()!.getAttribute('icon')).toBe('lucide:circle-check');
    expect(icon()!.getAttribute('aria-hidden')).toBe('true');
    expect(alert().firstElementChild).toBe(icon());
  });

  it('lets `icon` override the variant default', async () => {
    await mount(`<l-alert variant="info" icon="lucide:bell">Ping</l-alert>`);
    expect(icon()!.getAttribute('icon')).toBe('lucide:bell');
  });

  it('renders no icon when `without-icon` is set', async () => {
    await mount(`<l-alert variant="warning" without-icon>Careful</l-alert>`);
    expect(icon()).toBeNull();
  });

  it('reacts to a variant change after mount', async () => {
    await mount(`<l-alert variant="info">Hi</l-alert>`);
    alert().variant = 'danger';
    await settle();
    expect(icon()!.getAttribute('icon')).toBe('lucide:octagon-alert');
  });
});

describe('A user can dismiss a dismissible alert', () => {
  it('shows a close button with an accessible name', async () => {
    await mount(`<l-alert variant="info" dismissible>Note</l-alert>`);
    expect(page.getByRole('button', { name: 'Close' }).elements().length).toBe(1);
  });

  it('removes the alert from the DOM after clicking close', async () => {
    await mount(`<l-alert variant="info" dismissible style="${NO_ANIM}">Note</l-alert>`);
    const closed = waitForEvent(alert(), 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await closed;
    expect(host.querySelector('l-alert')).toBeNull();
  });

  it('runs the real animated dismiss path (transition → after-hide → removal)', async () => {
    // No NO_ANIM here: exercises the transitionend listener / fallback timer.
    await mount(`<l-alert variant="info" dismissible>Note</l-alert>`);
    const closed = waitForEvent(alert(), 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await closed;
    expect(host.querySelector('l-alert')).toBeNull();
  });

  it('ignores a second close activation while already dismissing', async () => {
    await mount(`<l-alert variant="info" dismissible>Note</l-alert>`);
    const el = alert();
    let hide = 0;
    let afterHide = 0;
    el.addEventListener('hide', () => hide++);
    el.addEventListener('after-hide', () => afterHide++);
    // Drive both activations from the focused close button so the second one
    // lands mid-animation (a locator click would wait for actionability and
    // never fire while the alert is fading out).
    await userEvent.tab();
    await userEvent.keyboard('{Enter}'); // first dismiss — starts the animation
    await userEvent.keyboard('{Enter}'); // second — must be ignored
    await new Promise((r) => setTimeout(r, 300));
    expect(hide).toBe(1);
    expect(afterHide).toBe(1);
    expect(host.querySelector('l-alert')).toBeNull();
  });

  it('keeps the alert when the cancelable hide event is prevented', async () => {
    await mount(`<l-alert variant="info" dismissible style="${NO_ANIM}">Note</l-alert>`);
    alert().addEventListener('hide', (e) => e.preventDefault());
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await settle();
    expect(host.querySelector('l-alert')).not.toBeNull();
  });

  it('drops the close button when `dismissible` is removed', async () => {
    await mount(`<l-alert variant="info" dismissible>Note</l-alert>`);
    alert().dismissible = false;
    await settle();
    expect(page.getByRole('button', { name: 'Close' }).elements().length).toBe(0);
  });
});

describe('Content reconciliation', () => {
  it('re-homes content appended after mount into the content wrapper', async () => {
    await mount(`<l-alert variant="info">Initial</l-alert>`);
    const el = alert();
    const added = document.createElement('p');
    added.textContent = 'Added later';
    el.append(added);
    await settle();
    const content = el.querySelector(':scope > .l-alert-content');
    expect(content?.contains(added)).toBe(true);
    expect(el.querySelector(':scope > p')).toBeNull();
  });

  it('keeps the body text inside the content wrapper, not the host row', async () => {
    await mount(`<l-alert variant="warning" without-icon>Plain string body</l-alert>`);
    const el = alert();
    const content = el.querySelector(':scope > .l-alert-content')!;
    // The bare text node must live inside the wrapper (the reason it exists).
    expect(content.textContent?.trim()).toBe('Plain string body');
    expect(
      [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
    ).toBe(false);
  });
});

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the close button as a focusable button named "Close" (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-alert variant="danger" dismissible>Error</l-alert>`);
      const btn = page.getByRole('button', { name: 'Close' }).element() as HTMLButtonElement;
      expect(btn.type).toBe('button');
    });

    it('hides the decorative icon from assistive tech (WCAG 1.1.1 / RGAA 1.1)', async () => {
      await mount(`<l-alert variant="info">Info</l-alert>`);
      expect(icon()!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Keyboard interaction', () => {
    it('dismisses via the keyboard-focused close button (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(`<l-alert variant="info" dismissible style="${NO_ANIM}">Note</l-alert>`);
      const closed = waitForEvent(alert(), 'after-hide');
      await userEvent.tab();
      await userEvent.keyboard('{Enter}');
      await closed;
      expect(host.querySelector('l-alert')).toBeNull();
    });
  });
});
