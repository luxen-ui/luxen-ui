import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import '../../src/html/elements/icon/index.js';
import { setCustomIconLoader } from '../../src/html/elements/icon/index.js';
import type { Icon } from '../../src/html/elements/icon/icon.js';

// The room an upgraded icon takes in the layout. While its data is on its way,
// the room the glyph will take must already be there, or the neighbours shift
// when it paints. The icon's own shadow styles come with the element; no
// stylesheet is needed. Each case loads its own prefix through a custom loader
// it controls, since Iconify caches every name it has seen.

const DOT = { body: '<circle cx="12" cy="12" r="8" fill="currentColor"/>', width: 24, height: 24 };

let host: HTMLElement;

afterEach(() => host?.remove());

/** A loader that answers only when the test says so. Iconify batches its
 *  loads on a timer, so the answer waits for the loader to be asked. */
function deferredLoader(prefix: string) {
  let answer: ((data: typeof DOT | null) => void) | undefined;
  setCustomIconLoader(() => new Promise((resolve) => (answer = resolve)), prefix);
  return async (data: typeof DOT | null) => {
    await vi.waitFor(() => {
      if (!answer) throw new Error('loader not asked yet');
    });
    answer!(data);
  };
}

async function mount(markup: string): Promise<{ icon: Icon; inner: HTMLElement }> {
  host = document.createElement('div');
  host.style.fontSize = '20px';
  host.innerHTML = markup;
  document.body.append(host);
  const icon = host.firstElementChild as Icon;
  await icon.updateComplete;
  return { icon, inner: icon.renderRoot.querySelector('iconify-icon') as HTMLElement };
}

const size = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width, height };
};

const painted = (inner: HTMLElement) =>
  vi.waitFor(() => {
    if (!inner.shadowRoot?.querySelector('svg')) throw new Error('no <svg> painted yet');
  });

/** Waits for the one warning a missing name gets, keeping the console quiet. */
async function untilWarned(run: () => Promise<void>) {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await run();
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    warn.mockRestore();
  }
}

describe('An icon whose data has not arrived yet', () => {
  it('holds a 1em square from its first render', async () => {
    deferredLoader('luxen-slow-a');
    const { inner } = await mount('<l-icon name="luxen-slow-a:dot"></l-icon>');

    expect(inner.shadowRoot?.querySelector('svg')).toBeNull();
    expect(size(inner)).toEqual({ width: 20, height: 20 });
  });

  it('keeps that square, without a gap, once the glyph paints', async () => {
    const answer = deferredLoader('luxen-slow-b');
    const { inner } = await mount('<l-icon name="luxen-slow-b:dot"></l-icon>');

    // Every layout the inner box goes through, from now until the glyph is in.
    const widths: number[] = [];
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) widths.push(entry.contentRect.width);
    });
    observer.observe(inner);

    await answer(DOT);
    await painted(inner);
    // Let the observer report the layout after the paint.
    await new Promise((resolve) => setTimeout(resolve, 50));
    observer.disconnect();

    expect(widths.length).toBeGreaterThan(0);
    expect(widths.every((width) => width === 20)).toBe(true);
    expect(size(inner)).toEqual({ width: 20, height: 20 });
  });

  it('keeps the room for its new name when the old one arrives late', async () => {
    const answerOld = deferredLoader('luxen-slow-d');
    const answerNew = deferredLoader('luxen-slow-e');
    const { icon, inner } = await mount('<l-icon name="luxen-slow-d:dot"></l-icon>');

    icon.name = 'luxen-slow-e:dot';
    await icon.updateComplete;
    await answerOld(DOT);
    // The old name's request settling must not release the new name's room.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(inner.shadowRoot?.querySelector('svg')).toBeNull();
    expect(size(inner)).toEqual({ width: 20, height: 20 });

    await answerNew(DOT);
    await painted(inner);
    expect(size(inner)).toEqual({ width: 20, height: 20 });
  });

  it('gives the room back when the name cannot be resolved', async () => {
    let inner!: HTMLElement;
    await untilWarned(async () => {
      const answer = deferredLoader('luxen-slow-c');
      ({ inner } = await mount('<l-icon name="luxen-slow-c:missing"></l-icon>'));
      await answer(null);
    });

    expect(size(inner).width).toBe(0);
  });
});

describe('An icon whose name is already known to be missing', () => {
  it('takes no room from its first render', async () => {
    // A first icon finds out the name is missing.
    await untilWarned(async () => {
      const answer = deferredLoader('luxen-missing');
      await mount('<l-icon name="luxen-missing:nope"></l-icon>');
      await answer(null);
    });
    host.remove();

    // The next one with that name must not flash a placeholder before collapsing.
    const { inner } = await mount('<l-icon name="luxen-missing:nope"></l-icon>');

    expect(size(inner).width).toBe(0);
  });
});

describe('A hidden icon', () => {
  it('takes no room, like any element with the hidden attribute', async () => {
    deferredLoader('luxen-hidden');
    const { icon, inner } = await mount('<l-icon name="luxen-hidden:dot" hidden></l-icon>');

    expect(icon.checkVisibility()).toBe(false);
    expect(size(inner).width).toBe(0);
  });
});
