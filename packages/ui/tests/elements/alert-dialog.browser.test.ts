import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/alert-dialog/index.js';
import type { AlertDialog } from '../../src/html/elements/alert-dialog/alert-dialog.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';
import { deepActiveElement } from './support/a11y.js';

// These tests drive l-alert-dialog the way a real user would — clicking the
// built-in actions, pressing Escape — and assert what a user, their screen
// reader, or the page observes: the alertdialog role, an accessible
// name + description, cancelable confirm/cancel intents, auto-close, and the
// focus default landing on the least destructive action.

let host: HTMLElement;

afterEach(() => {
  const el = host?.querySelector<AlertDialog>('l-alert-dialog');
  if (el?.open) el.open = false;
  host?.remove();
});

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-alert-dialog');
  await settle();
  return host;
}

async function settle() {
  const el = host?.querySelector<AlertDialog & { updateComplete: Promise<unknown> }>(
    'l-alert-dialog',
  );
  if (el) await el.updateComplete;
  // Two macrotask passes: dialog.close() runs _onNativeClose synchronously,
  // which sets open=false and schedules a second Lit cycle.
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  if (el) await el.updateComplete;
}

const alert = () => host.querySelector<AlertDialog>('l-alert-dialog')!;
const nativeDialog = () => alert().shadowRoot!.querySelector('dialog')!;

const FIXTURE = `
  <button id="invoker" commandfor="dlg" command="--show">Open</button>
  <l-alert-dialog
    id="dlg"
    title="Delete this project?"
    confirm-text="Delete"
    cancel-text="Keep"
    style="--show-duration: 0ms; --hide-duration: 0ms"
  >
    This permanently deletes the project. This action cannot be undone.
  </l-alert-dialog>
`;

async function open() {
  alert().open = true;
  await settle();
}

describe('Confirming and dismissing', () => {
  it('renders built-in confirm and cancel actions from the text props', async () => {
    await mount(FIXTURE);
    await open();
    expect(page.getByRole('button', { name: 'Delete' }).elements().length).toBe(1);
    expect(page.getByRole('button', { name: 'Keep' }).elements().length).toBe(1);
  });

  it('clicking confirm fires confirm then auto-closes', async () => {
    await mount(FIXTURE);
    await open();
    const confirmed = waitForEvent(alert(), 'confirm');
    await userEvent.click(page.getByRole('button', { name: 'Delete' }));
    await confirmed;
    await settle();
    expect(nativeDialog().open).toBe(false);
  });

  it('clicking cancel fires cancel then auto-closes', async () => {
    await mount(FIXTURE);
    await open();
    const canceled = waitForEvent(alert(), 'cancel');
    await userEvent.click(page.getByRole('button', { name: 'Keep' }));
    await canceled;
    await settle();
    expect(nativeDialog().open).toBe(false);
  });

  it('preventDefault() on confirm keeps it open for async work', async () => {
    await mount(FIXTURE);
    await open();
    alert().addEventListener('confirm', (e) => e.preventDefault());
    await userEvent.click(page.getByRole('button', { name: 'Delete' }));
    await settle();
    expect(nativeDialog().open).toBe(true);
  });

  it('Escape fires cancel and closes', async () => {
    await mount(FIXTURE);
    await open();
    const canceled = waitForEvent(alert(), 'cancel');
    await userEvent.keyboard('{Escape}');
    await canceled;
    await settle();
    expect(nativeDialog().open).toBe(false);
  });

  it('preventDefault() on cancel blocks Escape from closing', async () => {
    await mount(FIXTURE);
    await open();
    alert().addEventListener('cancel', (e) => e.preventDefault());
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(nativeDialog().open).toBe(true);
  });
});

describe('Loading', () => {
  it('marks the confirm action busy via aria-disabled, keeping it in the a11y tree', async () => {
    await mount(FIXTURE);
    await open();
    alert().loading = true;
    await settle();
    const confirm = nativeDialog().querySelector('[data-confirm]')!;
    // aria-disabled keeps it focusable + in the a11y tree (focus trap stays
    // intact); native `disabled` would remove it from both.
    expect(confirm.getAttribute('aria-disabled')).toBe('true');
    expect(confirm.getAttribute('aria-busy')).toBe('true');
    expect(confirm.hasAttribute('disabled')).toBe(false);
    // Still exposed as a disabled button named "Delete" — the spinner is
    // decorative (aria-hidden), so it doesn't pollute the accessible name.
    expect(page.getByRole('button', { name: 'Delete', disabled: true }).elements().length).toBe(1);
  });

  it('keeps the cancel action operable while loading', async () => {
    await mount(FIXTURE);
    await open();
    alert().loading = true;
    await settle();
    const cancel = nativeDialog().querySelector('[data-cancel]')!;
    expect(cancel.hasAttribute('disabled')).toBe(false);
    expect(cancel.getAttribute('aria-disabled')).toBeNull();
    const canceled = waitForEvent(alert(), 'cancel');
    await userEvent.click(page.getByRole('button', { name: 'Keep' }));
    await canceled;
    await settle();
    expect(nativeDialog().open).toBe(false);
  });

  it('keeps a slotted confirm action operable while loading (loading only governs the built-in)', async () => {
    await mount(`
      <l-alert-dialog id="dlg" title="Delete?"
        style="--show-duration: 0ms; --hide-duration: 0ms">
        Body.
        <button slot="confirm" class="l-button">Delete</button>
      </l-alert-dialog>
    `);
    await open();
    alert().loading = true;
    await settle();
    const confirmed = waitForEvent(alert(), 'confirm');
    await userEvent.click(page.getByRole('button', { name: 'Delete' }));
    await confirmed;
  });
});

describe('Interruptive (no outside dismiss)', () => {
  it('forces light-dismiss off — backdrop dismissal never closes it', async () => {
    await mount(FIXTURE.replace('id="dlg"', 'id="dlg" light-dismiss'));
    await open();
    expect(alert().lightDismiss).toBe(false);
    expect(alert().hasAttribute('light-dismiss')).toBe(false);
    // The mechanism: a dismissable native dialog gets closedby="any"; forcing
    // light-dismiss off must leave that disabled so the backdrop can't close it.
    expect(nativeDialog().getAttribute('closedby')).not.toBe('any');
  });
});

describe('Tone', () => {
  it('tone="danger" renders the confirm action as destructive', async () => {
    await mount(FIXTURE.replace('id="dlg"', 'id="dlg" tone="danger"'));
    await open();
    const confirm = nativeDialog().querySelector('[data-confirm]')!;
    expect(confirm.getAttribute('data-variant')).toBe('destructive');
  });
});

describe('Replaceable actions', () => {
  it('a slotted confirm button replaces the default and drives the confirm event', async () => {
    await mount(`
      <l-alert-dialog id="dlg" title="Discard changes?"
        style="--show-duration: 0ms; --hide-duration: 0ms">
        You have unsaved changes.
        <button slot="confirm" class="l-button" data-variant="destructive">Discard</button>
      </l-alert-dialog>
    `);
    await open();
    const confirmed = waitForEvent(alert(), 'confirm');
    await userEvent.click(page.getByRole('button', { name: 'Discard' }));
    await confirmed;
    await settle();
    expect(nativeDialog().open).toBe(false);
  });
});

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the alertdialog role named by the title (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      await open();
      const dlg = page.getByRole('alertdialog', { name: 'Delete this project?' });
      expect(dlg.elements().length).toBe(1);
    });

    it('describes itself with the body text via aria-describedby', async () => {
      await mount(FIXTURE);
      await open();
      const native = nativeDialog();
      const describedby = native.getAttribute('aria-describedby');
      expect(describedby).toBe('description');
      // The description target wraps the default slot; the screen reader
      // flattens the slotted light-DOM text into the accessible description.
      expect(native.querySelector(`#${describedby}`)).not.toBeNull();
      expect(alert().textContent).toContain('permanently deletes');
    });

    it('omits aria-describedby when there is no body content (no empty description)', async () => {
      await mount(`
        <l-alert-dialog id="dlg" title="Are you sure?"
          style="--show-duration: 0ms; --hide-duration: 0ms"></l-alert-dialog>
      `);
      await open();
      expect(nativeDialog().hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('moves initial focus to the cancel action (least destructive)', async () => {
      await mount(FIXTURE);
      await open();
      const active = deepActiveElement();
      expect(active?.getAttribute('data-cancel')).not.toBeNull();
      expect(active?.textContent?.trim()).toBe('Keep');
    });

    it('moves initial focus onto a slotted cancel action', async () => {
      await mount(`
        <l-alert-dialog id="dlg" title="Discard changes?"
          style="--show-duration: 0ms; --hide-duration: 0ms">
          You have unsaved changes.
          <a slot="cancel" class="l-button" href="#keep">Keep editing</a>
          <button slot="confirm" class="l-button" data-variant="destructive">Discard</button>
        </l-alert-dialog>
      `);
      await open();
      const active = deepActiveElement();
      expect(active?.getAttribute('slot')).toBe('cancel');
      expect(active?.textContent?.trim()).toBe('Keep editing');
    });
  });
});
