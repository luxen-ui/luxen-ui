<script setup>
import { computed, ref } from 'vue';
import { statusFill } from './color-token-spec.js';

/**
 * The status fills as a tone × tier grid. Fifteen Default / Touches rows would
 * only repeat that a fill paints a background; what a reader needs is the gap
 * between the three tiers, so each column shows the tier on the UI it is made
 * for: a callout on `soft`, a real `l-badge appearance="filled"` on `subtle`,
 * a real `l-badge appearance="accent"` on `strong`.
 *
 * Gets the page-filtered fill tokens from DesignTokens: a cell whose token is
 * filtered out is left empty, a tone with no cell left disappears.
 */
const props = defineProps({
  tokens: { type: Array, required: true },
});

const TONES = ['neutral', 'info', 'warning', 'danger', 'success'];
const TIERS = [
  { key: 'soft', use: 'Callouts, toasts' },
  { key: 'subtle', use: 'Badges, tags' },
  { key: 'strong', use: 'Solid badges' },
];
const COPY = {
  neutral: 'Draft',
  info: 'New',
  warning: 'Due',
  danger: 'Late',
  success: 'Paid',
};

const byKey = computed(() => {
  const map = {};
  for (const t of props.tokens) {
    const s = statusFill(t.name);
    if (s) map[`${s.tone}-${s.tier}`] = t;
  }
  return map;
});
const tones = computed(() =>
  TONES.filter((tone) => TIERS.some((tier) => byKey.value[`${tone}-${tier.key}`])),
);

/** Callout tinted like l-alert: tone text, a 25% tone edge, the soft fill. */
function calloutStyle(tone, token) {
  const text = `var(--l-color-text-${tone})`;
  return {
    background: `var(${token.name})`,
    color: text,
    borderColor: `color-mix(in oklab, ${text} 25%, transparent)`,
  };
}

const copied = ref(null);
let copyTimer;
function copy(name) {
  navigator.clipboard?.writeText(`var(${name})`);
  copied.value = name;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (copied.value = null), 1200);
}
</script>

<template>
  <div
    v-if="tones.length"
    class="mt-6 grid grid-cols-[auto_repeat(3,minmax(0,1fr))] overflow-hidden rounded-md border border-(--vp-c-divider)"
  >
    <!-- Header: tier name and what it is for. -->
    <div class="border-b border-(--vp-c-divider) bg-(--vp-c-bg-soft)" />
    <div
      v-for="tier in TIERS"
      :key="tier.key"
      class="border-b border-s border-(--vp-c-divider) bg-(--vp-c-bg-soft) px-3 py-2"
    >
      <div class="text-[0.6rem] font-bold tracking-wider text-(--vp-c-text-2) uppercase">
        {{ tier.key }}
      </div>
      <div class="text-xs text-(--vp-c-text-2)">{{ tier.use }}</div>
    </div>

    <template
      v-for="(tone, i) in tones"
      :key="tone"
    >
      <div
        class="flex items-center bg-(--vp-c-bg-soft) px-3 text-xs font-medium text-(--vp-c-text-2) capitalize"
        :class="{ 'border-t border-(--vp-c-divider)': i > 0 }"
      >
        {{ tone }}
      </div>
      <div
        v-for="tier in TIERS"
        :key="tier.key"
        class="flex min-w-0 flex-col items-center gap-1.5 border-s border-(--vp-c-divider) bg-(--vp-c-bg) px-2 py-3"
        :class="{ 'border-t': i > 0 }"
      >
        <template v-if="byKey[`${tone}-${tier.key}`]">
          <div
            data-viz="fill-matrix"
            inert
            class="flex h-7 items-center text-sm"
          >
            <span
              v-if="tier.key === 'soft'"
              class="rounded-md border px-2.5 py-1 text-xs font-medium"
              :style="calloutStyle(tone, byKey[`${tone}-${tier.key}`])"
              >{{ COPY[tone] }}</span
            >
            <l-badge
              v-else
              :variant="tone === 'neutral' ? null : tone"
              :appearance="tier.key === 'subtle' ? 'filled' : 'accent'"
              >{{ COPY[tone] }}</l-badge
            >
          </div>
          <button
            type="button"
            class="max-w-full cursor-pointer text-center font-mono [overflow-wrap:anywhere] text-[0.68rem] text-(--vp-c-text-2) hover:text-(--vp-c-brand-1)"
            :title="`Copy var(${byKey[`${tone}-${tier.key}`].name})`"
            @click="copy(byKey[`${tone}-${tier.key}`].name)"
          >
            {{ copied === byKey[`${tone}-${tier.key}`].name ? 'Copied' : `${tone}-${tier.key}` }}
          </button>
        </template>
      </div>
    </template>
  </div>
</template>
