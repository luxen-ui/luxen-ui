---
outline: deep
---

# Story <Badge type="tip">&lt;l-story&gt;</Badge>

A single story declaration inside [`<l-stories>`](/elements/stories). Renders the clickable thumbnail; the [viewer](/elements/stories-viewer) reads its `src`, `poster`, `label`, `chapters`, and `tracks` to play it. See [Stories](/elements/stories) for examples and the row layout.

<ElementSpec
  tag="l-story"
  type="custom"
/>

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

<ApiTable :data="[
  { Attribute: 'src', Description: 'Video URL (full story playback)' },
  { Attribute: 'poster', Description: 'Thumbnail image. Falls back to the first video frame' },
  { Attribute: 'preview', Description: 'Short looping preview video (typically 2-3s, 480p, no audio). When set, replaces the poster with a muted autoplay loop on the thumbnail. Off-screen previews are paused via `IntersectionObserver`' },
  { Attribute: 'label', Description: 'Caption shown under the thumbnail and used as the trigger `aria-label`' },
  { Attribute: 'duration', Description: 'Override progress duration in seconds. Defaults to video metadata duration' },
  { Attribute: 'seen', Description: 'Mark this story as already viewed. Reflects to attribute' },
  { Attribute: 'pulse', Description: 'Animated halo + subtle breathing scale to draw attention' },
  { Attribute: 'chapters', Description: 'Chapter start times within the video, comma-separated seconds (e.g. `0,5,12`). `0` is implicit. Empty = single chapter' },
  { Attribute: 'tracks', Description: 'Comma-separated VTT track URLs for captions' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'getChapterStarts()', Description: 'Returns the parsed chapter start times as `number[]`. Always begins with `0`, sorted, deduplicated' },
]" />

### Slots

<ApiTable :data="[
  { Slot: 'cta', Description: 'Overlay surfaced by the viewer when this story is active (e.g. shoppable card)' },
  { Slot: 'header', Description: 'Header overlay (e.g. avatar + author)' },
]" />

### CSS classes

<ApiTable :data="[
  { Class: '.l-story-trigger', Description: 'The `<button>` rendered inside each `<l-story>`' },
  { Class: '.l-story-thumb', Description: 'The poster wrapper (image + play overlay)' },
  { Class: '.l-story-play', Description: 'The centered play-icon disc on the thumbnail (default: white icon on 35 % black). Target `.l-story-play l-icon` to restyle the disc' },
  { Class: '.l-story-label', Description: 'The caption shown under the thumbnail' },
]" />

### CSS custom properties

The thumbnail layout tokens (`--size`, `--radius`, `--ring-color`, `--ring-color-seen`, `--ring-width`, `--ring-offset`, `--ring-offset-color`, `--label-color`) are declared on `<l-stories>` and cascade to every story. See [Stories › CSS custom properties](/elements/stories#css-custom-properties). The play-icon disc is styled inline; consumers can override it by targeting `.l-story-play l-icon`.

The pulse animation has its own knobs:

<ApiTable :data="[
  { Name: '--pulse-color', Description: 'Halo color when `pulse` is set. Default `var(--l-color-bg-fill-brand)`' },
  { Name: '--pulse-spread', Description: 'Maximum halo spread distance. Default `12px`' },
  { Name: '--pulse-duration', Description: 'Animation cycle. Default `1.6s`' },
]" />
