---
outline: deep
---

<script setup>
import kbdDefault from '../.vitepress/examples/kbd/KbdDefault.html?raw'
import kbdShortcuts from '../.vitepress/examples/kbd/KbdShortcuts.html?raw'
</script>

# Kbd <Badge type="tip">&lt;kbd&gt;</Badge>

Kbd elements are used to display keyboard keys or shortcuts inline with text. Commonly used in documentation, tooltips, and help panels to indicate key bindings.

<ElementSpec element="kbd" />

## Options

### Single keys

Add `.l-kbd` to a native `<kbd>` element.

<ComponentWrapper :html="kbdDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/kbd/KbdDefault.html [HTML]
:::

### Key combinations

Wrap individual `<kbd>` elements in an outer `<kbd>` with `+` separators.

<ComponentWrapper :html="kbdShortcuts" />

::: details Code
::: code-group
<<< @/.vitepress/examples/kbd/KbdShortcuts.html [HTML]
:::

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/kbd';
```

:::

### CSS classes

<ApiTable element="kbd" section="cssClasses" />
