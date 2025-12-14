<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  css: { type: String, required: true },
  html: { type: String, required: true },
});

const tokens = ref('');

onMounted(() => {
  const root = getComputedStyle(document.documentElement);
  const vars = [
    '--l-color-border',
    '--l-color-border-disabled',
    '--l-color-surface',
    '--l-color-text-primary',
    '--l-color-text-disabled',
    '--l-color-bg-fill-neutral-soft',
    '--l-color-bg-fill-neutral-subtle',
    '--l-color-bg-disabled',
    '--l-focus-ring',
    '--l-size-control-xs',
    '--l-size-control-sm',
    '--l-size-control-md',
    '--l-size-control-lg',
    '--l-size-control-xl',
    '--radius-md',
    '--radius-full',
  ];
  tokens.value = vars.map((v) => `${v}: ${root.getPropertyValue(v).trim()};`).join('\n  ');
});

const srcdoc = computed(
  () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
:root {
  color-scheme: light dark;
  ${tokens.value}
}
${props.css}
html, body {
  margin: 0;
  height: 100%;
}
body {
  padding: 24px 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: transparent;
  color: light-dark(#172b4d, #e6edf3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
}
</style>
</head>
<body>${props.html}</body>
</html>`,
);
</script>

<template>
  <iframe
    :srcdoc="srcdoc"
    class="vp-raw component-wrapper bg-surface-sunken w-full border-0"
    scrolling="no"
    height="150"
  />
</template>
