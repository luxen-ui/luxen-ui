import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/rating/index.js';
import type { Rating } from '../../src/html/elements/rating/rating.js';
import { RatingChangeEvent } from '../../src/html/elements/rating/rating.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// Drive l-rating the way a person would — clicking icon labels, hovering,
// pressing arrow keys, submitting forms — and assert only what a user (or
// their screen reader, or their CSS) observes: value attribute, form data,
// change events, accessible names, and focus/preview behavior.
// All interactions use userEvent (trusted CDP events).

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-rating');
  const el = host.querySelector<Rating & { updateComplete: Promise<unknown> }>('l-rating');
  if (el) {
    await el.updateComplete;
  }
  await settle();
  return host;
}

// l-rating is a Shadow-DOM element. One Lit cycle + one macrotask is sufficient:
// value changes are synchronous, and preview state updates via requestUpdate()
// which queues a microtask Lit cycle then resolves updateComplete.
async function settle() {
  const el = host?.querySelector<Rating & { updateComplete: Promise<unknown> }>('l-rating');
  if (el) {
    await el.updateComplete;
  }
  await new Promise((r) => setTimeout(r, 0));
}

const el = () => host.querySelector<Rating>('l-rating')!;

// l-rating edit-mode radios are VISUALLY HIDDEN via the sr-only clip pattern
// (position:absolute; clip:rect(0,0,0,0); width:1px; height:1px).
// page.getByRole('radio') only matches visible elements and returns [];
// locate the icon-wrapper labels and radios structurally instead — same wall
// as l-input-otp, same documented workaround.
const iconWrappers = () =>
  Array.from(el().shadowRoot!.querySelectorAll<HTMLLabelElement>('.icon-wrapper'));
const radios = () =>
  Array.from(el().shadowRoot!.querySelectorAll<HTMLInputElement>('input[type="radio"]'));

// ---------------------------------------------------------------------------
// Display mode (read-only, default)
// ---------------------------------------------------------------------------

describe('Display mode (no edit-mode attribute)', () => {
  it('renders the masked .rating div', async () => {
    await mount(`<l-rating value="3"></l-rating>`);
    const ratingDiv = el().shadowRoot!.querySelector('.rating');
    expect(ratingDiv).not.toBeNull();
  });

  it('renders no radio inputs in display mode', async () => {
    await mount(`<l-rating value="3"></l-rating>`);
    const inputs = el().shadowRoot!.querySelectorAll('input[type="radio"]');
    expect(inputs).toHaveLength(0);
  });

  it('renders no .icon-wrapper labels in display mode', async () => {
    await mount(`<l-rating value="3"></l-rating>`);
    const wrappers = el().shadowRoot!.querySelectorAll('.icon-wrapper');
    expect(wrappers).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Edit mode — click interactions
// ---------------------------------------------------------------------------

describe('Edit mode — clicking icon labels', () => {
  it('clicking the 3rd icon label sets value to 3 and reflects the attribute', async () => {
    await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
    const labels = iconWrappers();
    expect(labels).toHaveLength(5);
    await userEvent.click(labels[2]); // 3rd position (0-based index 2)
    await settle();
    expect(el().value).toBe(3);
    expect(el().getAttribute('value')).toBe('3');
  });

  it('clicking the 3rd icon label fires a RatingChangeEvent with value="3" and checked=true', async () => {
    await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
    const changed = waitForEvent(el(), 'change');
    await userEvent.click(iconWrappers()[2]);
    const event = (await changed) as RatingChangeEvent;
    expect(event).toBeInstanceOf(RatingChangeEvent);
    expect(event.value).toBe('3');
    expect(event.checked).toBe(true);
    expect(event.name).toBe('stars');
  });

  it('the change event bubbles to the host element (bubbles: true)', async () => {
    await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
    const events: Event[] = [];
    host.addEventListener('change', (e) => events.push(e));
    await userEvent.click(iconWrappers()[2]);
    await settle();
    expect(events).toHaveLength(1);
  });

  it('clicking the currently-selected position again toggles back to 0', async () => {
    await mount(`<l-rating edit-mode value="3" name="stars"></l-rating>`);
    // Position 3 is currently selected — clicking it again should toggle to 0.
    await userEvent.click(iconWrappers()[2]);
    await settle();
    expect(el().value).toBe(0);
  });

  it('toggling back to 0 fires a RatingChangeEvent with value="0" and checked=false', async () => {
    await mount(`<l-rating edit-mode value="3" name="stars"></l-rating>`);
    const changed = waitForEvent(el(), 'change');
    await userEvent.click(iconWrappers()[2]); // position 3 — already selected
    const event = (await changed) as RatingChangeEvent;
    expect(event.value).toBe('0');
    expect(event.checked).toBe(false);
  });

  it('disabled rating: radios carry the disabled attribute and value stays unchanged', async () => {
    await mount(`<l-rating edit-mode value="2" name="stars" disabled></l-rating>`);
    // CSS pointer-events:none on :host([disabled]) prevents clicks from landing —
    // Playwright correctly refuses to click a disabled element. Verify the disabled
    // contract structurally: all radios carry the disabled attribute (forwarded from
    // the host), and the committed value is still 2 with no interaction.
    const inputs = radios();
    for (const input of inputs) {
      expect(input.disabled).toBe(true);
    }
    expect(el().value).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Hover / focus preview
// ---------------------------------------------------------------------------

describe('Hover preview with custom labels', () => {
  it('hovering an icon shows its label text in [part="label"]', async () => {
    await mount(
      `<l-rating edit-mode value="0" labels="Bad|Ok|Good|Great|Perfect" name="stars"></l-rating>`,
    );
    const labels = iconWrappers();
    await userEvent.hover(labels[2]); // position 3 → "Good"
    await settle();
    const labelPart = el().shadowRoot!.querySelector<HTMLElement>('[part="label"]');
    expect(labelPart).not.toBeNull();
    expect(labelPart!.textContent?.trim()).toBe('Good');
  });

  it('radios carry the custom label as aria-label attribute', async () => {
    await mount(
      `<l-rating edit-mode value="0" labels="Bad|Ok|Good|Great|Perfect" name="stars"></l-rating>`,
    );
    const inputs = radios();
    expect(inputs[0].getAttribute('aria-label')).toBe('Bad');
    expect(inputs[1].getAttribute('aria-label')).toBe('Ok');
    expect(inputs[2].getAttribute('aria-label')).toBe('Good');
    expect(inputs[3].getAttribute('aria-label')).toBe('Great');
    expect(inputs[4].getAttribute('aria-label')).toBe('Perfect');
  });

  it('radios fall back to "N stars" aria-label when no custom labels are set', async () => {
    await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
    const inputs = radios();
    expect(inputs[0].getAttribute('aria-label')).toBe('1 star');
    expect(inputs[1].getAttribute('aria-label')).toBe('2 stars');
    expect(inputs[4].getAttribute('aria-label')).toBe('5 stars');
  });
});

// ---------------------------------------------------------------------------
// Form integration
// ---------------------------------------------------------------------------

describe('Participates in forms', () => {
  it('FormData carries the clicked value as a string for the field name', async () => {
    await mount(
      `<form>
        <l-rating edit-mode value="0" name="rating"></l-rating>
      </form>`,
    );
    const form = host.querySelector('form')!;
    await userEvent.click(iconWrappers()[3]); // position 4
    await settle();
    const data = new FormData(form);
    expect(data.get('rating')).toBe('4');
  });

  it('initial value submits without interaction (value="2" → FormData "2")', async () => {
    await mount(
      `<form>
        <l-rating edit-mode value="2" name="rating"></l-rating>
      </form>`,
    );
    const form = host.querySelector('form')!;
    const data = new FormData(form);
    // connectedCallback snapshots _defaultFormValue and syncs it via _internals.setFormValue
    expect(data.get('rating')).toBe('2');
  });

  it('form.reset() restores the mount-time default value', async () => {
    await mount(
      `<form>
        <l-rating edit-mode value="2" name="rating"></l-rating>
      </form>`,
    );
    const form = host.querySelector('form')!;
    // Change the value
    await userEvent.click(iconWrappers()[4]); // position 5
    await settle();
    expect(el().value).toBe(5);
    // Reset the form
    form.reset();
    await settle();
    expect(el().value).toBe(2);
  });

  it('form.reset() restores FormData to the mount-time default', async () => {
    await mount(
      `<form>
        <l-rating edit-mode value="2" name="rating"></l-rating>
      </form>`,
    );
    const form = host.querySelector('form')!;
    await userEvent.click(iconWrappers()[4]); // position 5
    await settle();
    form.reset();
    await settle();
    const data = new FormData(form);
    expect(data.get('rating')).toBe('2');
  });

  it('disabled rating: excluded from form submission per HTML spec (FormData returns null)', async () => {
    // LuxenFormAssociatedElement calls _internals.setFormValue in connectedCallback
    // even for disabled controls. The HTML spec excludes disabled form-associated
    // custom elements from submission — FormData.get() returns null for them.
    await mount(
      `<form>
        <l-rating edit-mode value="3" name="rating" disabled></l-rating>
      </form>`,
    );
    const form = host.querySelector('form')!;
    const data = new FormData(form);
    // Disabled FACE controls are excluded from submission by the browser.
    expect(data.get('rating')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('each position radio carries an accessible name (labels or "N stars") (WCAG 4.1.2 / RGAA 7.1)', async () => {
      // NOTE: the radios are VISUALLY HIDDEN (position:absolute; clip:rect(0,0,0,0);
      // width:1px; height:1px) — page.getByRole('radio') returns [] because
      // Playwright only matches visible elements. We assert the accessible name
      // structurally via the aria-label attribute on each hidden <input>.
      await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
      const inputs = radios();
      expect(inputs).toHaveLength(5);
      for (const input of inputs) {
        const label = input.getAttribute('aria-label');
        expect(label).toBeTruthy();
        expect(label!.length).toBeGreaterThan(0);
      }
    });

    it('the checked radio reflects the current value (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-rating edit-mode value="3" name="stars"></l-rating>`);
      const inputs = radios();
      // Only position 3 (index 2) should be checked
      expect(inputs[0].checked).toBe(false);
      expect(inputs[1].checked).toBe(false);
      expect(inputs[2].checked).toBe(true);
      expect(inputs[3].checked).toBe(false);
      expect(inputs[4].checked).toBe(false);
    });

    it('checked state updates after a click (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-rating edit-mode value="1" name="stars"></l-rating>`);
      await userEvent.click(iconWrappers()[4]); // position 5
      await settle();
      const inputs = radios();
      expect(inputs[4].checked).toBe(true);
      expect(inputs[0].checked).toBe(false);
    });

    it('display mode: renders a masked div with no role/name/text exposed to AT (recorded a11y finding)', async () => {
      // FINDING: display mode renders a bare <div class="rating"> with no role,
      // no aria-label, and no text content. Screen readers receive no information
      // about the rating value (e.g. "3 out of 5"). Candidate fix: role="img"
      // + aria-label computed from value/length (WCAG 1.1.1 / 4.1.2).
      await mount(`<l-rating value="3"></l-rating>`);
      const ratingDiv = el().shadowRoot!.querySelector('.rating');
      expect(ratingDiv).not.toBeNull();
      // No role attribute — AT cannot infer the semantic meaning
      expect(ratingDiv!.getAttribute('role')).toBeNull();
      // No text content — value is conveyed only visually
      expect(ratingDiv!.textContent?.trim()).toBe('');
    });

    it('edit mode: no explicit radiogroup role wrapping the radios (recorded a11y finding: grouped by name only)', async () => {
      // FINDING: edit-mode radios are children of .rating-edit which carries no
      // role="radiogroup" and no accessible name as a group label. They are
      // grouped implicitly by their shared `name` attribute — screen readers may
      // not announce a group label. Candidate fix: add role="radiogroup" with an
      // aria-label or aria-labelledby on .rating-edit (WCAG 1.3.1 / 4.1.2).
      await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
      const ratingEdit = el().shadowRoot!.querySelector('.rating-edit');
      expect(ratingEdit).not.toBeNull();
      expect(ratingEdit!.getAttribute('role')).toBeNull();
    });
  });

  describe('Keyboard interaction', () => {
    it('ArrowRight between radios of the same name moves to the next and sets value (WCAG 2.1.1 / RGAA 7.3)', async () => {
      // Native radio-group keyboard behavior: ArrowRight/Down moves to the next
      // radio in the group and checks it — native browser behavior fires a click
      // event on the newly-checked radio, which drives onClick → value change.
      await mount(`<l-rating edit-mode value="2" name="stars"></l-rating>`);
      // Click position 2 to establish focus on its hidden radio, then arrow right.
      await userEvent.click(iconWrappers()[1]); // position 2
      await settle();
      // ArrowRight should move to the next radio in the group (position 3).
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(el().value).toBe(3);
    });

    it('ArrowLeft moves focus to the previous radio and sets its value (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(`<l-rating edit-mode value="3" name="stars"></l-rating>`);
      await userEvent.click(iconWrappers()[2]); // position 3
      await settle();
      await userEvent.keyboard('{ArrowLeft}');
      await settle();
      expect(el().value).toBe(2);
    });
  });

  describe('Focus management', () => {
    it('hovering an icon previews it without changing the committed value (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(`<l-rating edit-mode value="1" name="stars"></l-rating>`);
      // Before hover, value is 1
      expect(el().value).toBe(1);
      // Hover position 4 — preview shows 4 active icons; value stays 1
      await userEvent.hover(iconWrappers()[3]);
      await settle();
      expect(el().value).toBe(1); // committed value unchanged
      // At least position 4 icon should be active during preview
      const icons = Array.from(el().shadowRoot!.querySelectorAll('.icon'));
      expect(icons[3].classList.contains('active')).toBe(true);
    });

    it('moving pointer out of the wrapper clears the preview back to the committed value (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(
        `<l-rating edit-mode value="1" labels="Bad|Ok|Good|Great|Perfect" name="stars"></l-rating>
         <button id="outside">Outside</button>`,
      );
      // Hover position 3 to set a preview
      await userEvent.hover(iconWrappers()[2]);
      await settle();
      // The label shows the hovered position's text
      const labelPart = el().shadowRoot!.querySelector<HTMLElement>('[part="label"]');
      expect(labelPart!.textContent?.trim()).toBe('Good');
      // Click outside to trigger pointerout and focusout clearPreview
      const outsideBtn = host.querySelector<HTMLButtonElement>('#outside')!;
      await userEvent.click(outsideBtn);
      await settle();
      // After focus leaves the wrapper, label reverts to the committed value (position 1 → "Bad")
      expect(labelPart!.textContent?.trim()).toBe('Bad');
    });

    it('focusing an icon position via click shows the committed value as active (WCAG 2.4.3 / RGAA 12.8)', async () => {
      // userEvent.click on the icon wrapper transfers focus to its child radio,
      // triggering focusin → previewValue, then click → onClick sets the value.
      // The committed and previewed value are the same after the click.
      await mount(`<l-rating edit-mode value="0" name="stars"></l-rating>`);
      await userEvent.click(iconWrappers()[2]); // position 3
      await settle();
      // After the click the value is 3; first 3 icons (indices 0–2) should be active
      const icons = Array.from(el().shadowRoot!.querySelectorAll('.icon'));
      expect(icons[0].classList.contains('active')).toBe(true);
      expect(icons[1].classList.contains('active')).toBe(true);
      expect(icons[2].classList.contains('active')).toBe(true);
      expect(icons[3].classList.contains('active')).toBe(false);
    });
  });
});
