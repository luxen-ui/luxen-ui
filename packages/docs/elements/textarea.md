---
outline: deep
---

<script setup>
import resizeExample from '../.vitepress/examples/textarea/Resize.html?raw'
import sizesExample from '../.vitepress/examples/textarea/Sizes.html?raw'
import statesExample from '../.vitepress/examples/textarea/States.html?raw'
import defaultExample from '../.vitepress/examples/textarea/Default.html?raw'
</script>

# Textarea <Badge type="tip">&lt;textarea&gt;</Badge>

Textareas let users enter and edit multi-line text.

<ElementSpec element="textarea" />

::: code-group

```html [HTML]
<l-form-field>
  <label>Message</label>
  <textarea
    rows="4"
    placeholder="Tell us what's on your mind…"
  ></textarea>
  <p class="l-hint">We usually reply within a day.</p>
</l-form-field>
```

:::

[`l-form-field`](/elements/form-field) auto-styles a bare `<textarea>` and wires the accessibility (label, hint, error, `aria-*`). Standalone, apply `.l-textarea` to the textarea yourself.

## Options

### Rows

The native `rows` attribute sets the initial height; the textarea never shrinks below one control line.

<ComponentWrapper :html="defaultExample" />

::: details Code
<<< @/.vitepress/examples/textarea/Default.html [HTML]
:::

### Resize

`data-resize` controls the resize handle: `vertical` (default), `none`, `both`, or `auto`. `auto` grows the box with its content and hides the handle — where `field-sizing` is unsupported it keeps the `rows` height.

<ComponentWrapper :html="resizeExample" />

::: details Code
<<< @/.vitepress/examples/textarea/Resize.html [HTML]
:::

### States

Native `disabled` and `readonly`. Invalid is styled via `:user-invalid` (after interaction) or by setting `aria-invalid="true"` — inside `l-form-field` this is managed for you. To disable a group of fields at once, wrap them in `<fieldset disabled>` — see [Form field](./form-field.md#disabled-group).

<ComponentWrapper :html="statesExample" />

::: details Code
<<< @/.vitepress/examples/textarea/States.html [HTML]
:::

### Size

`data-size` maps the single-line min-height to the shared control scale (`xs`–`xl`, default `md`); the padding scales with it.

<ComponentWrapper :html="sizesExample" />

::: details Code
<<< @/.vitepress/examples/textarea/Sizes.html [HTML]
:::

### Radius

Override `--border-radius` for the corners.

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Focus ring on keyboard focus', Description: 'A 2px outline via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Invalid fields styled', Description: '`:user-invalid` and `aria-invalid=&quot;true&quot;` give the field its error style', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  { Check: 'Label the field', Description: 'Wrap the textarea in a `<label>`, or link one with `for` / `id`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Don’t use the placeholder as a label', Note: 'It disappears on input and fails contrast' },
  { Check: 'Link errors to the field', Description: 'Set `aria-invalid` when your own validation fails, and link a visible message with `aria-describedby`', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
  { Check: 'Show a counter with `maxlength`', Description: 'Link a visible character counter with `aria-describedby`', Note: 'Rather than silently truncating input' },
  { Check: 'Mark required fields with `required`', Description: 'Native `required` communicates a mandatory field to assistive tech', WCAG: '[WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the textarea' },
  { Key: 'Enter', Description: 'Inserts a line break (does not submit the form)' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/textarea';
```

:::

The textarea is CSS-only — no JavaScript import.

### Attributes & Properties

<ApiTable element="textarea" section="attributes" />

### CSS classes

<ApiTable element="textarea" section="cssClasses" />

### CSS custom properties

<ApiTable element="textarea" section="cssProperties" />
