/**
 * The kind of input the user gave last: a key or a pointer, `null` before
 * either. Elements that move focus by script use it where engines disagree on
 * `:focus-visible`:
 *
 * - Firefox shows a ring on script focus only when the element focused before
 *   showed one, so focus an element moves with the keyboard after a click on its
 *   trigger gets no ring (`focusFromInput`).
 * - WebKit matches `:focus-visible` on the element a modal dialog returns focus
 *   to, even when the dialog was closed with the pointer (`lastInput`).
 *
 * One pair of capture listeners on the document, added when this module loads,
 * so the input before an element's first use is already known.
 */

export type InputModality = 'keyboard' | 'pointer';

let last: InputModality | null = null;

const onKeyDown = (e: KeyboardEvent) => {
  // A modifier alone (Shift before a click) says nothing about the next action.
  if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) last = 'keyboard';
};
const onPointerDown = () => {
  last = 'pointer';
};

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', onKeyDown, { capture: true, passive: true });
  document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
}

/** The kind of input the user gave last. */
export function lastInput(): InputModality | null {
  return last;
}

/**
 * Focuses `el` and, when the user's last input was a key, asks for the focus
 * ring explicitly (`focusVisible`), so every engine shows it. Otherwise the
 * engine's own heuristic decides, as with a plain `focus()`.
 */
export function focusFromInput(el: HTMLElement): void {
  const options: FocusOptions & { focusVisible?: boolean } =
    lastInput() === 'keyboard' ? { focusVisible: true } : {};
  el.focus(options);
}
