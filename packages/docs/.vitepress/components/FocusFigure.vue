<script setup>
/**
 * Illustrations for the Focus guide (`foundations/focus.md`), one per `name`.
 * Focus can't be triggered on a static figure, so each control is `inert` and
 * its `:focus-visible` look is pinned on with the same declarations the
 * elements use — the figures follow the tokens, light/dark included.
 */
defineProps({
  name: { type: String, required: true },
});

/** Outer ring: buttons, toggles, links… */
const ring = {
  outline: 'var(--l-focus-ring-width) solid var(--l-focus-ring-color)',
  outlineOffset: 'var(--l-focus-ring-offset)',
};

/** Inner ring: items an `overflow: hidden` ancestor would clip. */
const innerRing = {
  outline: 'var(--l-focus-ring-width) solid var(--l-focus-ring-color)',
  outlineOffset: 'calc(var(--l-focus-ring-width) * -1)',
  borderRadius: 'var(--l-radius-sm)',
};

/** Focused text field: recolored border, inward stroke, soft halo. */
const field = {
  borderColor: 'var(--l-focus-ring-color)',
  outline: 'var(--l-form-control-focus-border-width) solid var(--l-focus-ring-color)',
  outlineOffset: 'calc(var(--l-form-control-focus-border-width) * -1)',
  boxShadow:
    '0 0 0 var(--l-form-control-focus-halo-width) color-mix(in oklab, var(--l-focus-ring-color) 22%, transparent)',
};

const halo = { background: 'color-mix(in oklab, var(--l-focus-ring-color) 22%, transparent)' };

/** A ring drawn with box-shadow alone — what forced colors drops. */
const shadowRing = {
  boxShadow: '0 0 0 2px var(--l-color-surface), 0 0 0 4px var(--l-focus-ring-color)',
};

/** Ring color on a surface, with its contrast against that surface. */
const SURFACES = [
  { label: 'White', ratio: '4.3:1', pass: true, style: 'color-scheme: light; background: #fff' },
  {
    label: 'Dark surface',
    ratio: '4.1:1',
    pass: true,
    style: 'color-scheme: dark; background: var(--l-color-surface)',
  },
  {
    label: 'Navy band',
    ratio: '2.4:1',
    pass: false,
    style: 'color-scheme: dark; background: #1e3a8a',
  },
  {
    label: 'Navy band, ring scoped to white',
    ratio: '10.4:1',
    pass: true,
    style: 'color-scheme: dark; background: #1e3a8a; --l-focus-ring-color: #fff',
  },
];

const PANEL = 'flex min-w-0 flex-col gap-3 p-4';
const TITLE = 'text-xs font-semibold tracking-wide text-(--vp-c-text-2) uppercase';
const STAGE =
  'flex min-h-20 items-center justify-center gap-4 rounded-md bg-(--l-color-surface) p-4';
const BAND = 'grid place-items-center self-stretch';
/** Magnified cross-section: label row, bracket row, band row (+ bracket and
 * label rows under it for a part drawn over another one). */
const REDLINE = 'grid grid-rows-[auto_8px_3rem] items-end justify-center text-xs';
const LABEL =
  'flex flex-col items-center justify-self-center whitespace-nowrap pb-1 font-mono text-[11px] leading-tight text-(--vp-c-text-2) [&>b]:font-semibold [&>b]:text-(--vp-c-text-1)';
const BRACKET = 'h-2 self-stretch border-(--vp-c-text-2) border-[1.5px]';
const BRACKET_TOP = `${BRACKET} mx-px border-b-0 rounded-t-[2px]`;
const BRACKET_BOTTOM = `${BRACKET} mx-px mt-1 border-t-0 rounded-b-[2px]`;
const VERDICT = 'inline-flex items-center gap-1 text-xs font-semibold';
</script>

<template>
  <figure
    class="vp-raw my-6 overflow-hidden rounded-lg border border-(--vp-c-divider) text-sm text-(--vp-c-text-1)"
  >
    <!-- ANATOMY — each shape at real size, then magnified in cross-section -->
    <div
      v-if="name === 'anatomy'"
      inert
      class="grid divide-(--vp-c-divider) max-sm:divide-y sm:grid-cols-2 sm:divide-x"
    >
      <div :class="PANEL">
        <p :class="TITLE">Ring</p>
        <div :class="STAGE">
          <button
            type="button"
            class="l-button"
            :style="ring"
          >
            Save
          </button>
        </div>
        <!-- Right edge of the button, magnified: 1 CSS px = 20px. -->
        <div
          :class="REDLINE"
          class="grid-cols-[1fr_40px_40px_1fr]"
        >
          <span
            :class="LABEL"
            class="row-start-1 col-2"
            ><b>offset</b>2px</span
          >
          <span
            :class="LABEL"
            class="row-start-1 col-3"
            ><b>width</b>2px</span
          >
          <span
            :class="BRACKET_TOP"
            class="row-start-2 col-2"
          />
          <span
            :class="BRACKET_TOP"
            class="row-start-2 col-3"
          />
          <span
            :class="BAND"
            class="row-start-3 col-1 rounded-s-md bg-(--l-color-bg-fill-brand) text-(--l-color-text-on-fill-brand)"
            >button</span
          >
          <span
            :class="BAND"
            class="row-start-3 col-2 bg-(--l-color-surface)"
          />
          <span
            :class="BAND"
            class="row-start-3 col-3 bg-(--l-focus-ring-color)"
          />
          <span
            :class="BAND"
            class="row-start-3 col-4 rounded-e-md bg-(--l-color-surface) text-(--vp-c-text-2)"
            >page</span
          >
        </div>
      </div>

      <div :class="PANEL">
        <p :class="TITLE">Field</p>
        <div :class="STAGE">
          <input
            class="l-input w-full max-w-48"
            value="Jane Cooper"
            aria-label="Full name"
            :style="field"
          />
        </div>
        <!-- Left edge of the field, magnified: 1 CSS px = 20px. The stroke is
             drawn inward from the outer edge, over the border. -->
        <div
          :class="REDLINE"
          class="grid-cols-[1fr_60px_20px_20px_1fr]"
        >
          <span
            :class="LABEL"
            class="row-start-1 col-2"
            ><b>halo</b>3px</span
          >
          <span
            :class="LABEL"
            class="row-start-1 col-3"
            ><b>border</b>1px</span
          >
          <span
            :class="BRACKET_TOP"
            class="row-start-2 col-2"
          />
          <span
            :class="BRACKET_TOP"
            class="row-start-2 col-3"
          />
          <span
            :class="BAND"
            class="row-start-3 col-1 rounded-s-md bg-(--l-color-surface) text-(--vp-c-text-2)"
            >page</span
          >
          <span
            :class="BAND"
            class="row-start-3 col-2 bg-(--l-color-surface)"
            ><span
              class="size-full"
              :style="halo"
          /></span>
          <span
            :class="BAND"
            class="row-start-3 col-3 bg-(--l-focus-ring-color)"
          />
          <span
            :class="BAND"
            class="row-start-3 col-span-2 col-start-4 rounded-e-md bg-(--l-form-control-background-color) text-(--vp-c-text-2)"
            >field</span
          >
          <span
            :class="BAND"
            class="row-start-3 col-span-2 col-start-3 bg-(--l-focus-ring-color)"
          />
          <span
            :class="BRACKET_BOTTOM"
            class="row-start-4 col-span-2 col-start-3"
          />
          <span
            :class="LABEL"
            class="row-start-5 col-span-2 col-start-3"
            ><b>stroke</b>2px</span
          >
        </div>
      </div>
    </div>

    <!-- SHAPES — where each shape is used -->
    <div
      v-else-if="name === 'shapes'"
      inert
      class="grid divide-(--vp-c-divider) max-sm:divide-y sm:grid-cols-3 sm:divide-x"
    >
      <div :class="PANEL">
        <p :class="TITLE">Outside</p>
        <div :class="STAGE">
          <button
            type="button"
            class="l-button"
            :style="ring"
          >
            Save
          </button>
          <input
            type="checkbox"
            class="l-checkbox"
            aria-label="Checkbox"
            checked
            :style="ring"
          />
          <input
            type="checkbox"
            role="switch"
            class="l-switch"
            aria-label="Switch"
            :style="ring"
          />
        </div>
        <p class="text-(--vp-c-text-2)">Standalone controls. The gap keeps the ring legible.</p>
      </div>

      <div :class="PANEL">
        <p :class="TITLE">Inside</p>
        <div :class="STAGE">
          <l-segmented-control
            label="View"
            value="board"
          >
            <button value="list">List</button>
            <button
              value="board"
              :style="innerRing"
            >
              Board
            </button>
          </l-segmented-control>
        </div>
        <p class="text-(--vp-c-text-2)">
          Items set edge to edge. The ring never overlaps a neighbor or the panel edge.
        </p>
      </div>

      <div :class="PANEL">
        <p :class="TITLE">Field</p>
        <div :class="STAGE">
          <input
            class="l-input w-full"
            value="Jane Cooper"
            aria-label="Full name"
            :style="field"
          />
        </div>
        <p class="text-(--vp-c-text-2)">
          Text fields. Already a box: the border changes, no second box.
        </p>
      </div>
    </div>

    <!-- CONTRAST — the same ring on four surfaces -->
    <div
      v-else-if="name === 'contrast'"
      inert
      class="grid grid-cols-2 gap-px bg-(--vp-c-divider) sm:grid-cols-4"
    >
      <div
        v-for="s in SURFACES"
        :key="s.label"
        class="flex flex-col bg-(--vp-c-bg)"
      >
        <div
          class="grid min-h-24 place-items-center p-4"
          :style="s.style"
        >
          <button
            type="button"
            class="l-button"
            data-variant="primary"
            :style="ring"
          >
            Save
          </button>
        </div>
        <div class="flex flex-col gap-0.5 p-3 text-xs">
          <span class="text-(--vp-c-text-2)">{{ s.label }}</span>
          <span :class="[VERDICT, s.pass ? 'text-(--vp-c-green-1)' : 'text-(--vp-c-red-1)']"
            >{{ s.pass ? '✓' : '✗' }} {{ s.ratio }}</span
          >
        </div>
      </div>
    </div>

    <!-- OBSCURED — a sticky header over the focused item -->
    <div
      v-else-if="name === 'obscured'"
      inert
      class="grid divide-(--vp-c-divider) max-sm:divide-y sm:grid-cols-2 sm:divide-x"
    >
      <div
        v-for="fixed in [false, true]"
        :key="String(fixed)"
        :class="PANEL"
      >
        <p :class="[VERDICT, fixed ? 'text-(--vp-c-green-1)' : 'text-(--vp-c-red-1)']">
          {{ fixed ? '✓ With scroll-padding' : '✗ Without' }}
        </p>
        <div
          class="relative h-40 overflow-hidden rounded-md border border-(--vp-c-divider) bg-(--l-color-surface)"
        >
          <div
            class="absolute inset-x-0 top-0 z-1 flex h-10 items-center border-b border-(--vp-c-divider) bg-(--vp-c-bg-soft) px-3 text-xs font-semibold"
          >
            Sticky header
          </div>
          <div
            v-if="fixed"
            class="absolute inset-x-0 top-10 flex h-3 items-center justify-center border-b border-dashed border-(--vp-c-text-3) text-[10px] leading-none text-(--vp-c-text-3)"
          />
          <ul
            class="absolute inset-x-4 flex flex-col gap-2 text-xs"
            :class="fixed ? 'top-16' : 'top-7'"
          >
            <li>
              <span
                class="inline-block rounded-sm px-1 py-0.5 underline"
                :style="ring"
                >Focused link</span
              >
            </li>
            <li
              v-for="n in 3"
              :key="n"
              class="px-1 text-(--vp-c-text-2) underline"
            >
              Link
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- FORCED COLORS — box-shadow is dropped, outline is repainted -->
    <div
      v-else-if="name === 'forced-colors'"
      inert
      class="grid divide-(--vp-c-divider) max-sm:divide-y sm:grid-cols-2 sm:divide-x"
    >
      <div
        v-for="outlined in [false, true]"
        :key="String(outlined)"
        :class="PANEL"
      >
        <p :class="TITLE">
          <code class="normal-case">{{ outlined ? 'outline' : 'box-shadow' }}</code>
        </p>
        <div class="grid grid-cols-2 gap-2">
          <div :class="STAGE">
            <button
              type="button"
              class="l-button"
              :style="outlined ? ring : shadowRing"
            >
              Save
            </button>
          </div>
          <div
            :class="STAGE"
            class="bg-black!"
          >
            <span
              class="inline-flex h-8 items-center rounded-md border border-white bg-black px-3 text-sm font-medium text-white"
              :style="outlined ? 'outline: 2px solid #1aebff; outline-offset: 2px' : ''"
              >Save</span
            >
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs text-(--vp-c-text-2)">
          <span>Default</span>
          <span :class="[VERDICT, outlined ? 'text-(--vp-c-green-1)' : 'text-(--vp-c-red-1)']">{{
            outlined ? '✓ Forced colors' : '✗ Forced colors'
          }}</span>
        </div>
      </div>
    </div>

    <figcaption
      class="border-t border-(--vp-c-divider) bg-(--vp-c-bg-soft) px-4 py-2 text-[13px] leading-normal text-(--vp-c-text-2)"
    >
      <slot />
    </figcaption>
  </figure>
</template>
