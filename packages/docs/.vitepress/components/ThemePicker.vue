<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, withBase } from 'vitepress';
import {
  STORAGE_KEY,
  THEME_FONTS,
  UNTHEMED_PATH,
  fontHref,
  isTheme,
} from '../theme/themes/registry.js';

// Showcase themes live in theme/themes/*.css, keyed by `data-theme` on <html>.
// registry.js holds their behavior; this list holds what the menu shows.

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

const route = useRoute();
const router = useRouter();
const dropdown = ref();
const current = ref('default');

// The Design Tokens page shows each token at its default value, so no theme
// applies there and the menu is disabled.
const unthemed = computed(() => UNTHEMED_PATH.test(route.path));

function loadFonts(value) {
  const families = THEME_FONTS[value];
  if (!families) return;
  const href = fontHref(families);
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
}

function paint() {
  const root = document.documentElement;
  if (current.value === 'default' || unthemed.value) delete root.dataset.theme;
  else {
    loadFonts(current.value);
    root.dataset.theme = current.value;
  }
}

function apply(value) {
  current.value = value;
  try {
    if (value === 'default') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked (private mode, sandbox): the theme still applies for this visit.
  }
  paint();
}

// A saved value the registry no longer knows (a renamed or removed theme)
// falls back to the default and is cleared.
function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isTheme(saved)) return saved;
    if (saved !== null) localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: fall through to the default.
  }
  return 'default';
}

// Radio items keep their group to a single check on their own; only the
// initial one is set here. `checked` is set as a property, never bound in the
// template: Vue would render `checked="false"`, and a boolean attribute reads
// as true whatever its value.
function checkCurrent() {
  const items = dropdown.value?.querySelectorAll('l-dropdown-item[type="radio"]') ?? [];
  for (const item of items) if (item.value === current.value) item.checked = true;
}

function onSelect(event) {
  const value = event.item?.value;
  if (value === 'guide') router.go(withBase('/overview/theming'));
  else if (themes.some((theme) => theme.value === value)) apply(value);
}

watch(() => route.path, paint);

onMounted(async () => {
  current.value = readSaved();
  paint();
  await customElements.whenDefined('l-dropdown-item');
  checkCurrent();
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
        :disabled="unthemed"
        :title="
          unthemed ? 'This page shows token defaults, so showcase themes are off here' : undefined
        "
        class="flex h-[var(--vp-nav-height)] items-center gap-1.5 px-3 text-sm font-medium text-[var(--vp-c-text-1)] transition-colors not-disabled:hover:text-[var(--vp-c-brand-1)] disabled:cursor-not-allowed disabled:opacity-50"
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
        type="radio"
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
