<script setup>
import { computed } from 'vue';
import tokensJson from '@luxen-ui/design-tokens/json';
import { COLOR_TOKEN_SPEC } from './color-token-spec.js';

/**
 * Illustrates one semantic color token. Same contract as ComponentTokenPreview:
 * in the "Touches" cell the token is set on the wrapper to the spec's
 * highlight, and inherits into the illustration.
 *
 * Inheriting is not enough on its own: the component tokens that alias a
 * semantic one (`--l-form-control-border-color: var(--l-color-border)`, …)
 * are declared on `:root`, so their `var()` was already resolved there and
 * would keep the old color. Every token that reads this one, directly or
 * through another alias, is re-declared on the wrapper with its own value, so
 * it re-resolves against the highlight — as it would for a consumer who
 * overrides the token at `:root`.
 */
const props = defineProps({
  token: { type: Object, required: true },
  highlight: { type: Boolean, default: false },
});

const spec = computed(() => COLOR_TOKEN_SPEC[props.token.name]);
const preview = computed(() => spec.value?.preview);

/** Tokens whose value reads `name`, followed through aliases of aliases. */
function dependents(name) {
  const found = new Map();
  const queue = [name];
  while (queue.length) {
    const ref = new RegExp(`var\\(${queue.shift()}[,)]`);
    for (const t of tokensJson) {
      if (!found.has(t.name) && typeof t.value === 'string' && ref.test(t.value)) {
        found.set(t.name, t.value);
        queue.push(t.name);
      }
    }
  }
  return Object.fromEntries(found);
}

const rootStyle = computed(() => ({
  ...(props.highlight
    ? { ...dependents(props.token.name), [props.token.name]: spec.value.highlight }
    : null),
  // Reset the parent cell's display typography (sized for "Aa" swatches).
  fontSize: 'var(--l-text-sm)',
  fontWeight: 'normal',
  lineHeight: 'normal',
}));

/** Status tone of a `--l-color-text-<tone>` token. */
const tone = computed(() => props.token.path[2]);
const STATUS_COPY = {
  neutral: ['Note', 'Draft'],
  info: ['Update', 'New'],
  warning: ['Expiring', 'Due'],
  danger: ['Failed', 'Late'],
  success: ['Saved', 'Paid'],
};

/** Copies the l-dropdown panel (menu-panel.css) — l-dropdown renders its own in the top layer, which can't sit in a cell. */
const panelStyle = {
  padding: 'var(--l-popover-padding)',
  border: '1px solid var(--l-color-border-overlay)',
  borderRadius: 'var(--l-popover-border-radius)',
  background: 'var(--l-color-surface-overlay)',
  color: 'var(--l-color-text-primary)',
  boxShadow: 'var(--l-popover-shadow)',
};

/** Hover and selection can't be triggered on an inert preview — their fills are pinned on. */
const menuRows = [
  { icon: 'lucide:pencil', label: 'Edit', fill: 'var(--l-color-bg-state-hover)' },
  {
    icon: 'lucide:copy',
    label: 'Duplicate',
    fill: 'var(--l-color-bg-state-selected)',
    check: true,
  },
  { divider: true },
  { icon: 'lucide:archive', label: 'Archive' },
];

/** Stops the skeleton wave halfway (its keyframes run -100% → 100% over 2s): the sheen sits mid-shape. */
const frozenWave = 'after:[animation-delay:-1s] after:[animation-play-state:paused]';

/** Pins the primary button in its hover / pressed fill (button-core.css reads these from `--background-color`). */
const primaryStyle = computed(() => {
  if (preview.value === 'buttons-hover')
    return { '--background-color': 'var(--l-color-bg-fill-brand-hover)' };
  if (preview.value === 'buttons-active')
    return { '--background-color': 'var(--l-color-bg-fill-brand-active)' };
  return null;
});
</script>

<template>
  <div
    inert
    class="flex size-full items-center justify-center gap-3 px-3 text-start"
    :style="rootStyle"
  >
    <!-- Text hierarchy: a name, its role, a timestamp. -->
    <div
      v-if="preview === 'card'"
      class="leading-snug"
    >
      <div class="font-medium text-(--l-color-text-primary)">Thelma Lavigne</div>
      <div class="text-(--l-color-text-secondary)">Product designer</div>
      <div class="text-xs text-(--l-color-text-tertiary)">Edited 2 min ago</div>
    </div>

    <!-- Status text: a real l-alert (icon, title, edge) and a real l-badge. -->
    <template v-else-if="preview === 'status'">
      <l-alert
        :variant="tone === 'neutral' ? null : tone"
        class="min-w-0 [--gap:0.5rem] [--padding:0.375rem_0.625rem]"
      >
        <!-- A div: VitePress's unlayered `.vp-doc p` margin outranks the alert's layered reset. -->
        <div class="l-alert-title">{{ STATUS_COPY[tone][0] }}</div>
      </l-alert>
      <l-badge :variant="tone === 'neutral' ? null : tone">{{ STATUS_COPY[tone][1] }}</l-badge>
    </template>

    <!-- Disabled: a field drawn from the three disabled semantics. -->
    <div
      v-else-if="preview === 'disabled'"
      class="flex h-(--l-form-control-height) w-full items-center gap-2 rounded-(--l-form-control-border-radius) border border-(--l-color-border-disabled) bg-(--l-color-bg-disabled) px-(--l-form-control-padding-inline) text-(--l-color-text-disabled)"
    >
      <l-icon name="lucide:lock" />
      Read-only
    </div>

    <!-- Buttons: a secondary and a primary .l-button. -->
    <template v-else-if="preview?.startsWith('buttons')">
      <button
        type="button"
        class="l-button"
      >
        Cancel
      </button>
      <button
        type="button"
        class="l-button"
        data-variant="primary"
        :style="primaryStyle"
      >
        Save
      </button>
    </template>

    <!-- Page: a framed page area with a real field on it. -->
    <div
      v-else-if="preview === 'page'"
      class="flex w-full items-center rounded-md border border-(--vp-c-divider) bg-(--l-color-surface) p-2.5"
    >
      <input
        class="l-input"
        value="Thelma Lavigne"
        aria-label="Name"
      />
    </div>

    <!-- Menu: a panel with a hovered row, a selected row and a separator. -->
    <div
      v-else-if="preview === 'menu'"
      role="menu"
      aria-label="Actions"
      class="w-40"
      :style="panelStyle"
    >
      <template
        v-for="row in menuRows"
        :key="row.label ?? 'divider'"
      >
        <!-- Copies the menu-panel.css separator: bleeds through the panel padding. -->
        <div
          v-if="row.divider"
          class="-mx-(--l-popover-padding) my-(--l-popover-padding) h-px bg-(--l-color-divider)"
        />
        <div
          v-else
          class="flex items-center gap-(--l-menu-item-gap) rounded-(--l-menu-item-border-radius) px-(--l-menu-item-padding-inline) py-1"
          :style="{ background: row.fill }"
        >
          <l-icon :name="row.icon" />
          <span class="flex-1">{{ row.label }}</span>
          <l-icon
            v-if="row.check"
            name="lucide:check"
          />
        </div>
      </template>
    </div>

    <!-- Border: a real field next to a real secondary button. -->
    <template v-else-if="preview === 'fields'">
      <input
        class="l-input min-w-0 flex-1"
        value="Thelma Lavigne"
        aria-label="Name"
      />
      <button
        type="button"
        class="l-button"
      >
        Save
      </button>
    </template>

    <!-- Interactive border: a real .l-kbd shortcut. -->
    <kbd v-else-if="preview === 'kbd'"><kbd class="l-kbd">⌘</kbd>+<kbd class="l-kbd">K</kbd></kbd>

    <!-- Loading: a real l-skeleton, wave animation (it reads both tokens),
         frozen mid-sweep so the sheen shows in a still cell. -->
    <div
      v-else-if="preview === 'skeleton'"
      class="flex w-full items-center gap-2.5"
    >
      <l-skeleton
        shape="circle"
        animation="wave"
        :class="['shrink-0 [--height:2.25rem] [--width:2.25rem]', frozenWave]"
      />
      <div class="grid flex-1 gap-1.5">
        <l-skeleton
          animation="wave"
          :class="['[--height:0.625rem]', frozenWave]"
        />
        <l-skeleton
          animation="wave"
          :class="['[--height:0.625rem] [--width:60%]', frozenWave]"
        />
      </div>
    </div>

    <!-- Backdrop: a page of lines, dimmed by the token, under a small dialog. -->
    <div
      v-else-if="preview === 'backdrop'"
      class="relative size-full overflow-hidden"
    >
      <div class="absolute inset-0 grid content-start gap-1.5 bg-(--l-color-surface) p-2.5">
        <span class="h-1.5 w-3/4 rounded-full bg-(--l-color-text-tertiary)" />
        <span class="h-1.5 w-1/2 rounded-full bg-(--l-color-text-tertiary)" />
        <span class="h-1.5 w-2/3 rounded-full bg-(--l-color-text-tertiary)" />
        <span class="h-1.5 w-1/3 rounded-full bg-(--l-color-text-tertiary)" />
      </div>
      <div
        class="absolute inset-0"
        :style="{ background: `var(${token.name})` }"
      />
      <div
        class="absolute inset-x-[22%] inset-y-[22%] grid content-center gap-1.5 rounded-md bg-(--l-color-surface-overlay) px-3 shadow-md"
      >
        <span class="h-1.5 w-2/3 rounded-full bg-(--l-color-text-primary)" />
        <span class="h-1.5 w-full rounded-full bg-(--l-color-text-tertiary)" />
      </div>
    </div>
  </div>
</template>
