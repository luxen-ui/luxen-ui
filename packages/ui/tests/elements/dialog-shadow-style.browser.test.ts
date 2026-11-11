import { afterEach, describe, expect, it } from 'vite-plus/test';

// Asserts the panel shadow defaults with the design tokens loaded: component
// suites load no CSS, so there `var(--l-shadow-lg)` resolves to nothing and an
// inset drawer that lost its default shadow would look the same as one that
// kept it.
import '../../src/css/tokens.css';
import '../../src/html/elements/dialog/index.js';
import '../../src/html/elements/drawer/index.js';

let host: HTMLElement;

afterEach(() => {
  host?.querySelectorAll<HTMLElement & { open: boolean }>('l-dialog, l-drawer').forEach((el) => {
    el.open = false;
  });
  host?.remove();
});

async function mount(html: string): Promise<HTMLElement & { open: boolean }> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  const el = host.firstElementChild as HTMLElement & {
    open: boolean;
    updateComplete: Promise<unknown>;
  };
  await customElements.whenDefined(el.localName);
  el.open = true;
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  return el;
}

const panelShadow = (el: HTMLElement) =>
  getComputedStyle(el.shadowRoot!.querySelector('dialog')!).boxShadow;

/** The large shadow token as the browser computes it. */
function tokenShadow(): string {
  const probe = document.createElement('div');
  probe.style.boxShadow = 'var(--l-shadow-lg)';
  document.body.append(probe);
  const value = getComputedStyle(probe).boxShadow;
  probe.remove();
  return value;
}

describe('Panel shadow defaults (tokens loaded)', () => {
  it('a dialog casts no shadow', async () => {
    const el = await mount(
      '<l-dialog title="Plain" style="--show-duration: 0ms"><p>Body</p></l-dialog>',
    );
    expect(panelShadow(el)).toBe('none');
  });

  it('an inset drawer casts the large shadow token', async () => {
    expect(tokenShadow()).not.toBe('none');
    const el = await mount(
      '<l-drawer title="Floating" inset style="--show-duration: 0ms"><p>Body</p></l-drawer>',
    );
    expect(panelShadow(el)).toBe(tokenShadow());
  });

  it('an edge drawer casts no shadow', async () => {
    const el = await mount(
      '<l-drawer title="Edge" style="--show-duration: 0ms"><p>Body</p></l-drawer>',
    );
    expect(panelShadow(el)).toBe('none');
  });
});
