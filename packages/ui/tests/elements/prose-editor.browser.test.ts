import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/prose-editor/index.js';
import type { ProseEditor } from '../../src/html/elements/prose-editor/prose-editor.js';

// Drive the prose-editor like a person would — type content, click toolbar
// buttons, submit forms, press keys — and assert only what a user, screen
// reader, or CSS would observe. No internal wiring assertions.
//
// Key contracts discovered from reading the source (prose-editor.ts +
// luxen-form-associated-element.ts):
//
//   getHTML()        — returns '' when tiptap content is '<p></p>' (empty),
//                      otherwise returns the full HTML string.
//   _syncFormValue   — calls ElementInternals.setFormValue(htmlString), so
//                      FormData(form)[name] yields the current HTML (or '' when
//                      empty after the editor syncs to '').
//   formResetCallback— super.formResetCallback() syncs _defaultFormValue (''),
//                      then editor.commands.setContent(_initialContent()) resets
//                      the editable content to initial-html / initial-json / ''.
//   disabled         — editor.setEditable(false) → .ProseMirror gets
//                      contenteditable="false" (user-observable).
//   change event     — dispatched as 'change' with detail { html, json }.
//   toolbar buttons  — data-command="bold", "italic", "emoji" (shadow root).
//   emoji toggle     — _emojiOpenAtPointerDown captures state at pointerdown;
//                      click then reads that snapshot to decide open vs close.
//                      Escape (capture, document) and outside pointerdown
//                      (capture, document) also dismiss the picker.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<ProseEditor> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-prose-editor');
  const el = host.querySelector('l-prose-editor') as ProseEditor;
  await settleEl(el);
  return el;
}

async function settleEl(el: ProseEditor) {
  const lit = el as ProseEditor & { updateComplete: Promise<unknown> };
  await lit.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await lit.updateComplete;
}

function macrotask(n = 1): Promise<void> {
  return new Promise((r) => setTimeout(r, n * 10));
}

/** Click the emoji toolbar button in the element's shadow root. */
function clickEmojiButton(editorEl: HTMLElement): void {
  const btn = editorEl.shadowRoot?.querySelector<HTMLElement>('[data-command="emoji"]');
  if (!btn) throw new Error('Emoji button not found in shadow root');
  // Simulate the pointerdown → click sequence the browser produces so the
  // _emojiOpenAtPointerDown snapshot is correct.
  btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
  btn.click();
}

/** The `emoji-picker` element parented anywhere in the document. */
function picker(): HTMLElement | null {
  return document.querySelector('emoji-picker');
}

// ---------------------------------------------------------------------------
// Authoring content
// ---------------------------------------------------------------------------

describe('Authoring content', () => {
  // getHTML() contract: empty editor returns '', typed content returns HTML.
  // initial-html renders the provided HTML into the editable area.
  // clear() empties the editor.
  // toggleBold() wraps subsequent content in <strong>.

  it('getHTML() returns empty string for a new empty editor', async () => {
    const el = await mount(`<l-prose-editor></l-prose-editor>`);
    expect(el.getHTML()).toBe('');
  });

  it('renders initial-html content in the editable area', async () => {
    const el = await mount(`<l-prose-editor initial-html="<p>Hello world</p>"></l-prose-editor>`);
    // The editable area is in light DOM (slotted), not shadow DOM.
    const proseMirror = el.querySelector('.ProseMirror');
    expect(proseMirror).not.toBeNull();
    expect(proseMirror!.textContent).toContain('Hello world');
  });

  it('getHTML() reflects the initial-html content', async () => {
    const el = await mount(`<l-prose-editor initial-html="<p>Hello world</p>"></l-prose-editor>`);
    expect(el.getHTML()).toContain('Hello world');
  });

  it('clear() empties the editor so getHTML() returns empty string', async () => {
    const el = await mount(`<l-prose-editor initial-html="<p>Non-empty</p>"></l-prose-editor>`);
    el.clear();
    await settleEl(el);
    expect(el.getHTML()).toBe('');
  });

  it('toggleBold() produces <strong> markup in getHTML()', async () => {
    const el = await mount(`<l-prose-editor></l-prose-editor>`);
    // Focus then enable bold; inserting text via the documented public commands
    // API (last-resort per the plan, because direct keyboard input can't reliably
    // set caret position in a headless Chromium).
    el.toggleBold();
    el.editor.commands.insertContent('bold text');
    await settleEl(el);
    expect(el.getHTML()).toContain('<strong>');
  });

  it('emits a change event with html and json when content changes', async () => {
    const el = await mount(`<l-prose-editor></l-prose-editor>`);
    const events: CustomEvent[] = [];
    el.addEventListener('change', (e) => events.push(e as CustomEvent));
    el.editor.commands.insertContent('hello');
    await settleEl(el);
    expect(events.length).toBeGreaterThan(0);
    const detail = events[0].detail as { html: string; json: unknown };
    expect(typeof detail.html).toBe('string');
    expect(detail.json).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Participates in forms
// ---------------------------------------------------------------------------

describe('Participates in forms', () => {
  // form-associated contract (ElementInternals.setFormValue):
  //   - FormData(form)[name] yields the current HTML.
  //   - form.reset() calls formResetCallback which resets content to
  //     _initialContent() (initial-html / '' when nothing set).
  //   - disabled → editor not editable → .ProseMirror[contenteditable="false"].

  it('submits typed content as the field value in FormData', async () => {
    const el = await mount(
      `<form>
        <l-prose-editor name="body"></l-prose-editor>
      </form>`,
    );
    const form = host.querySelector('form')!;
    el.editor.commands.insertContent('form content');
    await settleEl(el);
    const data = new FormData(form);
    const value = data.get('body') as string;
    expect(value).toContain('form content');
  });

  it('submits empty string when the editor is empty', async () => {
    await mount(
      `<form>
        <l-prose-editor name="notes"></l-prose-editor>
      </form>`,
    );
    const form = host.querySelector('form')!;
    // Editor is pristine — value should be '' (empty paragraph → '').
    const data = new FormData(form);
    expect(data.get('notes')).toBe('');
  });

  it('resets to empty after form.reset() when no initial-html is set', async () => {
    const el = await mount(
      `<form>
        <l-prose-editor name="msg"></l-prose-editor>
      </form>`,
    );
    const form = host.querySelector('form')!;
    el.editor.commands.insertContent('something');
    await settleEl(el);
    form.reset();
    await settleEl(el);
    expect(el.getHTML()).toBe('');
  });

  it('resets to initial-html content after form.reset()', async () => {
    const el = await mount(
      `<form>
        <l-prose-editor name="content" initial-html="<p>initial</p>"></l-prose-editor>
      </form>`,
    );
    const form = host.querySelector('form')!;
    el.editor.commands.clearContent();
    el.editor.commands.insertContent('changed');
    await settleEl(el);
    form.reset();
    await settleEl(el);
    expect(el.getHTML()).toContain('initial');
  });

  it('makes .ProseMirror non-editable when the disabled attribute is set', async () => {
    const el = await mount(`<l-prose-editor disabled></l-prose-editor>`);
    const proseMirror = el.querySelector('.ProseMirror');
    expect(proseMirror).not.toBeNull();
    expect(proseMirror!.getAttribute('contenteditable')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Emoji picker lifecycle and dismissal
// (parent-branch tests cover reconnect and in-flight disconnect)
// ---------------------------------------------------------------------------

describe('l-prose-editor emoji picker', () => {
  it('opens after the editor is moved to a new container', async () => {
    // Use a local emoji data source that won't actually fetch so the picker
    // still constructs and opens without hanging on a CDN request.
    const editorEl = await mount(
      `<l-prose-editor emoji-data-source="/emoji.json"></l-prose-editor>`,
    );

    // First open — verifies the picker builds at all.
    clickEmojiButton(editorEl);
    await macrotask(2); // let the dynamic import resolve

    const firstPicker = picker();
    expect(firstPicker).not.toBeNull();
    expect(firstPicker!.matches(':popover-open')).toBe(true);

    // Close the picker before moving so state is clean.
    if (firstPicker!.matches(':popover-open')) {
      (firstPicker as HTMLElement & { hidePopover(): void }).hidePopover();
    }
    await macrotask();

    // Move the editor into a fresh container — this disconnects then reconnects.
    const newContainer = document.createElement('div');
    document.body.append(newContainer);
    editorEl.remove();
    newContainer.append(editorEl);
    await settleEl(editorEl);

    // After reconnect the first picker node is gone from the document.
    // Clicking again must build a fresh picker — not throw on a stale node.
    let error: unknown;
    try {
      clickEmojiButton(editorEl);
      await macrotask(2);
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();

    const newPicker = picker();
    expect(newPicker).not.toBeNull();
    expect(newPicker!.matches(':popover-open')).toBe(true);

    // Cleanup the extra container.
    newContainer.remove();
  });

  it('leaves no orphaned emoji-picker after disconnect during import', async () => {
    const editorEl = await mount(
      `<l-prose-editor emoji-data-source="/emoji.json"></l-prose-editor>`,
    );

    // Trigger the lazy import, then immediately disconnect in the same task.
    clickEmojiButton(editorEl);
    host.remove(); // disconnectedCallback runs synchronously; resets the cache

    // Let the dynamic import settle across multiple macrotasks.
    await macrotask(3);

    // No picker should remain in the document — the in-flight guard must have
    // bailed and returned null without appending to a detached container.
    expect(document.querySelectorAll('emoji-picker').length).toBe(0);
  });

  it('Escape on document closes an open picker', async () => {
    // Regressed in a7c2966 and 61bf140 — document capture-phase keydown is the
    // robust dismissal path, bypassing ProseMirror's own Escape handler.
    const editorEl = await mount(
      `<l-prose-editor emoji-data-source="/emoji.json"></l-prose-editor>`,
    );
    clickEmojiButton(editorEl);
    await macrotask(2);

    const p = picker();
    expect(p?.matches(':popover-open')).toBe(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await macrotask();

    expect(p?.matches(':popover-open')).toBe(false);
  });

  it('pointer-down outside the editor and picker closes an open picker', async () => {
    // Regressed in a7c2966 — the capture-phase pointerdown listener is the
    // robust outside-click dismissal, bypassing ProseMirror's preventDefault.
    const editorEl = await mount(
      `<l-prose-editor emoji-data-source="/emoji.json"></l-prose-editor>`,
    );
    clickEmojiButton(editorEl);
    await macrotask(2);

    const p = picker();
    expect(p?.matches(':popover-open')).toBe(true);

    // Dispatch from an unrelated element that is not the picker or editor.
    const outsideEl = document.createElement('div');
    document.body.append(outsideEl);
    outsideEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    outsideEl.remove();
    await macrotask();

    expect(p?.matches(':popover-open')).toBe(false);
  });

  it('re-clicking the emoji button while the picker is open closes it', async () => {
    const editorEl = await mount(
      `<l-prose-editor emoji-data-source="/emoji.json"></l-prose-editor>`,
    );
    // Open the picker.
    clickEmojiButton(editorEl);
    await macrotask(2);

    const p = picker();
    expect(p?.matches(':popover-open')).toBe(true);

    // The _emojiOpenAtPointerDown flag drives the toggle: pointerdown captures
    // the open state, then click decides to close it.
    clickEmojiButton(editorEl);
    await macrotask();

    expect(p?.matches(':popover-open')).toBe(false);
  });

  it('a click inside the picker does not close it', async () => {
    const editorEl = await mount(
      `<l-prose-editor emoji-data-source="/emoji.json"></l-prose-editor>`,
    );
    clickEmojiButton(editorEl);
    await macrotask(2);

    const p = picker();
    expect(p?.matches(':popover-open')).toBe(true);

    // Simulate a pointerdown that originates from inside the picker itself.
    // composedPath() will include `p`, so the outside-click handler should skip.
    p!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await macrotask();

    expect(p?.matches(':popover-open')).toBe(true);
  });
});
