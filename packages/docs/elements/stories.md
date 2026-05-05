---
outline: deep
---

<script setup>
import storiesRounded from '../.vitepress/examples/stories/StoriesRounded.html?raw'
import storiesSquared from '../.vitepress/examples/stories/StoriesSquared.html?raw'
import storiesPortrait from '../.vitepress/examples/stories/StoriesPortrait.html?raw'
import storiesGradientRing from '../.vitepress/examples/stories/StoriesGradientRing.html?raw'
import storiesChapters from '../.vitepress/examples/stories/StoriesChapters.html?raw'
import storiesShoppable from '../.vitepress/examples/stories/StoriesShoppable.html?raw'
</script>

# Stories <Badge type="tip">&lt;l-stories&gt; &lt;l-story&gt; &lt;l-stories-viewer&gt;</Badge>

Instagram-style web stories. A horizontal row of clickable thumbnails opens a fullscreen viewer that plays each video with a segmented progress bar, previous/next navigation, mute toggle, and auto-advance.

<ElementSpec
  tag="l-stories"
  type="custom"
/>

## Options

### Rounded stories

The default appearance — circular thumbnails with a label below. Videos open in full screen.

<ComponentWrapper vertical :html="storiesRounded" />

::: details Code
::: code-group
<<< @/.vitepress/examples/stories/StoriesRounded.html [HTML]
:::

The thumbnail ring picks up `--ring-color` (any `background` value — solid, `linear-gradient`, `conic-gradient`, image) and shows a `--ring-offset` gap filled with `--ring-offset-color`. Pair a thicker `--ring-width` with the gap to make fresh stories stand out:

<ComponentWrapper vertical :html="storiesGradientRing" />

::: details Code
::: code-group
<<< @/.vitepress/examples/stories/StoriesGradientRing.html [HTML]
:::

### Squared stories

Set `appearance="squared"` for square thumbnails with rounded corners. Videos open in full screen.

<ComponentWrapper vertical :html="storiesSquared" />

::: details Code
::: code-group
<<< @/.vitepress/examples/stories/StoriesSquared.html [HTML]
:::

### Portrait stories

Set `appearance="portrait"` for tall video cards (9:16). Videos open in full screen.

<ComponentWrapper vertical :html="storiesPortrait" />

::: details Code
::: code-group
<<< @/.vitepress/examples/stories/StoriesPortrait.html [HTML]
:::

### Chapters

Split a single video into chapters with `chapters="0,5,12,20"` (start times in seconds, comma-separated; `0` is implicit). The progress bar renders one segment per chapter; tap or `→` advances to the next chapter, then auto-advances to the next story at the last chapter.

<ComponentWrapper vertical :html="storiesChapters" />

::: details Code
::: code-group
<<< @/.vitepress/examples/stories/StoriesChapters.html [HTML]
:::

### Shoppable overlay

Slot a CTA into `<l-story slot="cta">`. The viewer surfaces it only on the active story.

<ComponentWrapper vertical :html="storiesShoppable" />

::: details Code
::: code-group
<<< @/.vitepress/examples/stories/StoriesShoppable.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Roles', Description: 'Row is a `list` of triggers; viewer is a native modal `<dialog>`; progress bar has `role=&quot;progressbar&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'Each thumbnail uses `label` as its `aria-label`; viewer announces &quot;Story X of N — label&quot; on change', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Focus management', Description: 'Native dialog traps focus; closes restore focus to the originating thumbnail', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Autoplay policy', Description: 'Video opens muted by default — `m` or the mute toggle requires a user gesture to unmute', WCAG: '[WCAG 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion` for transitions and progress fill smoothing', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Always provide a `label` on every `l-story` — it becomes the trigger `aria-label`',
  'Pair the row and viewer with matching `for` ↔ `id` so multiple rows can share one viewer',
  'Provide poster images so the row renders without loading any video',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Opens the viewer at the focused thumbnail' },
  { Key: 'Arrow Left / Right', Description: 'Previous / next chapter (crosses into the previous / next story at the chapter boundary)' },
  { Key: 'Space', Description: 'Toggles play/pause' },
  { Key: 'M', Description: 'Toggles mute' },
  { Key: 'Escape', Description: 'Closes the viewer' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/stories';
import 'luxen-ui/story';
import 'luxen-ui/stories-viewer';
```

```css [CSS]
@import 'luxen-ui/css/stories';
@import 'luxen-ui/css/story';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'for', Description: 'ID of the linked `<l-stories-viewer>`. If omitted, a singleton viewer is appended on first click' },
  { Attribute: 'appearance', Description: '`rounded` (default) · `squared` · `portrait` · `landscape`' },
]" />

To customize size, radius, gap, or hide labels, set the [CSS custom properties](#css-custom-properties) directly via inline `style` or external CSS — no extra attributes needed.

### Methods

<ApiTable :data="[
  { Method: 'open(index?)', Description: 'Open the linked viewer at the given story index' },
  { Method: 'stories()', Description: 'Returns the direct `<l-story>` children as `LuxenStory[]`' },
]" />

### Events

<ApiTable :data="[
  { Event: 'story-open', Description: 'Fired when a thumbnail is clicked. Detail: `{ index, story }`' },
  { Event: 'story-close', Description: 'Fired when the viewer closes. Detail: `{ index }`' },
]" />

### CSS custom properties

These tokens are set on `<l-stories>` and cascade to every `<l-story>` child.

<ApiTable :data="[
  { Name: '--size', Description: 'Thumbnail size. Per-appearance default' },
  { Name: '--radius', Description: 'Thumbnail border radius. Per-appearance default' },
  { Name: '--gap', Description: 'Gap between thumbnails. Default `1rem`' },
  { Name: '--ring-color', Description: 'Ring color around fresh thumbnails' },
  { Name: '--ring-color-seen', Description: 'Ring color for `[seen]` thumbnails' },
  { Name: '--ring-width', Description: 'Ring width. Default `2px`' },
  { Name: '--label-color', Description: 'Label text color' },
]" />

The play-icon disc inside `.l-story-play l-icon` is styled inline (white icon, 35 % black background). Override it directly via standard CSS: `l-story .l-story-play l-icon { background: …; color: … }`.
