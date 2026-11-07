import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/input-otp/index.js';

// The browser config has no setup file, so light-DOM stylesheets are not loaded
// by default — `input-otp.browser.test.ts` asserts behaviour and does not need
// them. This suite asserts how the cells are painted, so it pulls in the tokens
// and the skin.
import '../../src/css/tokens.css';
import '../../src/css/elements/input-otp.css';

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(style = ''): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = `
    <l-input-otp style="${style}">
      <input maxlength="6" value="12" aria-label="Verification code" />
    </l-input-otp>`;
  document.body.append(host);
  await customElements.whenDefined('l-input-otp');
  await new Promise((resolve) => setTimeout(resolve, 0));
  return host;
}

const cell = () => getComputedStyle(host.querySelector<HTMLElement>('.l-input-otp-cell')!);

/** A color resolved to rgb(), for comparing against the expected token value. */
function resolveColor(color: string): string {
  const probe = document.createElement('span');
  probe.style.color = color;
  host.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

describe('An OTP cell takes the look of the other text fields', () => {
  it('follows --l-form-control-border-radius, so a themed form rounds its cells too', async () => {
    await mount('--l-form-control-border-radius: 14px');
    expect(cell().borderTopLeftRadius).toBe('14px');
  });

  it('follows the border color and width of the text fields', async () => {
    await mount(
      '--l-form-control-border-color: rgb(200, 0, 0); --l-form-control-border-width: 3px',
    );
    expect(cell().borderTopColor).toBe('rgb(200, 0, 0)');
    expect(cell().borderTopWidth).toBe('3px');
  });

  it('tints the text-field background and writes in the value color', async () => {
    await mount(
      '--l-form-control-background-color: rgb(0, 0, 200); --l-form-control-value-color: rgb(0, 120, 0)',
    );
    expect(cell().backgroundColor).toBe(
      resolveColor('color-mix(in oklab, var(--l-color-text-primary) 4%, rgb(0, 0, 200))'),
    );
    expect(cell().color).toBe('rgb(0, 120, 0)');
  });

  it('keeps the default look: tinted surface, default border, 1px', async () => {
    await mount();
    expect(cell().backgroundColor).toBe(
      resolveColor('color-mix(in oklab, var(--l-color-text-primary) 4%, var(--l-color-surface))'),
    );
    expect(cell().borderTopColor).toBe(resolveColor('var(--l-color-border)'));
    expect(cell().borderTopWidth).toBe('1px');
  });

  it('still lets the cell properties set the cells on their own', async () => {
    await mount(
      '--l-form-control-border-radius: 14px; --cell-border-radius: 3px; --cell-border-color: rgb(0, 0, 0)',
    );
    expect(cell().borderTopLeftRadius).toBe('3px');
    expect(cell().borderTopColor).toBe('rgb(0, 0, 0)');
  });
});
