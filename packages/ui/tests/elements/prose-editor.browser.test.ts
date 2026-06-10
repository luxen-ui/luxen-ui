import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/prose-editor/index.js';
import type { ProseEditor } from '../../src/html/elements/prose-editor/prose-editor.js';

// Drive the prose-editor emoji picker like a person would — click the emoji
// button, observe picker presence and popover state — and assert that the
// button keeps working after the element moves or is removed.

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
  btn.click();
}

/** The `emoji-picker` element parented anywhere in the document. */
function picker(): HTMLElement | null {
  return document.querySelector('emoji-picker');
}

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
});
