---
outline: deep
---

<script setup>
import proseEditorBasic from '../.vitepress/examples/prose-editor/ProseEditorBasic.html?raw'
import proseEditorMinimal from '../.vitepress/examples/prose-editor/ProseEditorMinimal.html?raw'
import proseEditorCustomToolbar from '../.vitepress/examples/prose-editor/ProseEditorCustomToolbar.html?raw'
import proseEditorPlacement from '../.vitepress/examples/prose-editor/ProseEditorPlacement.html?raw'
import proseEditorForm from '../.vitepress/examples/prose-editor/ProseEditorForm.html?raw'
</script>

# Prose Editor <Badge type="tip">&lt;l-prose-editor&gt;</Badge>

A rich text editor built on [Tiptap](https://tiptap.dev) (ProseMirror). Form-associated — its value is the editor HTML, so it submits inside a `<form>` like a native field.

::: code-group

```html [HTML]
<l-prose-editor placeholder="Write something…"></l-prose-editor>
```

:::

The editable area renders in light DOM, so its content styles ship as a separate stylesheet you import once globally. See [Importing](#importing).

<ElementSpec element="prose-editor" />

## Options

### Basic

The default toolbar covers headings, marks, lists, links, code, an emoji picker and undo/redo. Set initial content with `initial-html`.

<ComponentWrapper :html="proseEditorBasic" vertical />

::: details Code
::: code-group
<<< @/.vitepress/examples/prose-editor/ProseEditorBasic.html [HTML]
:::

### Toolbar preset

Set `toolbar-preset="minimal"` for a compact bold/italic/underline toolbar.

<ComponentWrapper :html="proseEditorMinimal" vertical />

::: details Code
::: code-group
<<< @/.vitepress/examples/prose-editor/ProseEditorMinimal.html [HTML]
:::

### Custom toolbar

Set `toolbar` to a comma-separated list of commands to build your own layout. Use `divider` to insert a separator.

<ComponentWrapper :html="proseEditorCustomToolbar" vertical />

::: details Code
::: code-group
<<< @/.vitepress/examples/prose-editor/ProseEditorCustomToolbar.html [HTML]
:::

Available commands: `heading-1`, `heading-2`, `heading-3`, `bold`, `italic`, `underline`, `strike`, `highlight`, `bulletlist`, `orderedlist`, `blockquote`, `code-block`, `horizontal-rule`, `link`, `emoji`, `attachment`, `undo`, `redo`, `divider`.

### Toolbar placement

Set `toolbar-placement="bottom"` to move the toolbar below the content.

<ComponentWrapper :html="proseEditorPlacement" vertical />

::: details Code
::: code-group
<<< @/.vitepress/examples/prose-editor/ProseEditorPlacement.html [HTML]
:::

## Examples

### Form integration

The editor participates in forms via its `name` attribute. The submitted value is the HTML string; `required` blocks submission while empty.

<ComponentWrapper :html="proseEditorForm" vertical />

::: details Code
::: code-group
<<< @/.vitepress/examples/prose-editor/ProseEditorForm.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Toolbar role', Description: 'The toolbar uses `role=&quot;toolbar&quot;` with an accessible label', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Button state', Description: 'Each toolbar button exposes `aria-pressed` reflecting whether the mark/format is active', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Button label', Description: 'Icon-only buttons carry an `aria-label` and `title` describing the action', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.3)' },
  { Check: 'Focus state', Description: 'Visible focus ring on toolbar buttons for keyboard users', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Form validation', Description: 'When `required`, an empty editor reports a `valueMissing` validation message to the form', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)' },
]" :rules="[
  'Associate a visible `<label>` with the editor, or set `aria-label` on the host element',
  'Keep custom toolbars logically ordered so keyboard users encounter commands in a predictable sequence',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus into the toolbar, then into the editable content' },
  { Key: 'Ctrl/Cmd + B', Description: 'Toggles bold' },
  { Key: 'Ctrl/Cmd + I', Description: 'Toggles italic' },
  { Key: 'Ctrl/Cmd + U', Description: 'Toggles underline' },
  { Key: 'Ctrl/Cmd + Z', Description: 'Undo' },
  { Key: 'Ctrl/Cmd + Shift + Z', Description: 'Redo' },
  { Key: 'Escape', Description: 'Closes the emoji picker when open' },
]" />

## API reference

### Importing

Import the element and the content stylesheet once globally. The stylesheet styles the editable area, which renders in light DOM to avoid `contenteditable` caret bugs inside shadow trees.

::: code-group

```js [JS]
import 'luxen-ui/prose-editor';
```

```css [CSS]
@import 'luxen-ui/css/prose-editor';
```

:::

### Attributes & Properties

<ApiTable element="prose-editor" section="properties" />

### Methods

<ApiTable element="prose-editor" section="methods" />

### Events

<ApiTable element="prose-editor" section="events" />

### Slots

<ApiTable element="prose-editor" section="slots" />

### CSS Parts

<ApiTable element="prose-editor" section="cssParts" />

### CSS custom properties

<ApiTable element="prose-editor" section="cssProperties" />
