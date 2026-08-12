import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/segmented-control/index.js';
import type { SegmentedControl } from '../../src/html/elements/segmented-control/segmented-control.js';
import { waitForEvent } from './support/events.js';
import { userEvent } from './support/user-event.js';

// These tests drive l-segmented-control the way a person would — clicking
// segments, pressing arrow keys — and assert what a user (or their screen
// reader, or their CSS) observes: selection state, radio-group roles, keyboard
// focus, and the emitted `change` event. All interactions use userEvent
// (trusted CDP events). It is a light-DOM progressive element, so
// document.activeElement works directly.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-segmented-control');
  await settle();
  return host;
}

async function settle() {
  const sc = host?.querySelector<SegmentedControl & { updateComplete: Promise<unknown> }>(
    'l-segmented-control',
  );
  if (sc) await sc.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector<SegmentedControl>('l-segmented-control')!;

const radio = (name: string, opts?: { checked?: boolean }) =>
  page.getByRole('radio', { name, ...opts });

const BASIC = `
  <l-segmented-control label="View" value="board">
    <button value="list">List</button>
    <button value="board">Board</button>
    <button value="calendar">Calendar</button>
  </l-segmented-control>
`;

// ---------------------------------------------------------------------------
// Progressive upgrade
// ---------------------------------------------------------------------------

describe('l-segmented-control upgrades light-DOM buttons without an animation frame', () => {
  it('gives the host a radiogroup role', async () => {
    await mount(BASIC);
    expect(el().getAttribute('role')).toBe('radiogroup');
  });

  it('gives each button a radio role', async () => {
    await mount(BASIC);
    expect(el().querySelectorAll('[role="radio"]')).toHaveLength(3);
  });

  it('checks the segment named by `value`', async () => {
    await mount(BASIC);
    expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
  });

  it('falls back to an authored aria-checked when no value is set', async () => {
    await mount(`
      <l-segmented-control label="View">
        <button value="list">List</button>
        <button value="board" aria-checked="true">Board</button>
      </l-segmented-control>
    `);
    expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
  });

  it('defaults to the first segment when nothing is marked', async () => {
    await mount(`
      <l-segmented-control label="View">
        <button value="list">List</button>
        <button value="board">Board</button>
      </l-segmented-control>
    `);
    expect(radio('List', { checked: true }).elements()).toHaveLength(1);
  });

  it('squares an icon-only segment via data-icon-only', async () => {
    await mount(`
      <l-segmented-control label="Align">
        <button value="left" aria-label="Align left"><i>i</i></button>
        <button value="right" aria-label="Align right"></button>
      </l-segmented-control>
    `);
    const [left, right] = [...el().querySelectorAll('button')];
    expect(left.hasAttribute('data-icon-only')).toBe(false);
    expect(right.hasAttribute('data-icon-only')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Selection & events
// ---------------------------------------------------------------------------

describe('A person selecting a segment', () => {
  it('moves selection to a clicked segment', async () => {
    await mount(BASIC);
    await userEvent.click(radio('Calendar'));
    await settle();
    expect(radio('Calendar', { checked: true }).elements()).toHaveLength(1);
    expect(radio('Board', { checked: false }).elements()).toHaveLength(1);
  });

  it('emits a change event carrying the segment value and index', async () => {
    await mount(BASIC);
    const events: Array<{ value: string; index: number }> = [];
    el().addEventListener('change', (e) => events.push({ value: e.value, index: e.index }));
    await userEvent.click(radio('Calendar'));
    await settle();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ value: 'calendar', index: 2 });
  });

  it('reflects the selection on the host `value`', async () => {
    await mount(BASIC);
    await userEvent.click(radio('List'));
    await settle();
    expect(el().value).toBe('list');
  });

  it('does not emit when value is set programmatically', async () => {
    await mount(BASIC);
    let fired = false;
    el().addEventListener('change', () => (fired = true));
    el().value = 'list';
    await settle();
    expect(radio('List', { checked: true }).elements()).toHaveLength(1);
    expect(fired).toBe(false);
  });

  it('does not emit change when the already-selected segment is clicked', async () => {
    await mount(BASIC); // "Board" is selected (value="board")
    let count = 0;
    el().addEventListener('change', () => count++);
    await userEvent.click(radio('Board'));
    await settle();
    expect(count).toBe(0);
    expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Disabled segments
// ---------------------------------------------------------------------------

describe('A disabled segment', () => {
  // A native/aria-disabled control is non-actionable to a real user — trusted
  // clicks can't reach it — so the meaningful, user-observable guarantee is that
  // keyboard navigation skips over it.
  it('is skipped by arrow-key navigation (disabled)', async () => {
    await mount(`
      <l-segmented-control label="View" value="list">
        <button value="list">List</button>
        <button value="board" disabled>Board</button>
        <button value="calendar">Calendar</button>
      </l-segmented-control>
    `);
    await userEvent.click(radio('List'));
    await settle();
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(radio('Calendar', { checked: true }).elements()).toHaveLength(1);
  });

  // The `aria-disabled` spelling is what a consumer reaches for when it cannot
  // set the native attribute (a framework binding, a non-`button` element), so
  // it has to survive the upgrade — not just be understood by `_isDisabled`.
  it('is skipped by arrow-key navigation (aria-disabled)', async () => {
    await mount(`
      <l-segmented-control label="View" value="list">
        <button value="list">List</button>
        <button value="board" aria-disabled="true">Board</button>
        <button value="calendar">Calendar</button>
      </l-segmented-control>
    `);
    await userEvent.click(radio('List'));
    await settle();
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(radio('Calendar', { checked: true }).elements()).toHaveLength(1);
  });

  it('defaults to the first enabled segment when the default one is disabled', async () => {
    await mount(`
      <l-segmented-control label="View">
        <button value="list" disabled>List</button>
        <button value="board">Board</button>
      </l-segmented-control>
    `);
    expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
    expect(radio('List', { checked: false }).elements()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Whole-control disabled
// ---------------------------------------------------------------------------

describe('When the whole control is disabled', () => {
  const segment = (value: string) =>
    [...el().querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.getAttribute('value') === value,
    )!;

  it('marks every segment aria-disabled and out of the tab order', async () => {
    await mount(`
      <l-segmented-control label="View" value="board" disabled>
        <button value="list">List</button>
        <button value="board">Board</button>
      </l-segmented-control>
    `);
    const radios = [...el().querySelectorAll<HTMLElement>('[role="radio"]')];
    expect(radios.every((r) => r.getAttribute('aria-disabled') === 'true')).toBe(true);
    expect(radios.every((r) => r.getAttribute('tabindex') === '-1')).toBe(true);
  });

  it('restores the roving tabindex when re-enabled', async () => {
    await mount(`
      <l-segmented-control label="View" value="board" disabled>
        <button value="list">List</button>
        <button value="board">Board</button>
      </l-segmented-control>
    `);
    el().disabled = false;
    await settle();
    expect(segment('board').getAttribute('tabindex')).toBe('0');
    expect(segment('list').getAttribute('tabindex')).toBe('-1');
    expect(segment('board').hasAttribute('aria-disabled')).toBe(false);
  });

  it('leaves a segment the consumer disabled out of the re-enabled control', async () => {
    await mount(`
      <l-segmented-control label="View" value="board" disabled>
        <button value="list" aria-disabled="true">List</button>
        <button value="board">Board</button>
      </l-segmented-control>
    `);
    el().disabled = false;
    await settle();
    expect(segment('list').getAttribute('aria-disabled')).toBe('true');
    expect(segment('board').hasAttribute('aria-disabled')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Form participation (form-associated custom element)
// ---------------------------------------------------------------------------

describe('As a form control', () => {
  it('submits the selected value under its name', async () => {
    await mount(`
      <form>
        <l-segmented-control name="metric" label="Metric" value="cost">
          <button value="volume">Volume</button>
          <button value="cost">Cost</button>
        </l-segmented-control>
      </form>
    `);
    const form = host.querySelector('form')!;
    expect(new FormData(form).get('metric')).toBe('cost');

    await userEvent.click(radio('Volume'));
    await settle();
    expect(new FormData(form).get('metric')).toBe('volume');
  });

  it('restores the default selection on form reset', async () => {
    await mount(`
      <form>
        <l-segmented-control name="metric" label="Metric" value="cost">
          <button value="volume">Volume</button>
          <button value="cost">Cost</button>
        </l-segmented-control>
        <button type="reset">Reset</button>
      </form>
    `);
    const form = host.querySelector('form')!;
    await userEvent.click(radio('Volume'));
    await settle();
    expect(new FormData(form).get('metric')).toBe('volume');

    form.reset();
    await settle();
    expect(radio('Cost', { checked: true }).elements()).toHaveLength(1);
    expect(new FormData(form).get('metric')).toBe('cost');
  });

  it('is excluded from submission when disabled', async () => {
    await mount(`
      <form>
        <l-segmented-control name="metric" label="Metric" value="cost" disabled>
          <button value="volume">Volume</button>
          <button value="cost">Cost</button>
        </l-segmented-control>
      </form>
    `);
    const form = host.querySelector('form')!;
    expect(new FormData(form).get('metric')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Accessibility (WAI-ARIA APG: Radio Group)
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes a named radiogroup of radios (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(BASIC);
      expect(page.getByRole('radiogroup', { name: 'View' }).elements()).toHaveLength(1);
      expect(page.getByRole('radio').elements()).toHaveLength(3);
    });

    it('marks exactly one radio checked (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(BASIC);
      expect(page.getByRole('radio', { checked: true }).elements()).toHaveLength(1);
    });
  });

  describe('Keyboard interaction (APG radio group)', () => {
    it('ArrowRight selects and focuses the next segment (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(BASIC);
      await userEvent.click(radio('List'));
      await settle();
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowRight}');
      await changed;
      await settle();
      expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
    });

    it('ArrowLeft selects the previous segment (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(BASIC);
      await userEvent.click(radio('Calendar'));
      await settle();
      const changed = waitForEvent(el(), 'change');
      await userEvent.keyboard('{ArrowLeft}');
      await changed;
      await settle();
      expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
    });

    it('ArrowDown / ArrowUp move like Right / Left (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(BASIC);
      await userEvent.click(radio('List'));
      await settle();
      await userEvent.keyboard('{ArrowDown}');
      await settle();
      expect(radio('Board', { checked: true }).elements()).toHaveLength(1);
      await userEvent.keyboard('{ArrowUp}');
      await settle();
      expect(radio('List', { checked: true }).elements()).toHaveLength(1);
    });

    it('arrow navigation wraps at the ends (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(BASIC);
      await userEvent.click(radio('Calendar'));
      await settle();
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(radio('List', { checked: true }).elements()).toHaveLength(1);
      await userEvent.keyboard('{ArrowLeft}');
      await settle();
      expect(radio('Calendar', { checked: true }).elements()).toHaveLength(1);
    });

    it('Home selects the first, End the last (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(BASIC);
      await userEvent.click(radio('Board'));
      await settle();
      await userEvent.keyboard('{End}');
      await settle();
      expect(radio('Calendar', { checked: true }).elements()).toHaveLength(1);
      await userEvent.keyboard('{Home}');
      await settle();
      expect(radio('List', { checked: true }).elements()).toHaveLength(1);
    });
  });

  describe('Focus management', () => {
    it('keeps a single roving tabindex entry point (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(BASIC);
      const radios = [...el().querySelectorAll<HTMLElement>('[role="radio"]')];
      expect(radios.filter((r) => r.getAttribute('tabindex') === '0')).toHaveLength(1);
      await userEvent.click(radio('Calendar'));
      await settle();
      const tabbable = radios.filter((r) => r.getAttribute('tabindex') === '0');
      expect(tabbable).toHaveLength(1);
      expect(tabbable[0].textContent?.trim()).toBe('Calendar');
    });

    it('clicking a segment moves focus to it (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(BASIC);
      await userEvent.click(radio('Calendar'));
      await settle();
      expect(document.activeElement?.textContent?.trim()).toBe('Calendar');
    });
  });
});
