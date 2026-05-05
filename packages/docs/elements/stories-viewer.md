---
outline: deep
---

# Stories viewer <Badge type="tip">&lt;l-stories-viewer&gt;</Badge>

The fullscreen modal that plays a sequence of [`<l-story>`](/elements/story) videos. Linked to one or more [`<l-stories>`](/elements/stories) rows via matching `id` ↔ `for`. See [Stories](/elements/stories) for the full composition pattern, examples, and accessibility notes.

<ElementSpec
  tag="l-stories-viewer"
  type="shadow"
/>

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/stories-viewer';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'open', Description: 'Whether the viewer is open. Reflects to attribute' },
  { Attribute: 'index', Description: 'Active story index (0-based)' },
  { Attribute: 'chapter', Description: 'Active chapter index within the current story (0-based)' },
  { Attribute: 'muted', Description: 'Whether playback is muted. Default `true` so autoplay always succeeds. Toggle via the mute button or `m` key' },
  { Attribute: 'loop', Description: 'Loop the active story instead of advancing' },
  { Attribute: 'auto-advance', Description: 'Advance on `story-end`; close after the last story. Default `true`' },
  { Attribute: 'light-dismiss', Description: 'Backdrop click closes the viewer. Default `true`' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'open(index?)', Description: 'Open the viewer at the given story index' },
  { Method: 'close()', Description: 'Close the viewer' },
  { Method: 'next()', Description: 'Advance one chapter, or to the next story at the chapter boundary' },
  { Method: 'previous()', Description: 'Retreat one chapter, restart the current chapter past 1s in, or cross into the previous story' },
  { Method: 'nextStory()', Description: 'Jump to the next story, skipping any remaining chapters' },
  { Method: 'previousStory()', Description: 'Jump to the previous story regardless of current chapter' },
  { Method: 'play()', Description: 'Resume video playback' },
  { Method: 'pause()', Description: 'Pause video playback' },
]" />

### Events

<ApiTable :data="[
  { Event: 'show', Description: 'Fired when the viewer opens' },
  { Event: 'after-show', Description: 'Fired after the open transition' },
  { Event: 'hide', Description: 'Fired when about to close. Cancelable' },
  { Event: 'after-hide', Description: 'Fired after the close transition' },
  { Event: 'story-change', Description: 'Active story changed. Detail: `{ index, story }`' },
  { Event: 'chapter-change', Description: 'Active chapter changed within a story. Detail: `{ chapter, story }`' },
  { Event: 'story-end', Description: 'Active story finished playback. Detail: `{ index }`' },
  { Event: 'mute-change', Description: 'Mute state toggled. Detail: `{ muted }`' },
]" />

### Slots

<ApiTable :data="[
  { Slot: 'cta', Description: 'Default CTA overlay. Per-story `&lt;l-story slot=&quot;cta&quot;&gt;…&lt;/l-story&gt;` overrides this when that story is active' },
  { Slot: 'header', Description: 'Default header overlay (e.g. avatar + author). Per-story override available the same way' },
  { Slot: 'close', Description: 'Override the default close button' },
]" />

### CSS parts

<ApiTable :data="[
  { Part: 'dialog', Description: 'The native `<dialog>` element' },
  { Part: 'frame', Description: 'The aspect-ratio video frame' },
  { Part: 'progress', Description: 'The progress bar wrapper' },
  { Part: 'progress-segment', Description: 'A single progress segment (one per chapter)' },
  { Part: 'progress-fill', Description: 'The fill element inside an active segment' },
  { Part: 'video', Description: 'The `<video>` element' },
  { Part: 'overlay', Description: 'The overlay wrapper that hosts the CTA slot' },
  { Part: 'header', Description: 'The top-left header area (story thumbnail + label fallback, or consumer-supplied content via the `header` slot)' },
  { Part: 'header-label', Description: 'The default story label inside the header' },
  { Part: 'actions', Description: 'The top-right vertical button stack (close, play/pause, mute)' },
  { Part: 'button-close', Description: 'The close button' },
  { Part: 'button-pause', Description: 'The play/pause toggle' },
  { Part: 'button-mute', Description: 'The mute toggle' },
  { Part: 'button-previous', Description: 'The previous-story button (hidden on mobile)' },
  { Part: 'button-next', Description: 'The next-story button (hidden on mobile)' },
  { Part: 'spinner', Description: 'The loading spinner shown while the current video is buffering. Hidden by default; appears with a 200ms delay so fast loads never flash' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--width', Description: 'Frame width. Default `min(420px, 100vw)`' },
  { Name: '--progress-color', Description: 'Active progress fill color. Default `white`' },
  { Name: '--progress-bg', Description: 'Inactive progress segment background. Default `rgb(255 255 255 / 35%)`' },
  { Name: '--progress-gap', Description: 'Gap between segments. Default `4px`' },
  { Name: '--show-duration', Description: 'Open transition duration. Default `200ms`' },
  { Name: '--hide-duration', Description: 'Close transition duration. Default `200ms`' },
  { Name: '--backdrop', Description: 'Backdrop color. Default `var(--l-backdrop-strong)` — darker than the regular `--l-backdrop` since the viewer is an immersive overlay. Override to e.g. `oklch(0% 0 0 / 90%)` for an opaque blackout' },
]" />

To change the frame ratio (e.g. `4/5` or `1/1`), target the `frame` part:

```css
l-stories-viewer::part(frame) {
  aspect-ratio: 4/5;
}
```
