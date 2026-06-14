import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/input-group/index.js';
import { userEvent } from './support/user-event.js';
import { deepActiveElement } from './support/a11y.js';

// These tests drive l-input-group the way a person would — tabbing to the
// password toggle and activating it — and assert what a user (or their screen
// reader) observes: the revealed/masked value, the toggle's pressed state, and
// where focus lands. All interactions use userEvent (trusted CDP events).

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-input-group');
  await settle();
  return host;
}

// l-input-group is a progressive light-DOM element: _setup() runs synchronously
// when children are parsed, with a single macrotask retry. One macrotask is
// enough to settle after a toggle click (no Lit render is involved).
async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector('l-input-group')!;
const input = () => el().querySelector<HTMLInputElement>('input')!;
const toggleBtn = () => page.getByRole('button', { name: 'Show password' });

const PASSWORD_GROUP = `
  <l-input-group password-toggle>
    <input type="password" value="hunter2" aria-label="Password" />
  </l-input-group>
`;

// ---------------------------------------------------------------------------
// Upgrade & injection
// ---------------------------------------------------------------------------

describe('l-input-group injects the password toggle at upgrade time', () => {
  it('renders one toggle button with an accessible name and unpressed state', async () => {
    await mount(PASSWORD_GROUP);
    const buttons = el().querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute('aria-label')).toBe('Show password');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('does not inject a button without the password-toggle attribute', async () => {
    await mount(`
      <l-input-group>
        <input type="password" value="hunter2" aria-label="Password" />
      </l-input-group>
    `);
    expect(el().querySelectorAll('button')).toHaveLength(0);
  });

  it('does not inject a button for a non-text control', async () => {
    await mount(`
      <l-input-group password-toggle>
        <input type="search" aria-label="Search" />
      </l-input-group>
    `);
    expect(el().querySelectorAll('button')).toHaveLength(0);
  });

  it('removes the button and re-masks the value when password-toggle is removed', async () => {
    await mount(PASSWORD_GROUP);
    await userEvent.click(toggleBtn());
    await settle();
    expect(input().type).toBe('text');

    el().removeAttribute('password-toggle');
    await settle();
    expect(el().querySelectorAll('button')).toHaveLength(0);
    expect(input().type).toBe('password');
  });
});

// ---------------------------------------------------------------------------
// Re-entrant setup (move in DOM)
// ---------------------------------------------------------------------------

describe('l-input-group survives being moved in the DOM', () => {
  it('still has exactly one toggle button after a remove-then-reattach', async () => {
    await mount(PASSWORD_GROUP);
    const group = el() as HTMLElement;
    group.remove();
    document.body.append(group);
    // Re-assign host so afterEach removes the re-appended element.
    host = group;
    await settle();
    expect(group.querySelectorAll('button')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Immediate-disconnect guard
// ---------------------------------------------------------------------------

describe('l-input-group does not initialize after an immediate disconnect', () => {
  it('has no injected button when connected without children then removed before the retry fires', async () => {
    await customElements.whenDefined('l-input-group');
    const group = document.createElement('l-input-group');
    group.setAttribute('password-toggle', '');
    document.body.append(group);
    group.remove();
    await settle();
    expect(group.querySelectorAll('button')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Toggling the password visibility
// ---------------------------------------------------------------------------

describe('A user can reveal and re-mask the password', () => {
  it('clicking the toggle reveals the value (type becomes text) and presses the button', async () => {
    await mount(PASSWORD_GROUP);
    await userEvent.click(toggleBtn());
    await settle();
    expect(input().type).toBe('text');
    expect(input().value).toBe('hunter2');
    const btn = el().querySelector('button')!;
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    // APG toggle-button pattern: the label stays fixed; only the state changes.
    expect(btn.getAttribute('aria-label')).toBe('Show password');
  });

  it('clicking the toggle again re-masks the value and releases the button', async () => {
    await mount(PASSWORD_GROUP);
    await userEvent.click(toggleBtn());
    await settle();
    await userEvent.click(toggleBtn());
    await settle();
    expect(input().type).toBe('password');
    expect(el().querySelector('button')!.getAttribute('aria-pressed')).toBe('false');
  });

  it('the value is preserved across toggles', async () => {
    await mount(PASSWORD_GROUP);
    await userEvent.click(toggleBtn());
    await settle();
    await userEvent.click(toggleBtn());
    await settle();
    expect(input().value).toBe('hunter2');
  });

  it('the toggle is disabled while the input is disabled', async () => {
    await mount(PASSWORD_GROUP);
    input().disabled = true;
    await settle();
    expect(el().querySelector('button')!.disabled).toBe(true);

    input().disabled = false;
    await settle();
    expect(el().querySelector('button')!.disabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the input and the toggle button to assistive tech (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(PASSWORD_GROUP);
      // The password input keeps its accessible name… (`exact` — otherwise the
      // substring also matches the toggle's "Show password" label)
      expect(page.getByLabelText('Password', { exact: true }).query()).not.toBeNull();
      // …and the toggle is a named button with a pressed state.
      const btn = toggleBtn().element() as HTMLButtonElement;
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Keyboard interaction (APG button)', () => {
    it('activates the toggle with Enter (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(PASSWORD_GROUP);
      await userEvent.click(input());
      await userEvent.tab(); // input → toggle button
      await userEvent.keyboard('{Enter}');
      await settle();
      expect(input().type).toBe('text');
    });

    it('activates the toggle with Space (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(PASSWORD_GROUP);
      await userEvent.click(input());
      await userEvent.tab();
      await userEvent.keyboard(' ');
      await settle();
      expect(input().type).toBe('text');
    });
  });

  describe('Focus management', () => {
    it('keeps focus on the toggle button after activating it (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(PASSWORD_GROUP);
      await userEvent.click(input());
      await userEvent.tab();
      const btn = el().querySelector('button')!;
      expect(deepActiveElement()).toBe(btn);
      await userEvent.keyboard('{Enter}');
      await settle();
      expect(deepActiveElement()).toBe(btn);
    });

    it('the input stays in the tab order before the toggle', async () => {
      await mount(PASSWORD_GROUP);
      await userEvent.click(input());
      expect(deepActiveElement()).toBe(input());
      await userEvent.tab();
      expect(deepActiveElement()).toBe(el().querySelector('button'));
    });
  });
});
