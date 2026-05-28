import { html, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
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

  @state()
  accessor _emojiPickerActive = false;

  private _editorRoot?: HTMLDivElement;
  private _emojiPicker?: HTMLElement;

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

    document.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('focus', this._onFocus);
    this._syncValue();
    this.requestUpdate();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('disabled') && this.editor) {
      this.editor.setEditable(!this.disabled);
    }
    if (changed.has('_emojiPickerActive')) {
      void this._positionEmojiPicker();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeyDown);
    this.removeEventListener('focus', this._onFocus);
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
    if (event.key === 'Escape') this._emojiPickerActive = false;
  };

  // --- Emoji picker (lazy-loaded) ---

  private async _toggleEmojiPicker() {
    if (!this._emojiPicker) {
      const [{ Picker }, { default: data }] = await Promise.all([
        import('emoji-mart'),
        import('@emoji-mart/data'),
      ]);
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._emojiPicker = new Picker({
        parent: document.body,
        data,
        theme: dark ? 'dark' : 'light',
        onEmojiSelect: ({ native }: { native: string }) => {
          this.editor.chain().focus().insertContent(native).run();
          this._emojiPickerActive = false;
        },
        onClickOutside: (event: PointerEvent) => {
          if (!event.composedPath().includes(this._emojiButton!)) {
            this._emojiPickerActive = false;
          }
        },
      }) as unknown as HTMLElement;
      Object.assign(this._emojiPicker.style, { position: 'absolute', zIndex: '999' });
    }
    this._emojiPickerActive = !this._emojiPickerActive;
  }

  private get _emojiButton(): HTMLElement | null {
    return this.shadowRoot?.querySelector('[data-command="emoji"]') ?? null;
  }

  private async _positionEmojiPicker() {
    const button = this._emojiButton;
    if (!button || !this._emojiPicker) return;

    if (!this._emojiPickerActive) {
      Object.assign(this._emojiPicker.style, { visibility: 'hidden', pointerEvents: 'none' });
      return;
    }

    const { x, y, strategy } = await computePosition(button, this._emojiPicker, {
      placement: 'bottom',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });
    Object.assign(this._emojiPicker.style, {
      position: strategy,
      left: `${x}px`,
      top: `${y}px`,
      visibility: 'visible',
      pointerEvents: 'auto',
    });
  }

  // --- Rendering ---

  private _renderButton(
    command: ToolbarCommandName,
    label: string,
    icon: string,
    onClick: () => void,
    active = false,
  ): TemplateResult {
    return html`
      <button
        type="button"
        part="toolbar-button"
        class="toolbar-button ${classMap({ 'is-active': active })}"
        data-command=${command}
        aria-label=${label}
        aria-pressed=${active}
        title=${label}
        @click=${onClick}
      >
        <l-icon name=${icon}></l-icon>
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
          () => void this._toggleEmojiPicker(),
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
