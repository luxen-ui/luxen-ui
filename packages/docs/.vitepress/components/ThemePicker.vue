<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, withBase } from 'vitepress';

// Showcase themes live in theme/themes/*.css, keyed by `data-theme` on <html>.
// The head script in config.js re-applies the saved one before first paint.
const STORAGE_KEY = 'luxen-docs-theme';

const themes = [
  {
    value: 'default',
    name: 'Default',
    label: '[:root:not([data-theme])_&]:inline',
    swatch: ['bg-[#111827]', 'bg-[#e5e7eb]', 'bg-white'],
  },
  {
    value: 'brutalist',
    name: 'Brutalist',
    label: '[:root[data-theme=brutalist]_&]:inline',
    swatch: ['bg-[#ffe14d]', 'bg-[#0a0a0a]', 'bg-[#fffdf3]'],
  },
  {
    value: 'coral',
    name: 'Coral',
    label: '[:root[data-theme=coral]_&]:inline',
    note: 'Inspired by Airbnb',
    swatch: ['bg-[#e31c5f]', 'bg-[#222222]', 'bg-[#f7f7f7]'],
  },
  {
    value: 'midnight',
    name: 'Midnight',
    label: '[:root[data-theme=midnight]_&]:inline',
    note: 'Inspired by Linear',
    swatch: ['bg-[#5e6ad2]', 'bg-[#010102]', 'bg-[#f7f8f8]'],
  },
  {
    value: 'editorial',
    name: 'Editorial',
    label: '[:root[data-theme=editorial]_&]:inline',
    note: 'Inspired by Oura',
    swatch: ['bg-[#2a72de]', 'bg-[#4a4741]', 'bg-[#f7f1e8]'],
  },
];

const router = useRouter();
const dropdown = ref();
const current = ref('default');

function apply(value) {
  current.value = value;
  const root = document.documentElement;
  if (value === 'default') delete root.dataset.theme;
  else root.dataset.theme = value;
  try {
    if (value === 'default') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked (private mode, sandbox): the theme still applies for this visit.
  }
  syncChecks();
}

// Checkbox items toggle themselves on click; a theme picker is single-choice,
// so the checks are re-derived from `current` after every selection — which
// also re-checks the active row when a visitor clicks it a second time.
// `checked` is set as a property, never bound in the template: Vue would
// render `checked="false"`, and a boolean attribute reads as true whatever
// its value.
function syncChecks() {
  for (const item of dropdown.value?.querySelectorAll('l-dropdown-item[type="checkbox"]') ?? []) {
    item.checked = item.value === current.value;
  }
}

function onSelect(event) {
  const value = event.item?.value;
  if (value === 'guide') router.go(withBase('/overview/theming'));
  else if (themes.some((theme) => theme.value === value)) apply(value);
}

onMounted(async () => {
  current.value = document.documentElement.dataset.theme || 'default';
  await customElements.whenDefined('l-dropdown-item');
  syncChecks();
});
</script>

<template>
  <!-- `order-1` and the `before:` divider: see the `.VPNavBar .content-body`
       rule in tailwind.css, which places this between the version menu and the
       appearance switch. -->
  <div
    class="order-1 flex items-center before:hidden before:h-6 before:w-px before:bg-[var(--vp-c-divider)] before:content-[''] md:before:mx-2 md:before:block"
  >
    <!-- Before the element upgrades, Luxen shows the trigger alone and hides
         the menu items, so nothing flashes and the nav doesn't shift. -->
    <l-dropdown
      ref="dropdown"
      placement="bottom-end"
      @select="onSelect"
    >
      <button
        slot="trigger"
        type="button"
        class="flex h-[var(--vp-nav-height)] items-center gap-1.5 px-3 text-sm font-medium text-[var(--vp-c-text-1)] transition-colors hover:text-[var(--vp-c-brand-1)]"
      >
        <l-icon
          name="lucide:palette"
          class="text-lg md:text-base"
        ></l-icon>
        <!-- One name per theme, picked by CSS from <html data-theme>, which the
             head script sets before first paint: the SSR markup can't know the
             saved theme, so a Vue-rendered name would flash "Default" first. -->
        <span class="sr-only md:not-sr-only">
          Theme:
          <span
            v-for="theme in themes"
            :key="theme.value"
            class="hidden text-[var(--vp-c-text-2)]"
            :class="theme.label"
            >{{ theme.name }}</span
          >
        </span>
        <l-icon
          name="lucide:chevron-down"
          class="hidden text-sm text-[var(--vp-c-text-3)] md:block"
        ></l-icon>
      </button>

      <l-dropdown-label>Showcase theme</l-dropdown-label>
      <l-dropdown-item
        v-for="theme in themes"
        :key="theme.value"
        type="checkbox"
        check-placement="end"
        :value="theme.value"
      >
        <span
          slot="prefix"
          class="flex -space-x-1"
          aria-hidden="true"
        >
          <span
            v-for="color in theme.swatch"
            :key="color"
            class="size-3 rounded-full ring-1 ring-black/15 dark:ring-white/30"
            :class="color"
          ></span>
        </span>
        {{ theme.name }}
        <span
          v-if="theme.note"
          class="ml-1 text-xs text-[var(--l-color-text-tertiary)]"
          >{{ theme.note }}</span
        >
      </l-dropdown-item>
      <l-divider></l-divider>
      <l-dropdown-item value="guide">
        <l-icon
          slot="prefix"
          name="lucide:book-open"
        ></l-icon>
        How theming works
      </l-dropdown-item>
    </l-dropdown>
  </div>
</template>
