---
outline: deep
---

# Stories viewer <Badge type="tip">&lt;l-stories-viewer&gt;</Badge>

The fullscreen modal that plays a sequence of [`<l-story>`](/elements/story) videos. Linked to one or more [`<l-stories>`](/elements/stories) rows via matching `id` ↔ `for`. See [Stories](/elements/stories) for the full composition pattern, examples, and accessibility notes.

<ElementSpec element="stories-viewer" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/stories-viewer';
```

:::

### Attributes & Properties

<ApiTable element="stories-viewer" section="properties" />

### Methods

<ApiTable element="stories-viewer" section="methods" />

### Events

<ApiTable element="stories-viewer" section="events" />

### Slots

<ApiTable element="stories-viewer" section="slots" />

### CSS parts

<ApiTable element="stories-viewer" section="cssParts" />

### CSS custom properties

<ApiTable element="stories-viewer" section="cssProperties" />

To change the frame ratio (e.g. `4/5` or `1/1`), target the `frame` part:

```css
l-stories-viewer::part(frame) {
  aspect-ratio: 4/5;
}
```

The `<video>` defaults to `object-fit: cover` so portrait videos fill the 9/16 frame edge-to-edge. For mixed catalogs with landscape or square videos, switch to `contain` to letterbox instead of cropping:

```css
l-stories-viewer::part(video) {
  object-fit: contain;
}
```
