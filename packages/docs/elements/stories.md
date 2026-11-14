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

<ElementSpec element="stories" />

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
  { Check: 'List and dialog roles exposed', Description: 'The row is a `list` of triggers, the viewer a native modal `<dialog>`, the progress bar a `role=&quot;progressbar&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Thumbnails named from `label`', Description: 'Each thumbnail uses `label` as its `aria-label`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Story changes announced', Description: 'The viewer announces &quot;Story X of N — label&quot; on change', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Focus trapped while open', Description: 'The native dialog traps focus', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Focus returns to the thumbnail on close', Description: 'Closing restores focus to the originating thumbnail', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Video opens muted', Description: 'Only a user gesture unmutes it: `m` or the mute toggle', WCAG: '[WCAG 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control)' },
  { Check: 'Reduced motion respected', Description: 'Transitions and progress fill smoothing follow `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Label every story', Description: 'Set a `label` on every `l-story`', Note: 'It becomes the trigger `aria-label`' },
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

<ApiTable element="stories" section="properties" />

To customize size, radius, gap, or hide labels, set the [CSS custom properties](#css-custom-properties) directly via inline `style` or external CSS — no extra attributes needed.

### Methods

<ApiTable element="stories" section="methods" />

### Events

<ApiTable element="stories" section="events" />

### CSS custom properties

These tokens are set on `<l-stories>` and cascade to every `<l-story>` child.

<ApiTable element="stories" section="cssProperties" />

The play-icon disc inside `.l-story-play l-icon` is styled inline (white icon, 35 % black background). Override it directly via standard CSS: `l-story .l-story-play l-icon { background: …; color: … }`.
