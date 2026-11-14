<script setup>
import { computed } from 'vue';
import { COMPONENT_TOKEN_SPEC } from './component-token-spec.js';

/**
 * Illustrates one component token (button, popover & menus, tooltip). Same
 * contract as FormTokenPreview: the token is set on the wrapper (it inherits
 * into the illustration), either to its own default or — with `highlight` — to
 * the spec's highlight value, and the spec's `paint` marks the affected part.
 *
 * - Buttons are real `.l-button`s in a real `l-button-group`.
 * - The menu is real `l-dropdown-item`s in a static panel that copies the
 *   l-dropdown panel recipe (shared/styles/menu-panel.css): l-dropdown itself
 *   renders its panel in the top layer, which can't sit inside a cell.
 * - The tooltip copies the l-tooltip bubble (tooltip/tooltip.css) for the same
 *   reason.
 */
const props = defineProps({
  token: { type: Object, required: true },
  highlight: { type: Boolean, default: false },
});

const spec = computed(() => COMPONENT_TOKEN_SPEC[props.token.name]);
const preview = computed(() => spec.value?.preview);

/** Style for one named part — only painted in the "Touches" cell. */
function paint(part) {
  return props.highlight ? spec.value?.paint?.[part] : null;
}

const rootStyle = computed(() => ({
  [props.token.name]: props.highlight ? spec.value.highlight : props.token.value,
  // Reset the parent cell's display typography (sized for "Aa" swatches).
  fontSize: 'var(--l-text-sm)',
  fontWeight: 'normal',
  lineHeight: 'normal',
}));

/** Copies the l-dropdown panel (menu-panel.css). */
const panelStyle = {
  padding: 'var(--l-popover-padding)',
  border: '1px solid var(--l-color-border-overlay)',
  borderRadius: 'var(--l-popover-border-radius)',
  background: 'var(--l-color-surface-overlay)',
  color: 'var(--l-color-text-primary)',
  boxShadow: 'var(--l-popover-shadow)',
  fontSize: 'var(--l-popover-font-size)',
  lineHeight: 'var(--l-popover-line-height)',
};

/**
 * Hover can't be triggered on a static (inert) preview — pin the row's hover
 * fill on its host instead. The host wraps the row with no margin, so the same
 * fill and radius land on the same box.
 */
const hoveredRow = {
  background: 'var(--l-color-bg-state-hover)',
  borderRadius: 'var(--l-menu-item-border-radius)',
};

const menuItems = [
  { icon: 'lucide:pencil', label: 'Edit' },
  { icon: 'lucide:copy', label: 'Duplicate' },
];

/** A bare menu panel around the icon-token rows, sized to one item. */
const iconMenuStyle = {
  inlineSize: '9rem',
  padding: '0.25rem',
  border: '1px solid var(--l-color-border-overlay)',
  borderRadius: 'var(--l-popover-border-radius)',
  background: 'var(--l-color-surface-overlay)',
};

/** Copies the l-tooltip bubble (tooltip.css). Text: white on the dark default and on the violet highlight, near-black on the light dark-mode default. */
const bubbleStyle = computed(() => ({
  padding: '4px 8px',
  borderRadius: '4px',
  background: 'var(--l-tooltip-background-color)',
  color: props.highlight
    ? 'var(--l-color-white)'
    : 'light-dark(var(--l-color-white), var(--l-color-gray-900))',
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 16%))',
}));
</script>

<template>
  <div
    inert
    class="flex size-full items-center justify-center gap-3 px-3 text-start"
    :style="rootStyle"
  >
    <!-- Button: a segmented group (seams overlap by the border width) next to a primary action. -->
    <template v-if="preview === 'buttons'">
      <l-button-group label="View">
        <button
          type="button"
          class="l-button"
          :style="paint('button')"
        >
          Day
        </button>
        <button
          type="button"
          class="l-button"
          :style="paint('button')"
        >
          Week
        </button>
      </l-button-group>
      <button
        type="button"
        class="l-button"
        data-variant="primary"
        :style="paint('button')"
      >
        Save
      </button>
    </template>

    <!-- Popover & menus: a panel with two rows, the first one hovered. -->
    <div
      v-else-if="preview === 'menu'"
      role="menu"
      aria-label="Actions"
      class="w-max"
      :style="[panelStyle, paint('panel')]"
    >
      <l-dropdown-item
        v-for="(item, i) in menuItems"
        :key="item.label"
        :style="[paint('rowHost'), i === 0 ? hoveredRow : null, i === 0 ? paint('row') : null]"
      >
        <l-icon
          slot="prefix"
          :name="item.icon"
          :style="paint('content')"
        />
        <span :style="[paint('content'), paint('label')]">{{ item.label }}</span>
      </l-dropdown-item>
    </div>

    <!-- Icons: the real elements that draw the token, stacked to fit a cell.
         The Touches caption names the ones left out. -->
    <div
      v-else-if="preview === 'icon-chevron-down' || preview === 'icon-clear'"
      class="flex flex-col items-center gap-2"
    >
      <l-select
        label="Country"
        class="w-36"
        :with-clear="preview === 'icon-clear' ? '' : null"
        :style="paint('picker')"
      >
        <datalist>
          <option
            value="fr"
            selected
          >
            France
          </option>
        </datalist>
      </l-select>
      <details
        v-if="preview === 'icon-chevron-down'"
        class="l-disclosure"
        data-marker="arrow"
        :style="paint('marker')"
      >
        <summary>Shipping</summary>
      </details>
    </div>

    <div
      v-else-if="preview === 'icon-chevron-right'"
      class="flex flex-col items-center gap-1"
    >
      <div :style="iconMenuStyle">
        <l-dropdown-item :style="paint('menuItem')"
          ><span :style="paint('menuLabel')">Share</span
          ><l-dropdown-item slot="submenu">Email</l-dropdown-item></l-dropdown-item
        >
      </div>
      <l-tree>
        <l-tree-item :style="paint('tree')">Vegetables<l-tree-item>Leek</l-tree-item></l-tree-item>
      </l-tree>
    </div>

    <div
      v-else-if="preview === 'icon-check'"
      :style="iconMenuStyle"
    >
      <l-dropdown-item
        type="checkbox"
        checked
        :style="paint('menuItem')"
        ><span :style="paint('menuLabel')">Show grid</span></l-dropdown-item
      >
    </div>

    <button
      v-else-if="preview === 'icon-close'"
      type="button"
      class="l-close"
      data-appearance="ring"
      aria-label="Close"
      :style="paint('close')"
    />

    <l-input-stepper v-else-if="preview === 'icon-plus' || preview === 'icon-minus'">
      <input
        type="number"
        value="2"
        aria-label="Quantity"
      />
    </l-input-stepper>

    <!-- Tooltip: the bubble and its arrow above an icon-only button. -->
    <div
      v-else-if="preview === 'tooltip'"
      class="flex flex-col items-center"
    >
      <div
        class="relative"
        :style="bubbleStyle"
      >
        Copy link
        <i
          class="absolute start-1/2 top-full size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
          :style="{ background: 'var(--l-tooltip-background-color)' }"
        />
      </div>
      <button
        type="button"
        class="l-button mt-2"
        data-size="sm"
        data-icon-only
        aria-label="Copy link"
      >
        <l-icon name="lucide:link" />
      </button>
    </div>
  </div>
</template>
