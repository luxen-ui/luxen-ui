<script setup>
import DefaultTheme from 'vitepress/theme';
import Logo from '../components/Logo.vue';
import { version } from '../../../ui/package.json';
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-before>
      <Logo />
    </template>
    <template #nav-bar-title-after>
      <span class="vp-logo-version">v{{ version }}</span>
    </template>
  </DefaultTheme.Layout>
</template>

<style scoped>
.vp-logo-version {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  vertical-align: middle;
}
</style>
