<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { tokenQuery } from './token-filter.js';

/**
 * Sticky directory bar for the Design Tokens page: a filter field (narrows
 * every `<DesignTokens>` block through `tokenQuery`) and one tab per `##`
 * section, highlighted while it's in view. Sections with `###` sub-groups get
 * a dropdown listing them. The sections are read from the rendered headings,
 * so the bar follows the markdown — no list to keep in sync. A divider sits
 * between two tabs whose sections belong to different `[data-token-group]`
 * wrappers (semantic tokens, then component tokens).
 */

const bar = ref(null);
// Zero-height marker at the bar's in-flow position (the bar itself moves once stuck).
const sentinel = ref(null);
const sections = ref([]); // [{ id, label, group, subs: [{ id, label }] }]
const activeId = ref(null);
const activeSubId = ref(null);
const hidden = ref(new Set()); // section ids with no matching token
const matchCount = ref(0);
// Where the bar sticks: under VitePress's fixed nav, plus its sticky local nav
// (the mobile "Menu" bar) when that one is showing.
const stickyTop = ref(64);

function measureStickyTop() {
  const nav = document.querySelector('.VPNav');
  const local = document.querySelector('.VPLocalNav');
  let top = nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0;
  if (local && getComputedStyle(local).display !== 'none') top += local.offsetHeight;
  stickyTop.value = top;
}

/** Pill tab — brand-tinted while its section is in view. */
const TAB =
  'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap text-(--vp-c-text-2) transition-colors hover:bg-(--vp-c-default-soft) hover:text-(--vp-c-text-1) disabled:pointer-events-none disabled:opacity-40 data-active:bg-(--vp-c-brand-soft) data-active:text-(--vp-c-brand-1)';

/** Heading text without VitePress's permalink anchor. */
function headingText(h) {
  return [...h.childNodes]
    .filter((n) => !n.classList?.contains('header-anchor'))
    .map((n) => n.textContent)
    .join('')
    .trim();
}

function docRoot() {
  return bar.value?.closest('.vp-doc') ?? document;
}

function readSections() {
  const list = [];
  for (const h of docRoot().querySelectorAll('h2[id], h3[id]')) {
    const item = { id: h.id, label: headingText(h), el: h };
    if (h.tagName === 'H2') {
      const group = h.closest('[data-token-group]')?.dataset.tokenGroup ?? null;
      list.push({ ...item, group, subs: [] });
    } else list.at(-1)?.subs.push(item);
  }
  sections.value = list;
}

/** Bottom edge of the sticky bar — headings above it count as "passed". */
function barBottom() {
  return bar.value?.getBoundingClientRect().bottom ?? 0;
}

/** Where the bar's bottom sits once stuck — the line a heading lands under. */
function stuckBottom() {
  return stickyTop.value + (bar.value?.offsetHeight ?? 0);
}

function updateActive() {
  if (!bar.value) return;
  const line = barBottom() + 8;
  let section = null;
  let sub = null;
  for (const s of sections.value) {
    if (s.el.offsetParent === null) continue; // filtered out
    if (s.el.getBoundingClientRect().top > line) break;
    section = s;
    sub = null;
    for (const x of s.subs) {
      if (x.el.offsetParent === null) continue;
      if (x.el.getBoundingClientRect().top > line) break;
      sub = x;
    }
  }
  activeId.value = section?.id ?? null;
  activeSubId.value = sub?.id ?? null;
}

// Scroll-spy: the observed band runs from far above the viewport down to a
// line just under the stuck bar, so a heading is "in" exactly when it has
// scrolled past that line. Crossing the line flips its state however far the
// page jumps (an anchor, a filter), and the observer only calls back then, so
// the layout reads in updateActive() happen per crossing, not per scroll event.
let spy = null;
function observeHeadings() {
  spy?.disconnect();
  const line = stuckBottom() + 8;
  spy = new IntersectionObserver(updateActive, {
    rootMargin: `100000px 0px -${Math.max(0, window.innerHeight - line)}px 0px`,
  });
  for (const s of sections.value) for (const x of [s, ...s.subs]) spy.observe(x.el);
}

function go(id, behavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - stuckBottom() - 16;
  window.scrollTo({ top, behavior });
  history.replaceState(history.state, '', `#${id}`);
}

function onDropdownSelect(event) {
  const id = event.item?.value;
  if (id) go(id);
}

/** After a filter change: recount rows, flag empty sections, keep the bar in place. */
async function refresh() {
  await nextTick();
  // The page may have been left while waiting (the filter is reset on unmount).
  if (!bar.value) return;
  const root = docRoot();
  matchCount.value = root.querySelectorAll('.tokens__row').length;
  hidden.value = new Set(
    sections.value
      .flatMap((s) => [s, ...s.subs])
      .filter((x) => x.el.offsetParent === null)
      .map((x) => x.id),
  );
  // Filtering shrinks the page: if the bar is stuck, bring the results back to its top.
  const stuck = bar.value.getBoundingClientRect().top <= stickyTop.value;
  if (stuck && tokenQuery.value) {
    const anchor = sentinel.value.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: anchor - stickyTop.value });
  }
  updateActive();
}

watch(tokenQuery, refresh);

function onKeydown(event) {
  if (event.key === 'Escape') tokenQuery.value = '';
}

function onResize() {
  measureStickyTop();
  observeHeadings();
  updateActive();
}

/**
 * Deep link (#toggles…): the live previews keep resizing the page after load
 * (custom elements upgrade, fonts load), and VitePress runs its own hash scroll
 * without knowing about this bar. Land on the heading, then land again whenever
 * the page resizes or something other than the reader scrolls it. It stops as
 * soon as the reader takes over (wheel, touch, key, pointer), or once the page
 * has been still for a second — so a scroll nobody announces (a screen reader's
 * virtual cursor) is never fought for long. Re-landing converges: once in
 * place, our own scrollTo moves nothing and fires no scroll.
 */
const SETTLED_AFTER_MS = 1000;
let stopSettling = null;
function settleOnHash(id) {
  let quiet = 0;
  const land = () => {
    go(id, 'instant');
    clearTimeout(quiet);
    quiet = setTimeout(() => stopSettling?.(), SETTLED_AFTER_MS);
  };
  land();
  const resizes = new ResizeObserver(land);
  resizes.observe(docRoot());
  window.addEventListener('scroll', land, { passive: true });
  const takeover = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  stopSettling = () => {
    clearTimeout(quiet);
    resizes.disconnect();
    window.removeEventListener('scroll', land);
    for (const type of takeover) window.removeEventListener(type, stopSettling);
    stopSettling = null;
  };
  for (const type of takeover) window.addEventListener(type, stopSettling, { passive: true });
}

onMounted(() => {
  measureStickyTop();
  readSections();
  refresh();
  observeHeadings();
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && sections.value.some((s) => s.id === hash || s.subs.some((x) => x.id === hash))) {
    settleOnHash(hash);
  }
  window.addEventListener('resize', onResize, { passive: true });
});

onBeforeUnmount(() => {
  spy?.disconnect();
  stopSettling?.();
  window.removeEventListener('resize', onResize);
  // The page is left: don't carry the filter over to the next visit.
  tokenQuery.value = '';
});
</script>

<!-- Fragment root: the bar must be a direct child of the page content, or
     `position: sticky` stays confined to a wrapper of its own height. -->
<template>
  <div ref="sentinel" />
  <div
    ref="bar"
    class="sticky z-10 -mx-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-(--vp-c-divider) bg-(--vp-c-bg) px-2 py-3"
    :style="{ top: `${stickyTop}px` }"
  >
    <l-input-group class="w-full sm:w-48">
      <l-icon name="lucide:search" />
      <input
        v-model="tokenQuery"
        type="search"
        placeholder="Filter tokens…"
        aria-label="Filter tokens by name"
        @keydown="onKeydown"
      />
    </l-input-group>

    <nav
      aria-label="Token categories"
      class="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none]"
    >
      <template
        v-for="(s, i) in sections"
        :key="s.id"
      >
        <span
          v-if="i > 0 && s.group !== sections[i - 1].group"
          aria-hidden="true"
          class="mx-1 w-px shrink-0 self-stretch bg-(--vp-c-divider)"
        />
        <l-dropdown
          v-if="s.subs.length"
          @select="onDropdownSelect"
        >
          <button
            slot="trigger"
            type="button"
            :class="TAB"
            :data-active="activeId === s.id || null"
            :aria-current="activeId === s.id ? 'location' : null"
            :disabled="hidden.has(s.id)"
          >
            {{ s.label }}
            <l-icon
              name="lucide:chevron-down"
              class="text-xs opacity-60"
            />
          </button>
          <l-dropdown-item
            v-for="x in s.subs"
            :key="x.id"
            :value="x.id"
            :disabled="hidden.has(x.id) || null"
          >
            <span :class="activeSubId === x.id ? 'font-semibold text-(--vp-c-brand-1)' : ''">{{
              x.label
            }}</span>
          </l-dropdown-item>
        </l-dropdown>
        <button
          v-else
          type="button"
          :class="TAB"
          :data-active="activeId === s.id || null"
          :aria-current="activeId === s.id ? 'location' : null"
          :disabled="hidden.has(s.id)"
          @click="go(s.id)"
        >
          {{ s.label }}
        </button>
      </template>
    </nav>
  </div>

  <p
    v-if="tokenQuery && matchCount === 0"
    class="text-(--vp-c-text-2)"
  >
    No token matches “{{ tokenQuery }}”.
  </p>
</template>
