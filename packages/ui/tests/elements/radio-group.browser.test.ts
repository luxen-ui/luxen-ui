// oxlint-disable-next-line typescript/triple-slash-reference -- ambient *.css module for the side-effect CSS import below.
/// <reference path="./a11y/a11y-env.d.ts" />
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { userEvent } from './support/user-event.js';

// `.l-radio-group` ships no JavaScript: it is native radios, each wrapped in the
// `<label>` that names it. Everything a user does — arrow keys, a single tab
// stop, submission, reset — comes from the platform.
//
// So what is actually under test here is that our CSS does not take any of that
// away, which is why every case below uses `data-appearance="button"`: the
// default appearance leaves the input alone, the button one covers it with its
// label and paints it transparent. Get that wrong and
// (`display: none`, a zero-size box, `pointer-events: none`) the group silently
// stops being keyboard-operable while still looking correct.
// These tests are the guard on that one decision, which is why the real
// stylesheet is loaded rather than mocked.
import '../../src/css/preset.css';
import '../../src/css/elements/button.css';
import '../../src/css/elements/radio-group.css';

let host: HTMLElement;

afterEach(() => host?.remove());

function mount(html: string): HTMLElement {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

const radio = (name: string, opts?: { checked?: boolean }) =>
  page.getByRole('radio', { name, ...opts });

const input = (value: string) => host.querySelector<HTMLInputElement>(`input[value="${value}"]`)!;

const BASIC = `
  <a href="#" id="before">before</a>
  <fieldset class="l-radio-group" data-appearance="button">
    <legend>View</legend>
    <label class="l-button">
      <input type="radio" name="view" value="list" checked />
      List
    </label>
    <label class="l-button">
      <input type="radio" name="view" value="board" />
      Board
    </label>
    <label class="l-button">
      <input type="radio" name="view" value="calendar" />
      Calendar
    </label>
  </fieldset>`;

describe('A radio group exposes each segment as a radio', () => {
  it('names every segment from the label wrapping it', async () => {
    mount(BASIC);

    expect(await radio('List').query()).toBeTruthy();
    expect(await radio('Board').query()).toBeTruthy();
    expect(await radio('Calendar').query()).toBeTruthy();
  });

  it('reports which segment is selected', async () => {
    mount(BASIC);

    expect(await radio('List', { checked: true }).query()).toBeTruthy();
    expect(await radio('Board', { checked: true }).query()).toBeFalsy();
  });
});

describe('A pointer user can pick a segment', () => {
  it('selects the segment whose label is clicked', async () => {
    mount(BASIC);

    await userEvent.click(await radio('Calendar').element());

    expect(input('calendar').checked).toBe(true);
    expect(input('list').checked).toBe(false);
  });
});

describe('A keyboard user can move through a radio group', () => {
  it('reaches the group in a single Tab, landing on the selected segment', async () => {
    mount(BASIC);
    host.querySelector<HTMLAnchorElement>('#before')!.focus();

    await userEvent.tab();

    expect(document.activeElement).toBe(input('list'));
  });

  it('moves and selects together with the arrow keys (WCAG 2.1.1 / RGAA 7.3)', async () => {
    mount(BASIC);
    host.querySelector<HTMLAnchorElement>('#before')!.focus();
    await userEvent.tab();

    await userEvent.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(input('board'));
    expect(input('board').checked).toBe(true);
  });

  it('wraps around at the end', async () => {
    mount(BASIC);
    host.querySelector<HTMLAnchorElement>('#before')!.focus();
    await userEvent.tab();

    await userEvent.keyboard('{ArrowLeft}');

    expect(document.activeElement).toBe(input('calendar'));
    expect(input('calendar').checked).toBe(true);
  });

  it('leaves the group on the next Tab rather than walking every segment (WCAG 2.4.3)', async () => {
    mount(BASIC);
    host.querySelector<HTMLAnchorElement>('#before')!.focus();
    await userEvent.tab();

    await userEvent.tab();

    expect(host.contains(document.activeElement)).toBe(false);
  });

  it('skips a disabled segment', async () => {
    mount(`
      <a href="#" id="before">before</a>
      <fieldset class="l-radio-group" data-appearance="button">
        <legend>Plan</legend>
        <label class="l-button">
          <input type="radio" name="plan" value="free" checked />
          Free
        </label>
        <label class="l-button">
          <input type="radio" name="plan" value="pro" disabled />
          Pro
        </label>
        <label class="l-button">
          <input type="radio" name="plan" value="team" />
          Team
        </label>
      </fieldset>`);
    host.querySelector<HTMLAnchorElement>('#before')!.focus();
    await userEvent.tab();

    await userEvent.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(input('team'));
    expect(input('pro').checked).toBe(false);
  });
});

describe('A disabled segment stays inert under the pointer', () => {
  const PLAN = `
    <fieldset class="l-radio-group" data-appearance="button">
      <legend>Plan</legend>
      <label class="l-button">
        <input type="radio" name="plan" value="free" checked />
        Free
      </label>
      <label class="l-button">
        <input type="radio" name="plan" value="pro" />
        Pro
      </label>
      <label class="l-button">
        <input type="radio" name="plan" value="enterprise" disabled />
        Enterprise
      </label>
    </fieldset>`;

  /**
   * Samples the label's fill during the real pointerdown, while `:active` holds.
   * `force` bypasses Playwright's actionability check, which refuses to click a
   * label wrapping a disabled control — the very case under test.
   */
  async function fillWhilePressed(value: string): Promise<{ resting: string; pressed: string }> {
    const label = input(value).closest('label')!;
    const resting = getComputedStyle(label).backgroundColor;
    let pressed = '';
    label.addEventListener(
      'pointerdown',
      () => {
        pressed = getComputedStyle(label).backgroundColor;
      },
      { once: true },
    );
    await userEvent.click(label, { force: true });
    return { resting, pressed };
  }

  // Control first: without it the guard below would pass even if the sampling
  // never observed the active state at all. Uses the unchecked enabled segment —
  // the checked one already rests on the active fill, so it never changes.
  it('an enabled segment takes the pressed fill', async () => {
    mount(PLAN);

    const { resting, pressed } = await fillWhilePressed('pro');

    expect(pressed).not.toBe(resting);
  });

  it('a disabled segment does not (its label is never `:disabled`)', async () => {
    mount(PLAN);

    const { resting, pressed } = await fillWhilePressed('enterprise');

    expect(pressed).toBe(resting);
  });

  it('and clicking it leaves the selection alone', async () => {
    mount(PLAN);

    await userEvent.click(input('enterprise').closest('label')!, { force: true });

    expect(input('free').checked).toBe(true);
    expect(input('enterprise').checked).toBe(false);
  });
});

describe('A radio group is a form control', () => {
  const FORM = `
    <form>
      <fieldset class="l-radio-group" data-appearance="button">
        <legend>Billing</legend>
        <label class="l-button">
          <input type="radio" name="billing" value="monthly" />
          Monthly
        </label>
        <label class="l-button">
          <input type="radio" name="billing" value="yearly" checked />
          Yearly
        </label>
      </fieldset>
    </form>`;

  const value = () => new FormData(host.querySelector('form')!).get('billing');

  it('submits the selected segment under the group name', async () => {
    mount(FORM);

    expect(value()).toBe('yearly');

    await userEvent.click(await radio('Monthly').element());

    expect(value()).toBe('monthly');
  });

  it('restores the initially-selected segment on reset', async () => {
    mount(FORM);
    await userEvent.click(await radio('Monthly').element());

    host.querySelector('form')!.reset();

    expect(value()).toBe('yearly');
  });
});
