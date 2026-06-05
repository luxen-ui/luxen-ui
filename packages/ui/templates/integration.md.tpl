# {{displayName}} — integration mode

Use this file when building an application with `{{name}}` installed via npm and bundled (Vite/Webpack/etc.).

## Installation

Import the preset (base + tokens) and per-element CSS:

```css
@import '{{cssImportPath}}/preset';
@import '{{cssImportPath}}/button';
@import '{{cssImportPath}}/close-button/ring';
```

For custom elements, also import the JavaScript:

```js
import '{{jsImportPath}}';
```

## Element inventory

{{elementsTable}}

## Quick patterns

A button:

```html
<button class="l-button">Label</button>
<button class="l-button" data-variant="primary">Primary</button>
```

A badge:

```html
<l-badge>Default</l-badge>
<l-badge variant="success">Success</l-badge>
```

A dialog:

```html
<button class="l-button" command="--show" commandfor="my-dialog">Open</button>
<l-dialog id="my-dialog" title="Dialog title">
  <button slot="close" class="l-close" data-appearance="ring" aria-label="Close"
          command="--hide" commandfor="my-dialog"></button>
  <p>Dialog content</p>
  <div slot="footer">
    <button class="l-button" command="--hide" commandfor="my-dialog">Close</button>
  </div>
</l-dialog>
```
