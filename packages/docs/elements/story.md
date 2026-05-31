---
outline: deep
---

# Story <Badge type="tip">&lt;l-story&gt;</Badge>

A single story declaration inside [`<l-stories>`](/elements/stories). Renders the clickable thumbnail; the [viewer](/elements/stories-viewer) reads its `src`, `poster`, `label`, `chapters`, and `tracks` to play it. See [Stories](/elements/stories) for examples and the row layout.

<ElementSpec element="story" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/story';
```

```css [CSS]
@import 'luxen-ui/css/story';
```

:::

### Attributes & Properties

<ApiTable element="story" section="properties" />

### Methods

<ApiTable element="story" section="methods" />

### Slots

<ApiTable element="story" section="slots" />

### CSS classes

<ApiTable element="story" section="cssClasses" />

### CSS custom properties

The thumbnail layout tokens (`--size`, `--radius`, `--ring-color`, `--ring-color-seen`, `--ring-width`, `--ring-offset`, `--ring-offset-color`, `--label-color`) are declared on `<l-stories>` and cascade to every story. See [Stories › CSS custom properties](/elements/stories#css-custom-properties). The play-icon disc is styled inline; consumers can override it by targeting `.l-story-play l-icon`.

The pulse animation has its own knobs:

<ApiTable element="story" section="cssProperties" />
