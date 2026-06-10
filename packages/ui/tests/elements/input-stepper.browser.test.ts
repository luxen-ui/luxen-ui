import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/input-stepper/index.js';

// Tests drive l-input-stepper the way a person would and assert what a user
// (or their screen reader) observes. Internal wiring is not tested.

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

async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector('l-input-stepper')!;

const STEPPER = `
  <l-input-stepper>
    <input type="number" min="0" max="10" value="5" />
  </l-input-stepper>
`;

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

describe('l-input-stepper survives being moved in the DOM', () => {
  it('still has exactly one value wrapper after a remove-then-reattach', async () => {
    await mount(STEPPER);
    const stepper = el();
    stepper.remove();
    document.body.append(stepper);
    await settle();
    expect(stepper.querySelectorAll('.l-input-stepper-value')).toHaveLength(1);
  });

  it('has exactly two buttons after a remove-then-reattach', async () => {
    await mount(STEPPER);
    const stepper = el();
    stepper.remove();
    document.body.append(stepper);
    await settle();
    expect(stepper.querySelectorAll('button')).toHaveLength(2);
  });
});

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
