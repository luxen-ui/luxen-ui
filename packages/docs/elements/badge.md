<script setup>
import badgeVariant from '../.vitepress/examples/badge/BadgeVariant.html?raw'
import badgeWithDot from '../.vitepress/examples/badge/BadgeWithDot.html?raw'
</script>

# Badge <Badge type="tip">HTML custom element</Badge>

## Variants

<ComponentWrapper :html="badgeVariant" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeVariant.html [HTML]
:::


## With dots

<ComponentWrapper :html="badgeWithDot" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/badgeWithDot.html [HTML]
:::


## CSS custom properties

<CssCustomPropertiesTable tag-name="badge" />
