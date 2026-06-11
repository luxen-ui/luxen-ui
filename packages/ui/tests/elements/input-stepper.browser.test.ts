import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/input-stepper/index.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// These tests drive l-input-stepper the way a person would — clicking the
// increment/decrement buttons — and assert what a user (or their screen reader)
// observes: value changes, change events, accessible names, and focus.
// All interactions use userEvent (trusted CDP events).

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-input-stepper');
  await settle();
  return host;
}

// l-input-stepper is a progressive light-DOM element: after _setup() the
// native <input type="number"> is wrapped in .l-input-stepper-value. One
// macrotask is enough to settle after a button click.
async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector('l-input-stepper')!;

// l-input-stepper wraps the native <input type="number"> in a value div and
// may also render an aria-hidden track overlay. The spinbutton may not be
// accessible by role if the input is visually hidden; locate it structurally.
// NOTE: this is a recorded a11y finding — see Accessibility > Roles block.
const stepperInput = () => el().querySelector<HTMLInputElement>('input[type=number]')!;

const incrementBtn = () => page.getByRole('button', { name: 'Increase value' });
const decrementBtn = () => page.getByRole('button', { name: 'Decrease value' });

const STEPPER = `
  <l-input-stepper>
    <input type="number" min="0" max="10" value="5" />
  </l-input-stepper>
`;

// ---------------------------------------------------------------------------
// Upgrade timing
// ---------------------------------------------------------------------------

describe('l-input-stepper upgrades without waiting for an animation frame', () => {
  it('renders a decrement and an increment button with accessible names', async () => {
    await mount(STEPPER);
    const buttons = el().querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].getAttribute('aria-label')).toBe('Decrease value');
    expect(buttons[1].getAttribute('aria-label')).toBe('Increase value');
  });

  it('wraps the input in a single value container', async () => {
    await mount(STEPPER);
    expect(el().querySelectorAll('.l-input-stepper-value')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Re-entrant setup (move in DOM)
// ---------------------------------------------------------------------------

describe('l-input-stepper survives being moved in the DOM', () => {
  it('still has exactly one value wrapper after a remove-then-reattach', async () => {
    await mount(STEPPER);
    const stepper = el() as HTMLElement;
    stepper.remove();
    document.body.append(stepper);
    // Re-assign host so afterEach removes the re-appended element — prevents it
    // from leaking into page.getByRole queries in subsequent tests.
    host = stepper;
    await settle();
    expect(stepper.querySelectorAll('.l-input-stepper-value')).toHaveLength(1);
  });

  it('has exactly two buttons after a remove-then-reattach', async () => {
    await mount(STEPPER);
    const stepper = el() as HTMLElement;
    stepper.remove();
    document.body.append(stepper);
    // Re-assign host so afterEach removes the re-appended element.
    host = stepper;
    await settle();
    expect(stepper.querySelectorAll('button')).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Immediate-disconnect guard
// ---------------------------------------------------------------------------

describe('l-input-stepper does not initialize after an immediate disconnect', () => {
  it('has no generated buttons when connected without children then removed before the retry fires', async () => {
    // Simulate the parser-upgrade case: element is connected with no children yet.
    // _trySetup() bails (no input found) and queues a retry. Disconnecting before
    // the macrotask must prevent setup from running.
    await customElements.whenDefined('l-input-stepper');
    const stepper = document.createElement('l-input-stepper');
    document.body.append(stepper);
    // No children yet — the retry is queued. Disconnect now.
    stepper.remove();
    await settle();
    expect(stepper.querySelectorAll('button')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Icon security (plan 003)
// ---------------------------------------------------------------------------

describe('l-input-stepper icon security', () => {
  it('treats a hostile icon name as data, not markup', async () => {
    await mount(`
      <l-input-stepper decrement-icon='x"><img src=x onerror="window.__pwned = true">'>
        <input type="number" min="0" max="10" value="5" />
      </l-input-stepper>
    `);
    expect(host.querySelector('img')).toBeNull();
    expect((window as any).__pwned).toBeUndefined();
    // The hostile string ends up inert, as the icon element's name attribute.
    expect(host.querySelector('l-icon, [name]')?.tagName.toLowerCase()).toContain('icon');
  });
});

// ---------------------------------------------------------------------------
// Button-driven value changes
// ---------------------------------------------------------------------------

describe('Clicking increment/decrement buttons changes the value and emits change', () => {
  it('clicking "Increase value" increments the value by 1 and fires a change event', async () => {
    await mount(STEPPER);
    // Start before the click so the event listener is in place.
    const changed = waitForEvent(el(), 'change');
    await userEvent.click(incrementBtn());
    const event = (await changed) as CustomEvent<{ value: number }>;
    await settle();
    expect(event.detail.value).toBe(6);
    expect(stepperInput().value).toBe('6');
  });

  it('clicking "Decrease value" decrements the value by 1 and fires a change event', async () => {
    await mount(STEPPER);
    const changed = waitForEvent(el(), 'change');
    await userEvent.click(decrementBtn());
    const event = (await changed) as CustomEvent<{ value: number }>;
    await settle();
    expect(event.detail.value).toBe(4);
    expect(stepperInput().value).toBe('4');
  });

  it('multiple increments accumulate correctly', async () => {
    await mount(STEPPER);
    await userEvent.click(incrementBtn());
    await settle();
    await userEvent.click(incrementBtn());
    await settle();
    expect(stepperInput().value).toBe('7');
  });

  it('the increment button becomes disabled when the value reaches max', async () => {
    await mount(`
      <l-input-stepper>
        <input type="number" min="0" max="6" value="5" />
      </l-input-stepper>
    `);
    await userEvent.click(incrementBtn());
    await settle();
    // value is now 6 == max — button should be disabled
    const btn = el().querySelector<HTMLButtonElement>('button[aria-label="Increase value"]')!;
    expect(btn.disabled).toBe(true);
  });

  it('the decrement button becomes disabled when the value reaches min', async () => {
    await mount(`
      <l-input-stepper>
        <input type="number" min="4" max="10" value="5" />
      </l-input-stepper>
    `);
    await userEvent.click(decrementBtn());
    await settle();
    // value is now 4 == min — button should be disabled
    const btn = el().querySelector<HTMLButtonElement>('button[aria-label="Decrease value"]')!;
    expect(btn.disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NOTE on native ArrowUp/Down: the native <input type="number"> handles
// ArrowUp/Down itself and emits a native `change` event — but that goes
// through _onInputChange, not increment()/decrement(), and is not the element's
// primary interaction pattern. The element's own change event is only guaranteed
// synchronous on button click (_applyValue → emit). Arrow-key tests are omitted
// to avoid testing the browser's native number-input behaviour.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('the "Increase value" button is locatable by its accessible name (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(STEPPER);
      expect(incrementBtn().elements()).toHaveLength(1);
    });

    it('the "Decrease value" button is locatable by its accessible name (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(STEPPER);
      expect(decrementBtn().elements()).toHaveLength(1);
    });

    it('the track overlay (when present) carries aria-hidden="true" (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`
        <l-input-stepper with-roller>
          <input type="number" min="0" max="10" value="5" />
        </l-input-stepper>
      `);
      const track = el().querySelector('.l-input-stepper-track');
      expect(track?.getAttribute('aria-hidden')).toBe('true');
    });

    it('page.getByRole("spinbutton") may return no elements — the native input is wrapped in a value div and may not be visible; AT users interact via the two named buttons', async () => {
      // RECORDED A11Y FINDING: l-input-stepper exposes no live spinbutton
      // semantics in its visible layer. The native <input type="number"> is
      // hidden behind the .l-input-stepper-value wrapper and is not announced
      // by role by Playwright's getByRole. AT users get two named buttons
      // ("Decrease value" / "Increase value") but there is no role=spinbutton
      // element announcing the current value live. This limits screen-reader
      // UX: the current numeric value is not surfaced to AT automatically.
      await mount(STEPPER);
      // Both button roles are properly exposed:
      expect(incrementBtn().elements()).toHaveLength(1);
      expect(decrementBtn().elements()).toHaveLength(1);
    });
  });

  describe('Keyboard interaction', () => {
    it('pressing Enter on the increment button increments the value and fires change (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(STEPPER);
      await userEvent.click(incrementBtn()); // establish focus on the button
      await settle();
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard('{Enter}');
      const event = (await changed) as CustomEvent<{ value: number }>;
      await settle();
      expect(event.detail.value).toBe(7);
    });

    it('pressing Space on the decrement button decrements the value and fires change (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(STEPPER);
      await userEvent.click(decrementBtn()); // establish focus on the button
      await settle();
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard(' ');
      const event = (await changed) as CustomEvent<{ value: number }>;
      await settle();
      expect(event.detail.value).toBe(3);
    });
  });

  describe('Focus management', () => {
    it('after clicking the increment button, focus remains on that button (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(STEPPER);
      await userEvent.click(incrementBtn());
      await settle();
      // A button click does not steal or move focus — the button retains focus.
      const btn = el().querySelector<HTMLButtonElement>('button[aria-label="Increase value"]')!;
      expect(document.activeElement).toBe(btn);
    });

    it('after clicking the decrement button, focus remains on that button (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(STEPPER);
      await userEvent.click(decrementBtn());
      await settle();
      const btn = el().querySelector<HTMLButtonElement>('button[aria-label="Decrease value"]')!;
      expect(document.activeElement).toBe(btn);
    });
  });
});
