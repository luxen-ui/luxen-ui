import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/input-otp/index.js';

// Tests drive l-input-otp the way a person would and assert what a user
// (or their screen reader) observes. Internal wiring is not tested.

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

async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector('l-input-otp')!;

const OTP = `
  <l-input-otp>
    <input />
  </l-input-otp>
`;

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

describe('l-input-otp survives being moved in the DOM', () => {
  it('still has a single cells container after a remove-then-reattach', async () => {
    await mount(OTP);
    const otp = el();
    otp.remove();
    document.body.append(otp);
    await settle();
    expect(otp.querySelectorAll('.l-input-otp-cells')).toHaveLength(1);
  });

  it('still has exactly 6 cells after a remove-then-reattach', async () => {
    await mount(OTP);
    const otp = el();
    otp.remove();
    document.body.append(otp);
    await settle();
    expect(otp.querySelectorAll('.l-input-otp-cell')).toHaveLength(6);
  });
});

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
