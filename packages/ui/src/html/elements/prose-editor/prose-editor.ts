import { unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { html } from 'lit/static-html.js';
import { staticTag } from '../../static-tag.js';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { Editor, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extensions';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import '../icon/index.js';
import rawStyles from './prose-editor.css?inline';

const styles = unsafeCSS(rawStyles);

type ToolbarCommandName =
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'highlight'
  | 'bulletlist'
  | 'orderedlist'
  | 'blockquote'
  | 'code-block'
  | 'horizontal-rule'
  | 'link'
  | 'emoji'
  | 'attachment'
  | 'undo'
  | 'redo'
  | 'divider';

const TOOLBAR_PRESETS: Record<'default' | 'minimal', ToolbarCommandName[]> = {
  minimal: ['bold', 'italic', 'underline'],
  default: [
    'heading-1',
    'heading-2',
    'heading-3',
    'divider',
    'bold',
    'italic',
    'underline',
    'highlight',
    'bulletlist',
    'orderedlist',
    'blockquote',
    'divider',
    'code-block',
    'horizontal-rule',
    'link',
    'emoji',
    'divider',
    'undo',
    'redo',
  ],
};

/**
 * @summary A rich text editor built on Tiptap (ProseMirror). Form-associated: its value is the editor HTML.
 * @customElement l-prose-editor
 *
 * @slot toolbar-start - Content placed before the generated toolbar buttons.
 * @slot toolbar-end - Content placed after the generated toolbar buttons.
 *
 * @event change - Fired when the content changes. `detail` is `{ html, json }`.
 * @event add-file - Fired when the attachment toolbar button is clicked.
 *
 * @csspart wrapper - The editor frame wrapping the toolbar and content.
 * @csspart toolbar - The toolbar row.
 * @csspart toolbar-button - Any toolbar button.
 * @csspart divider - A toolbar divider.
 * @csspart editor - The container around the editable content.
 *
 * @cssproperty --border-color - Color of the editor frame border.
 * @cssproperty --border-width - Width of the editor frame border.
 * @cssproperty --border-radius - Corner radius of the editor frame.
 * @cssproperty --background - Background color of the editor.
 * @cssproperty --color - Text color of the editor.
 * @cssproperty --toolbar-background - Background color of the toolbar.
 * @cssproperty --toolbar-padding - Padding around the toolbar.
 * @cssproperty --toolbar-gap - Gap between toolbar buttons.
 * @cssproperty --toolbar-divider-color - Color of toolbar dividers.
 * @cssproperty --toolbar-button-size - Size of toolbar buttons.
 * @cssproperty --toolbar-button-radius - Corner radius of toolbar buttons.
 * @cssproperty --toolbar-button-color - Icon color of inactive toolbar buttons.
 * @cssproperty --toolbar-button-color-active - Icon color of hovered/active toolbar buttons.
 * @cssproperty --toolbar-button-background-hover - Background of hovered toolbar buttons.
 * @cssproperty --toolbar-button-background-active - Background of active toolbar buttons.
 * @cssproperty --content-padding - Padding inside the editable content region. Default `0.75rem 1rem`.
 * @cssproperty --content-min-height - Minimum height of the editable content region. Default `8rem`.
 * @cssproperty --placeholder-color - Placeholder text color.
 */
export class ProseEditor extends LuxenFormAssociatedElement {
  static override styles = [hostStyles, styles];

  /** The Tiptap editor instance. Available after the first render. */
  editor!: Editor;

  /** Initial HTML content. */
  @property({ attribute: 'initial-html' })
  accessor initialHtml = '';

  /** Initial content as a serialized ProseMirror JSON string. */
  @property({ attribute: 'initial-json' })
  accessor initialJson = '';

  /** Class applied to the `.ProseMirror` editable element (e.g. for Tailwind Typography `prose`). */
  @property({ attribute: 'editor-class' })
  accessor editorClass = 'prose';

  /** Explicit list of toolbar commands. Overrides `toolbar-preset` when set. */
  @property({
    converter: {
      fromAttribute: (value) => (value ? value.split(',').map((s) => s.trim()) : []),
      toAttribute: (value: ToolbarCommandName[]) => value.join(','),
    },
  })
  accessor toolbar: ToolbarCommandName[] = [];

  /** Built-in toolbar layout used when `toolbar` is not set. */
  @property({ attribute: 'toolbar-preset' })
  accessor toolbarPreset: 'default' | 'minimal' = 'default';

  /** Where the toolbar sits relative to the content. */
  @property({ attribute: 'toolbar-placement', reflect: true })
  accessor toolbarPlacement: 'top' | 'bottom' = 'top';

  /** Focus the editor on creation. */
  @property({ type: Boolean, reflect: true })
  accessor autofocus = false;

  /** Placeholder shown when the editor is empty. */
  @property()
  accessor placeholder = '';

  /**
   * URL the emoji picker fetches its data from. Point this at a locally served
   * `emojibase-data` JSON to run fully offline (no CDN). Defaults to the
   * picker's bundled CDN source.
   */
  @property({ attribute: 'emoji-data-source' })
  accessor emojiDataSource = '';

  private _editorRoot?: HTMLDivElement;
  private _emojiPicker?: HTMLElement;
  private _emojiPickerPromise?: Promise<HTMLElement>;
  private _emojiOpenAtPointerDown = false;
  private _emojiAutoUpdateCleanup?: () => void;

  override get validationTarget(): HTMLElement | undefined {
    return this._editorRoot;
  }

  private get _toolbar(): ToolbarCommandName[] {
    return this.toolbar.length > 0 ? this.toolbar : TOOLBAR_PRESETS[this.toolbarPreset];
  }

  override firstUpdated() {
    this.editor = new Editor({
      element: this._createEditorRoot(),
      editorProps: {
        attributes: { class: this.editorClass },
      },
      extensions: [
        StarterKit.configure({ link: { openOnClick: false } }),
        Highlight,
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      content: this._initialContent(),
      editable: !this.disabled,
      autofocus: this.autofocus && !this.disabled,
      onUpdate: () => {
        this.requestUpdate();
        this._emitChange();
      },
      onTransaction: () => this.requestUpdate(),
      onSelectionUpdate: () => this.requestUpdate(),
    });

    this.addEventListener('focus', this._onFocus);
    // Escape is handled in JS, not by the popover's native close watcher:
    // ProseMirror `preventDefault()`s Escape while the editor is focused, which
    // cancels the native close (popover and dialog alike). Capture phase on
    // `document` runs before that, can't be defeated by descendant
    // `stopPropagation()`, and only needs the event to propagate — not its
    // default action.
    document.addEventListener('keydown', this._onKeyDown, true);
    // Outside-click dismissal does NOT rely on native popover light-dismiss:
    // at least one shipping Chromium skips light-dismiss when the underlying
    // `pointerdown`'s default action is prevented — which ProseMirror does for
    // every click inside the editor (it drives its own selection). A
    // capture-phase `document` listener runs before any descendant
    // `preventDefault()`/`stopPropagation()` and doesn't depend on the default
    // action, so it dismisses on every browser, real or synthetic input, modal
    // or page. Native light-dismiss then becomes a redundant enhancement.
    document.addEventListener('pointerdown', this._onDocumentPointerDown, true);
    this._syncValue();
    this.requestUpdate();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('disabled') && this.editor) {
      this.editor.setEditable(!this.disabled);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('focus', this._onFocus);
    document.removeEventListener('keydown', this._onKeyDown, true);
    document.removeEventListener('pointerdown', this._onDocumentPointerDown, true);
    this._stopEmojiAutoUpdate();
    this.editor?.destroy();
    this._editorRoot?.remove();
    this._emojiPicker?.remove();
  }

  // --- Public API ---

  /** Get the current content as an HTML string. Empty paragraph resolves to `''`. */
  getHTML(): string {
    if (!this.editor) return '';
    const value = this.editor.getHTML();
    return value === '<p></p>' ? '' : value;
  }

  /** Get the current content as ProseMirror JSON. */
  getJSON(): JSONContent {
    return this.editor?.getJSON() ?? {};
  }

  /** Remove all content. */
  clear() {
    this.editor.commands.clearContent(true);
  }

  override focus() {
    this.editor.commands.focus();
  }

  override blur() {
    this.editor.commands.blur();
  }

  toggleBold() {
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic() {
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleUnderline() {
    this.editor.chain().focus().toggleUnderline().run();
  }

  toggleStrike() {
    this.editor.chain().focus().toggleStrike().run();
  }

  toggleHighlight() {
    this.editor.chain().focus().toggleHighlight().run();
  }

  toggleHeading(level: 1 | 2 | 3) {
    this.editor.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList() {
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList() {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote() {
    this.editor.chain().focus().toggleBlockquote().run();
  }

  toggleCodeBlock() {
    this.editor.chain().focus().toggleCodeBlock().run();
  }

  setHorizontalRule() {
    this.editor.chain().focus().setHorizontalRule().run();
  }

  undo() {
    this.editor.chain().focus().undo().run();
  }

  redo() {
    this.editor.chain().focus().redo().run();
  }

  toggleLink() {
    if (this.editor.isActive('link')) {
      this.editor.chain().focus().unsetLink().run();
      return;
    }
    const input = window.prompt('URL');
    if (!input) return;
    const url = /^https?:\/\//.test(input) ? input : `https://${input}`;
    this.editor.chain().focus().setLink({ href: url }).run();
  }

  // --- Form association ---

  override formResetCallback() {
    super.formResetCallback();
    this.editor?.commands.setContent(this._initialContent());
  }

  /** Sync the form value and validity from the current content. Returns the HTML. */
  private _syncValue(): string | undefined {
    if (!this.editor) return undefined;
    const value = this.getHTML();
    this._syncFormValue(value);
    if (this.required) {
      this.setValidity(
        value ? {} : { valueMissing: true },
        value ? '' : 'Please fill out this field.',
      );
    }
    return value;
  }

  private _emitChange() {
    const value = this._syncValue();
    if (value === undefined) return;
    this.emit('change', { detail: { html: value, json: this.getJSON() } });
  }

  // --- Editor wiring ---

  private _initialContent(): string | JSONContent {
    if (this.initialHtml) return this.initialHtml;
    if (this.initialJson) {
      return JSON.parse(this.initialJson) as JSONContent;
    }
    return '';
  }

  /**
   * The editable element is created in light DOM (slotted), not the shadow root.
   * Firefox and WebKit have long-standing bugs with `contenteditable` carets and
   * DOM selections inside a shadow tree, so ProseMirror must live outside it.
   * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1496769
   * @see https://bugs.webkit.org/show_bug.cgi?id=163921
   */
  private _createEditorRoot(): HTMLDivElement {
    const root = document.createElement('div');
    root.slot = 'editor';
    this.append(root);
    this._editorRoot = root;
    return root;
  }

  private _onFocus = () => {
    if (!this.disabled && document.activeElement !== this.editor?.view.dom) {
      this.focus();
    }
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this._emojiPicker?.matches(':popover-open')) return;
    this._emojiPicker.hidePopover();
    // Consume the Escape so it dismisses only the picker, not the host dialog.
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Capture-phase outside-click dismissal — the robust fallback the platform's
   * native light-dismiss can't be trusted to provide (see `firstUpdated`).
   * Dismiss when the picker is open and the pointer landed on neither the
   * picker nor the emoji toolbar button (re-clicking the button is handled by
   * the toggle in `_onEmojiButtonClick`). `composedPath()` crosses shadow
   * boundaries, so a click inside the picker's shadow tree still resolves to
   * the host element here.
   */
  private _onDocumentPointerDown = (event: PointerEvent) => {
    const picker = this._emojiPicker;
    if (!picker?.matches(':popover-open')) return;
    const path = event.composedPath();
    if (path.includes(picker) || (this._emojiButton && path.includes(this._emojiButton))) return;
    picker.hidePopover();
  };

  // --- Emoji picker (lazy-loaded) ---

  /**
   * The picker is a `popover="auto"` parented into the top layer; outside-click
   * dismissal is owned by `_onDocumentPointerDown` (capture phase), which
   * survives `stopPropagation()`/`preventDefault()` from an ancestor (modal
   * `<l-dialog>`, ProseMirror, Vue delegation). (`Escape` is handled by
   * `_onKeyDown` instead — ProseMirror `preventDefault()`s it, which would
   * cancel the native close.)
   *
   * We can't wire the button as a native popover invoker (`popoverTargetElement`
   * / `popovertarget`) because the picker is parented into another shadow tree
   * (the open `<dialog>` — see `_topLayerContainer`) while the button lives in
   * this element's shadow root; a cross-tree invoker reference doesn't resolve.
   * So the toggle is hand-rolled here. The catch: a pointer click on the button
   * is "outside" the popover, so native light-dismiss (where it works) has
   * already closed an open picker by the time this `click` fires (light-dismiss
   * runs on `pointerup`). We therefore read the open state captured at
   * `pointerdown` to know whether this click should re-open or stay closed.
   * Keyboard activation (`detail === 0`) has no pointer light-dismiss, so it
   * reads the live state and toggles directly.
   */
  private _onEmojiButtonPointerDown = () => {
    this._emojiOpenAtPointerDown = !!this._emojiPicker?.matches(':popover-open');
  };

  private async _onEmojiButtonClick(event: MouseEvent) {
    const picker = await this._ensureEmojiPicker();
    const wasOpen =
      event.detail === 0 ? picker.matches(':popover-open') : this._emojiOpenAtPointerDown;
    if (wasOpen) {
      if (picker.matches(':popover-open')) picker.hidePopover();
    } else if (!picker.matches(':popover-open')) {
      picker.showPopover();
    }
  }

  private _ensureEmojiPicker(): Promise<HTMLElement> {
    if (this._emojiPicker) return Promise.resolve(this._emojiPicker);
    return (this._emojiPickerPromise ??= (async () => {
      // `emoji-picker-element` is a framework-agnostic web component with no
      // `document`-level click listener of its own to fight the platform.
      // Importing it registers <emoji-picker> and gives us the constructor.
      const { default: Picker } = await import('emoji-picker-element/picker.js');
      const picker = new Picker(
        this.emojiDataSource ? { dataSource: this.emojiDataSource } : undefined,
      ) as unknown as HTMLElement;
      // Theme follows the system color scheme automatically (the element ships
      // a `prefers-color-scheme` media query); a `.light`/`.dark` class would
      // only be needed to override that.
      picker.addEventListener('emoji-click', (event) => {
        const unicode = (event as CustomEvent<{ unicode?: string }>).detail.unicode;
        if (!unicode) return;
        this.editor.chain().focus().insertContent(unicode).run();
        picker.hidePopover();
      });
      this._topLayerContainer().append(picker);
      // A popover="auto" promotes the picker into the top-layer (so it paints
      // above a modal <l-dialog> and escapes ancestor overflow clipping). Outside
      // -click dismissal is driven by `_onDocumentPointerDown`, with native
      // light-dismiss as a redundant enhancement. Top-layer alone isn't enough
      // inside a modal: showModal() makes everything outside the dialog's
      // flat-tree subtree inert (visible but unclickable), so the picker is
      // parented to the nearest open <dialog> — see _topLayerContainer.
      // Neutralize the UA popover box (the picker draws its own card in its
      // shadow root); Floating UI drives the position in _positionEmojiPicker.
      picker.setAttribute('popover', 'auto');
      Object.assign(picker.style, {
        position: 'fixed',
        inset: 'auto',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'transparent',
        // emoji-picker-element ships `:host { display: flex }` (author origin),
        // which overrides the UA `[popover]:not(:popover-open) { display: none }`
        // rule — so a *closed* popover would otherwise stay laid out and visible.
        // Drive `display` from the popover state via inline style (which beats the
        // shadow `:host` rule) so the picker is truly hidden when closed, on every
        // dismissal path (light-dismiss, Escape, re-click, select).
        display: 'none',
      });
      picker.style.setProperty('--border-radius', '0.5rem');
      picker.addEventListener('toggle', (event) => {
        const open = event.newState === 'open';
        picker.style.display = open ? 'flex' : 'none';
        if (open) this._startEmojiAutoUpdate();
        else this._stopEmojiAutoUpdate();
      });
      this._emojiPicker = picker;
      return picker;
    })());
  }

  /**
   * The element the emoji picker is appended to. Inside a modal `<l-dialog>` the
   * picker must live within the dialog's flat-tree subtree, otherwise the modal's
   * inertness makes it unclickable. Walk the flat tree (crossing shadow
   * boundaries via `assignedSlot`) to the nearest open `<dialog>`; fall back to
   * `<body>` when the editor is not inside a modal.
   */
  private _topLayerContainer(): HTMLElement {
    let node: Node | null = this;
    while (node) {
      if (node instanceof HTMLDialogElement && node.open) return node;
      if (node instanceof Element && node.assignedSlot) {
        node = node.assignedSlot;
      } else if (node instanceof ShadowRoot) {
        node = node.host;
      } else {
        node = node.parentNode;
      }
    }
    return document.body;
  }

  private get _emojiButton(): HTMLElement | null {
    return this.shadowRoot?.querySelector('[data-command="emoji"]') ?? null;
  }

  /**
   * Keep the picker pinned to the emoji button while it is open. Floating UI's
   * `autoUpdate` re-runs `_positionEmojiPicker` on scroll (including ancestor
   * scroll), resize, and layout shifts, so the picker stays anchored to the
   * button — the cross-tree equivalent of CSS anchor positioning, which can't be
   * used here because the button lives in this element's shadow root while the
   * picker is parented to the top-layer container (a different tree scope).
   */
  private _startEmojiAutoUpdate() {
    const button = this._emojiButton;
    const picker = this._emojiPicker;
    if (!button || !picker) return;
    this._stopEmojiAutoUpdate();
    this._emojiAutoUpdateCleanup = autoUpdate(
      button,
      picker,
      () => void this._positionEmojiPicker(),
    );
  }

  private _stopEmojiAutoUpdate() {
    this._emojiAutoUpdateCleanup?.();
    this._emojiAutoUpdateCleanup = undefined;
  }

  private async _positionEmojiPicker() {
    const button = this._emojiButton;
    const picker = this._emojiPicker;
    // Driven by `autoUpdate` while the picker is open, so it is already laid out
    // in the top-layer and can be measured.
    if (!button || !picker || !picker.matches(':popover-open')) return;

    const { x, y } = await computePosition(button, picker, {
      strategy: 'fixed',
      placement: 'bottom',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });
    Object.assign(picker.style, { left: `${x}px`, top: `${y}px` });
  }

  // --- Rendering ---

  private _renderButton(
    command: ToolbarCommandName,
    label: string,
    icon: string,
    onClick: (event: MouseEvent) => void,
    active = false,
    onPointerDown?: (event: PointerEvent) => void,
  ): TemplateResult {
    const iconTag = staticTag('icon');
    return html`
      <button
        type="button"
        part="toolbar-button"
        class="toolbar-button ${classMap({ 'is-active': active })}"
        data-command=${command}
        aria-label=${label}
        aria-pressed=${active}
        title=${label}
        @pointerdown=${onPointerDown}
        @click=${onClick}
      >
        <${iconTag} name=${icon}></${iconTag}>
      </button>
    `;
  }

  private _renderToolbarItem(command: ToolbarCommandName) {
    const editor = this.editor;
    switch (command) {
      case 'divider':
        return html`<span
          part="divider"
          class="divider"
        ></span>`;
      case 'heading-1':
        return this._renderButton(
          'heading-1',
          'Heading 1',
          'ri:h-1',
          () => this.toggleHeading(1),
          editor.isActive('heading', { level: 1 }),
        );
      case 'heading-2':
        return this._renderButton(
          'heading-2',
          'Heading 2',
          'ri:h-2',
          () => this.toggleHeading(2),
          editor.isActive('heading', { level: 2 }),
        );
      case 'heading-3':
        return this._renderButton(
          'heading-3',
          'Heading 3',
          'ri:h-3',
          () => this.toggleHeading(3),
          editor.isActive('heading', { level: 3 }),
        );
      case 'bold':
        return this._renderButton(
          'bold',
          'Bold',
          'ri:bold',
          () => this.toggleBold(),
          editor.isActive('bold'),
        );
      case 'italic':
        return this._renderButton(
          'italic',
          'Italic',
          'ri:italic',
          () => this.toggleItalic(),
          editor.isActive('italic'),
        );
      case 'underline':
        return this._renderButton(
          'underline',
          'Underline',
          'ri:underline',
          () => this.toggleUnderline(),
          editor.isActive('underline'),
        );
      case 'strike':
        return this._renderButton(
          'strike',
          'Strikethrough',
          'ri:strikethrough',
          () => this.toggleStrike(),
          editor.isActive('strike'),
        );
      case 'highlight':
        return this._renderButton(
          'highlight',
          'Highlight',
          'ri:mark-pen-line',
          () => this.toggleHighlight(),
          editor.isActive('highlight'),
        );
      case 'bulletlist':
        return this._renderButton(
          'bulletlist',
          'Bullet list',
          'ri:list-unordered',
          () => this.toggleBulletList(),
          editor.isActive('bulletList'),
        );
      case 'orderedlist':
        return this._renderButton(
          'orderedlist',
          'Ordered list',
          'ri:list-ordered',
          () => this.toggleOrderedList(),
          editor.isActive('orderedList'),
        );
      case 'blockquote':
        return this._renderButton(
          'blockquote',
          'Blockquote',
          'ri:double-quotes-l',
          () => this.toggleBlockquote(),
          editor.isActive('blockquote'),
        );
      case 'code-block':
        return this._renderButton(
          'code-block',
          'Code block',
          'ri:code-box-line',
          () => this.toggleCodeBlock(),
          editor.isActive('codeBlock'),
        );
      case 'horizontal-rule':
        return this._renderButton('horizontal-rule', 'Horizontal rule', 'ri:separator', () =>
          this.setHorizontalRule(),
        );
      case 'link':
        return this._renderButton(
          'link',
          'Link',
          'ri:link',
          () => this.toggleLink(),
          editor.isActive('link'),
        );
      case 'emoji':
        return this._renderButton(
          'emoji',
          'Emoji',
          'ri:emotion-line',
          (event) => void this._onEmojiButtonClick(event),
          false,
          this._onEmojiButtonPointerDown,
        );
      case 'attachment':
        return this._renderButton('attachment', 'Attach file', 'ri:attachment-2', () =>
          this.emit('add-file'),
        );
      case 'undo':
        return this._renderButton('undo', 'Undo', 'ri:arrow-go-back-line', () => this.undo());
      case 'redo':
        return this._renderButton('redo', 'Redo', 'ri:arrow-go-forward-line', () => this.redo());
      default:
        return null;
    }
  }

  override render() {
    return html`
      <div
        class="wrapper"
        part="wrapper"
      >
        <div
          class="toolbar"
          part="toolbar"
          role="toolbar"
          aria-label="Formatting"
        >
          <slot name="toolbar-start"></slot>
          ${this.editor ? map(this._toolbar, (command) => this._renderToolbarItem(command)) : null}
          <slot name="toolbar-end"></slot>
        </div>
        <div
          class="editor"
          part="editor"
        >
          <slot name="editor"></slot>
        </div>
      </div>
    `;
  }
}
