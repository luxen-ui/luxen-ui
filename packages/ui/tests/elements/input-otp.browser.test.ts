import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/input-otp/index.js';
import { userEvent } from './support/user-event.js';

// These tests drive l-input-otp the way a person would — clicking the input
// and typing — then assert what a user (or their screen reader, or their CSS)
// observes: cell fill state, active cell, and underlying input value.
// All interactions use userEvent (trusted CDP events).

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-input-otp');
  await settle();
  return host;
}

// l-input-otp is a progressive light-DOM element: after _setup() the native
// <input> lives inside .l-input-otp-cells but is still in the DOM. Each
// decorative cell is aria-hidden="true" (the container is not — it holds the
// focusable input) and updates run synchronously on input/keyup events, so one
// macrotask is sufficient for settling.
async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector('l-input-otp')!;
// The OTP input is VISUALLY HIDDEN behind the cell layer — getByRole('textbox')
// only matches visible elements and returns []; locate it structurally instead.
const otpInput = () => el().querySelector<HTMLInputElement>('input')!;
const filledCells = () => el().querySelectorAll('.l-input-otp-cell[data-filled]');
const activeCells = () => el().querySelectorAll('.l-input-otp-cell[data-active]');

const OTP = `
  <l-input-otp>
    <input />
  </l-input-otp>
`;

// ---------------------------------------------------------------------------
// Upgrade timing
// ---------------------------------------------------------------------------

describe('l-input-otp upgrades without waiting for an animation frame', () => {
  it('renders a cells container', async () => {
    await mount(OTP);
    expect(el().querySelector('.l-input-otp-cells')).not.toBeNull();
  });

  it('renders 6 digit cells by default', async () => {
    await mount(OTP);
    expect(el().querySelectorAll('.l-input-otp-cell')).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Re-entrant setup (move in DOM)
// ---------------------------------------------------------------------------

describe('l-input-otp survives being moved in the DOM', () => {
  it('still has a single cells container after a remove-then-reattach', async () => {
    await mount(OTP);
    const otp = el() as HTMLElement;
    otp.remove();
    document.body.append(otp);
    // Re-assign host so afterEach removes the re-appended element — prevents it
    // from leaking into subsequent tests.
    host = otp;
    await settle();
    expect(otp.querySelectorAll('.l-input-otp-cells')).toHaveLength(1);
  });

  it('still has exactly 6 cells after a remove-then-reattach', async () => {
    await mount(OTP);
    const otp = el() as HTMLElement;
    otp.remove();
    document.body.append(otp);
    // Re-assign host so afterEach removes the re-appended element.
    host = otp;
    await settle();
    expect(otp.querySelectorAll('.l-input-otp-cell')).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Immediate-disconnect guard
// ---------------------------------------------------------------------------

describe('l-input-otp does not initialize after an immediate disconnect', () => {
  it('has no generated cells when connected without children then removed before the retry fires', async () => {
    // Simulate the parser-upgrade case: element is connected with no children yet.
    // _trySetup() bails (no input found) and queues a retry. Disconnecting before
    // the macrotask must prevent setup from running.
    await customElements.whenDefined('l-input-otp');
    const otp = document.createElement('l-input-otp');
    document.body.append(otp);
    // No children yet — the retry is queued. Disconnect now.
    otp.remove();
    await settle();
    expect(otp.querySelectorAll('.l-input-otp-cell')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Typing interaction
// ---------------------------------------------------------------------------

describe('Typing fills the digit cells', () => {
  it('typing "123456" fills all six cells left to right', async () => {
    await mount(OTP);
    // Establish focus the way a user would — click the input directly.
    await userEvent.click(otpInput());
    await userEvent.keyboard('123456');
    await settle();
    expect(otpInput().value).toBe('123456');
    expect(filledCells()).toHaveLength(6);
  });

  it('typing 3 digits fills exactly 3 cells and leaves 3 empty', async () => {
    await mount(OTP);
    await userEvent.click(otpInput());
    await userEvent.keyboard('456');
    await settle();
    expect(otpInput().value).toBe('456');
    expect(filledCells()).toHaveLength(3);
  });

  it('backspace removes the last typed digit and reduces filled-cell count', async () => {
    await mount(OTP);
    await userEvent.click(otpInput());
    await userEvent.keyboard('12');
    await settle();
    expect(filledCells()).toHaveLength(2);
    await userEvent.keyboard('{Backspace}');
    await settle();
    expect(otpInput().value).toBe('1');
    expect(filledCells()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('each decorative cell carries aria-hidden="true", but the container holding the real <input> does not — the input must not sit in a hidden subtree (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(OTP);
      const cells = el().querySelectorAll('.l-input-otp-cell');
      expect(cells.length).toBeGreaterThan(0);
      for (const cell of cells) {
        expect(cell.getAttribute('aria-hidden')).toBe('true');
      }
      // The wrapper contains the focusable input — hiding it would hide the input
      // from AT (axe aria-hidden-focus).
      expect(el().querySelector('.l-input-otp-cells')?.getAttribute('aria-hidden')).toBeNull();
      expect(otpInput().closest('[aria-hidden="true"]')).toBeNull();
    });

    it('the real <input> exists in the DOM with inputmode="numeric" and a maxlength (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(OTP);
      // NOTE: the input is VISUALLY HIDDEN behind the cell layer — page.getByRole('textbox')
      // only matches visible elements and returns []; we locate it structurally on purpose.
      const input = otpInput();
      expect(input).not.toBeNull();
      expect(input.getAttribute('inputmode')).toBe('numeric');
      expect(Number(input.getAttribute('maxlength'))).toBeGreaterThan(0);
    });

    it('the input carries autocomplete="one-time-code" for OTP autofill (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(OTP);
      expect(otpInput().getAttribute('autocomplete')).toBe('one-time-code');
    });

    it('the input is exposed as a textbox to AT — it no longer sits in an aria-hidden subtree (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(OTP);
      // Previously a recorded finding: the cells WRAPPER was aria-hidden, which
      // hid the focusable input from the accessibility tree entirely. Now only
      // the decorative cells are hidden, so the real input is queryable by role.
      expect(page.getByRole('textbox').elements()).toHaveLength(1);
      expect(page.getByRole('textbox').query()).toBe(otpInput());
    });
  });

  describe('Keyboard interaction', () => {
    it('typing fills cells left to right as the user enters each digit (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(OTP);
      await userEvent.click(otpInput());
      await userEvent.keyboard('1');
      await settle();
      expect(filledCells()).toHaveLength(1);
      await userEvent.keyboard('2');
      await settle();
      expect(filledCells()).toHaveLength(2);
      await userEvent.keyboard('3');
      await settle();
      expect(filledCells()).toHaveLength(3);
    });

    it('the maxlength prevents more digits than the cell count from being accepted (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(OTP);
      await userEvent.click(otpInput());
      await userEvent.keyboard('1234567890');
      await settle();
      // maxlength="6" is set by _setup() — value is capped at 6 digits
      expect(otpInput().value.length).toBeLessThanOrEqual(6);
      expect(filledCells()).toHaveLength(6);
    });
  });

  describe('Focus management', () => {
    it('focusing the input marks the first empty cell as data-active (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(OTP);
      await userEvent.click(otpInput());
      // _scheduleUpdateCells uses rAF; wait for it to settle
      await new Promise((r) => requestAnimationFrame(r));
      await settle();
      // At least one cell must carry data-active while the input is focused
      expect(activeCells()).toHaveLength(1);
    });

    it('the active cell advances as digits are typed (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(OTP);
      await userEvent.click(otpInput());
      await new Promise((r) => requestAnimationFrame(r));
      await settle();

      const firstActiveIndex = () => {
        const cells = [...el().querySelectorAll('.l-input-otp-cell')];
        return cells.findIndex((c) => c.hasAttribute('data-active'));
      };

      const idx0 = firstActiveIndex();
      await userEvent.keyboard('1');
      await settle();
      const idx1 = firstActiveIndex();
      expect(idx1).toBeGreaterThan(idx0);
    });
  });
});
