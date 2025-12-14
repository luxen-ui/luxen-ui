<script setup>
defineProps({
  vertical: Boolean,
  inverted: Boolean,
  light: Boolean,
  dark: Boolean,
  html: String,
});
</script>

<template>
  <div
    class="vp-raw component-wrapper bg-surface-sunken"
    :class="[
      {
        'bg-surface-sunken--inverted': inverted,
        'bg-surface-sunken--light': light,
        'flex flex-wrap items-center gap-2': !vertical,
      },
    ]"
    :style="dark ? 'color-scheme: dark' : ''"
  >
    <div
      v-if="html"
      class="contents"
      v-html="html"
    />
    <slot v-else />
  </div>
</template>

<style>
.bg-surface-sunken {
  --surface-background-color: light-dark(white, #0d1117);
  --surface-sunken: light-dark(#f7f8f9, #161b22);

  background-color: var(--surface-background-color);
  background-image:
    linear-gradient(45deg, var(--surface-sunken) 25%, transparent 25%),
    linear-gradient(135deg, var(--surface-sunken) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--surface-sunken) 75%),
    linear-gradient(135deg, transparent 75%, var(--surface-sunken) 75%);
  background-position:
    0 0,
    10px 0,
    10px -10px,
    0 10px;
  background-size: 20px 20px;
  border-block-end: 1px solid light-dark(#091e4224, #30363d);
  border-radius: 3px 3px 0 0;
  color: light-dark(#172b4d, #e6edf3);
  padding-block: 24px;
  padding-inline: 12px;
}

.bg-surface-sunken--light {
  --surface-background-color: white;
  --surface-sunken: #f9fcff;
}

.bg-surface-sunken--inverted {
  --surface-background-color: var(--c-color-bg-primary-emphasis);
  --surface-sunken: var(--c-color-bg-primary-emphasis);
}

.bg-surface-sunken + .vp-code-group,
.bg-surface-sunken + details {
  margin-top: 0 !important;
}

.bg-surface-sunken + .custom-block {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
