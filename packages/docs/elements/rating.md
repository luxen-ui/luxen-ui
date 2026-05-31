---
outline: deep
---

<script setup>
import { onMounted } from 'vue'
import ratingDefault from '../.vitepress/examples/rating/RatingDefault.html?raw'
import ratingEditable from '../.vitepress/examples/rating/RatingEditable.html?raw'
import ratingLabels from '../.vitepress/examples/rating/RatingLabels.html?raw'
import ratingSizes from '../.vitepress/examples/rating/RatingSizes.html?raw'
import ratingCustomColors from '../.vitepress/examples/rating/RatingCustomColors.html?raw'
import ratingCustomShape from '../.vitepress/examples/rating/RatingCustomShape.html?raw'
import ratingDisabled from '../.vitepress/examples/rating/RatingDisabled.html?raw'
import ratingMax from '../.vitepress/examples/rating/RatingMax.html?raw'
import ratingValueBasedShapes from '../.vitepress/examples/rating/RatingValueBasedShapes.html?raw'
import ratingSocialProof from '../.vitepress/examples/rating/RatingSocialProof.html?raw'

onMounted(() => {
  customElements.whenDefined('l-rating').then(() => {
    const rating = document.querySelector('.emoji-rating');
    if (!rating) return;
    // Faces with cutout eyes + mouth (fill-rule="evenodd" creates holes)
    const faces = [
      // Angry: frown mouth, angled brows
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill-rule='evenodd'%3E%3Cpath d='M12 2a10 10 0 110 20 10 10 0 010-20zM9 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 17c0-2.2 1.8-3 4-3s4 .8 4 3z'/%3E%3C/svg%3E\")",
      // Sad: slight frown
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill-rule='evenodd'%3E%3Cpath d='M12 2a10 10 0 110 20 10 10 0 010-20zM9 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8.5 16.5c0-1.4 1.6-2 3.5-2s3.5.6 3.5 2z'/%3E%3C/svg%3E\")",
      // Neutral: straight mouth
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill-rule='evenodd'%3E%3Cpath d='M12 2a10 10 0 110 20 10 10 0 010-20zM9 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 15h8v1.5H8z'/%3E%3C/svg%3E\")",
      // Happy: smile
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill-rule='evenodd'%3E%3Cpath d='M12 2a10 10 0 110 20 10 10 0 010-20zM9 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 14c0 2.2 1.8 3 4 3s4-.8 4-3z'/%3E%3C/svg%3E\")",
      // Ecstatic: big grin
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill-rule='evenodd'%3E%3Cpath d='M12 2a10 10 0 110 20 10 10 0 010-20zM9 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7 13c0 3.3 2.2 5 5 5s5-1.7 5-5z'/%3E%3C/svg%3E\")",
    ];
    rating.getIcon = (value) => faces[value - 1];
    rating.requestUpdate();
  });
});
</script>

# Rating <Badge type="tip">&lt;l-rating&gt;</Badge>

Ratings are used to display or collect a score on a star-based scale. Commonly used for product reviews, feedback forms, and satisfaction surveys.

<ElementSpec element="rating" />

## Options

### Basic

Displays a read-only fractional rating.

<ComponentWrapper :html="ratingDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingDefault.html [HTML]
:::

### Editable

Add `edit-mode` to allow user input via radio buttons.

<ComponentWrapper :html="ratingEditable" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingEditable.html [HTML]
:::

### Labels

Pipe-separated `labels` attribute shows a text label for each star value.

<ComponentWrapper :html="ratingLabels" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingLabels.html [HTML]
:::

### Length

Set `length` to change the number of stars. Defaults to `5`.

<ComponentWrapper :html="ratingMax" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingMax.html [HTML]
:::

### Sizes

Override `--icon-size`.

<ComponentWrapper :html="ratingSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingSizes.html [HTML]
:::

### Custom colors

Override `--active-color` and `--inactive-color`.

<ComponentWrapper :html="ratingCustomColors" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingCustomColors.html [HTML]
:::

### Disabled

Native `disabled` attribute.

<ComponentWrapper :html="ratingDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingDisabled.html [HTML]
:::

### Custom shape

Override `--icon` with any SVG `url()`.

<ComponentWrapper :html="ratingCustomShape" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingCustomShape.html [HTML]
:::

### Value-based shapes

Assign the `getIcon` property — a function returning a CSS `url()` per position.

<ComponentWrapper :html="ratingValueBasedShapes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingValueBasedShapes.html [HTML]
:::

## Examples

### Social proof

Avatar group + star rating as a trust badge.

<ComponentWrapper :html="ratingSocialProof" />

::: details Code
::: code-group
<<< @/.vitepress/examples/rating/RatingSocialProof.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'In edit mode, uses native `<input type=&quot;radio&quot;>` elements — built-in semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Provide an associated label via `<label>` or `aria-label` when in edit mode', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Non-text contrast', Description: 'Star colors must meet non-text contrast ratio against the background', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)' },
  { Check: 'Focus', Description: 'Focus ring shown around the rating group via `:focus-within`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)' },
]" :rules="[
  'Wrap editable ratings with a visible `<label>` or provide `aria-label` on the host element',
  'In read-only mode, add `aria-label` describing the rating (e.g., `aria-label=&quot;3.5 out of 5 stars&quot;`)',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus into and out of the rating group' },
  { Key: 'ArrowLeft / ArrowRight', Description: 'Moves between radio options (native radio group behavior)' },
  { Key: 'Space', Description: 'Selects the focused radio option' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/rating';
```

:::

### Attributes & Properties

<ApiTable element="rating" section="properties" />

### Methods

<ApiTable element="rating" section="properties" />

### Events

<ApiTable element="rating" section="events" />

### CSS Parts

<ApiTable element="rating" section="cssParts" />

### CSS custom properties

<ApiTable element="rating" section="cssProperties" />
